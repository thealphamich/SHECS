'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function registerMeter(data: {
    meter_code: string;
    block: string;
    house_unit: string;
    category: string;
    balance_kwh?: number;
    balance_rwf?: number;
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase.from('meters').insert({
        meter_code: data.meter_code,
        block: data.block,
        house_unit: data.house_unit,
        category: data.category,
        user_id: user.id,
        balance_kwh: data.balance_kwh || 0,
        energy_kwh: 0,
        status: 'ON' // Default to ON
    })

    if (error) throw error

    // If initial balance in RWF provided, record it as a transaction (TopUp)
    if (data.balance_rwf && data.balance_rwf > 0) {
        // Generate pseudo-token
        const token = Array.from({ length: 5 }, () =>
            Math.floor(1000 + Math.random() * 9000).toString()
        ).join('')

        // Get the meter ID we just created
        const { data: meter } = await supabase.from('meters').select('id, meter_code').eq('meter_code', data.meter_code).single()

        if (meter) {
            await supabase.from('topups').insert({
                meter_id: meter.id,
                amount_paid: data.balance_rwf,
                kwh_bought: data.balance_kwh || 0,
                token_code: token
            })

            // Create notification for Admin
            await supabase.from('notifications').insert({
                type: 'new_meter',
                title: 'New Meter Registered',
                message: `Meter ${data.meter_code} registered with initial balance of ${data.balance_rwf} RWF`,
                link: `/admin/insights`
            })
        }
    } else {
        // Just notify about the meter
        await supabase.from('notifications').insert({
            type: 'new_meter',
            title: 'New Meter Registered',
            message: `Meter ${data.meter_code} registered`,
            link: `/admin/insights`
        })
    }

    revalidatePath('/dashboard')
    revalidatePath('/admin')
}

export async function performTopUp({ meter_id, amount_paid }: { meter_id: string; amount_paid: number }) {
    const supabase = await createClient()

    // 1. Get meter and current usage
    const { data: meter, error: meterError } = await supabase
        .from('meters')
        .select('*')
        .eq('id', meter_id)
        .single()

    if (meterError || !meter) throw new Error('Meter not found')

    // 2. Tiered Calculation Engine (RURA 2025 Model)
    const VAT_RATE = 0.18
    let moneyRemaining = amount_paid / (1 + VAT_RATE)
    const taxesPaid = amount_paid - moneyRemaining
    let unitsToAdd = 0
    let tempUsage = Number(meter.monthly_units_bought || 0)

    const tiers = meter.category === 'commercial'
        ? [{ min: 0, max: 100, price: 355 }, { min: 100, max: 999999, price: 376 }]
        : [{ min: 0, max: 20, price: 89 }, { min: 20, max: 50, price: 310 }, { min: 50, max: 999999, price: 369 }]

    for (const tier of tiers) {
        if (moneyRemaining <= 0) break
        if (tempUsage < tier.max) {
            const availableInTier = tier.max - tempUsage
            const costForFullTier = availableInTier * tier.price
            if (moneyRemaining >= costForFullTier) {
                unitsToAdd += availableInTier
                moneyRemaining -= costForFullTier
                tempUsage += availableInTier
            } else {
                unitsToAdd += moneyRemaining / tier.price
                moneyRemaining = 0
            }
        }
    }

    // 3. Update DB
    const newBalance = Number(meter.balance_kwh) + unitsToAdd

    const { error: updateError } = await supabase
        .from('meters')
        .update({
            balance_kwh: newBalance,
            monthly_units_bought: tempUsage,
            status: 'ON'
        })
        .eq('id', meter_id)

    if (updateError) throw updateError

    // 4. Generate 20-digit STS Token
    const token = Array.from({ length: 5 }, () =>
        Math.floor(1000 + Math.random() * 9000).toString()
    ).join('')

    // 5. Save Topup record
    await supabase.from('topups').insert({
        meter_id,
        amount_paid,
        kwh_bought: unitsToAdd,
        token_code: token
    })

    revalidatePath('/dashboard')
    revalidatePath('/admin')

    return {
        token,
        kwh: unitsToAdd.toFixed(2),
        taxes: taxesPaid.toFixed(2)
    }
}

export async function getAdminTrackingData() {
    const supabase = await createClient()

    const { data: meters } = await supabase
        .from('meters')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false })

    const { data: topups } = await supabase
        .from('topups')
        .select('*, meters(meter_code, profiles(full_name))')
        .order('created_at', { ascending: false })

    const { data: alerts } = await supabase
        .from('alerts')
        .select('*, meters(meter_code)')
        .order('created_at', { ascending: false })

    return {
        meters: meters || [],
        topups: topups || [],
        alerts: alerts || []
    }
}

export async function updateMeterBalance(meterId: string, newBalance: number) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('meters')
        .update({ balance_kwh: newBalance })
        .eq('id', meterId)

    if (error) throw error

    if (newBalance <= 10) {
        // Create notification for Admin about low balance
        const { data: meter } = await supabase.from('meters').select('meter_code').eq('id', meterId).single()
        if (meter) {
            await supabase.from('notifications').insert({
                type: 'alert',
                title: 'Low Balance Warning',
                message: `Meter ${meter.meter_code} is low on credit (${newBalance} kWh)`,
                link: `/admin/insights`
            })
            // Try to insert into alerts table if it exists
            try {
                await supabase.from('alerts').insert({
                    meter_id: meterId,
                    type: 'LOW_BALANCE',
                    message: `Balance dropped to ${newBalance.toFixed(1)} kWh`,
                    is_resolved: false
                })
            } catch (e) {
                // ignore
            }
        }
    }

    revalidatePath('/admin/tracking')
    revalidatePath('/dashboard')
}
