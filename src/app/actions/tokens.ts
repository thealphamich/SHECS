'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function loadToken(tokenCode: string) {
    const supabase = await createClient()

    // 1. Get user and their meter
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { data: meter, error: meterError } = await supabase
        .from('meters')
        .select('*')
        .eq('user_id', user.id)
        .single()

    if (meterError || !meter) return { error: 'No meter found for this user' }

    // 2. Validate token
    const { data: token, error: tokenError } = await supabase
        .from('tokens')
        .select('*')
        .eq('token_code', tokenCode)
        .single()

    if (tokenError || !token) return { error: 'Invalid token code' }
    if (token.status === 'used') return { error: 'Token has already been used' }

    // 3. Update balance and status
    const newBalance = parseFloat(meter.balance_kwh) + parseFloat(token.amount_kwh)
    const newStatus = newBalance > 0 ? 'ON' : meter.status

    const { error: updateMeterError } = await supabase
        .from('meters')
        .update({
            balance_kwh: newBalance,
            status: newStatus,
        })
        .eq('id', meter.id)

    if (updateMeterError) return { error: 'Failed to update meter' }

    // 4. Mark token as used
    await supabase
        .from('tokens')
        .update({
            status: 'used',
            used_at: new Date().toISOString(),
            meter_id: meter.id // Associate used token with the meter
        })
        .eq('id', token.id)

    // 5. Log alert
    await supabase.from('alerts').insert({
        meter_id: meter.id,
        type: 'TOKEN_LOADED',
        message: `Successfully loaded ${token.amount_kwh} kWh. New balance: ${newBalance.toFixed(2)} kWh.`,
    })

    revalidatePath('/dashboard')
    return { success: true, amount: token.amount_kwh }
}

export async function createToken(amount: number) {
    const supabase = await createClient()

    // Verify admin role
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single()

    if (profile?.role !== 'admin') return { error: 'Unauthorized' }

    // Generate a 20-digit STS standard numeric token
    const tokenCode = Array.from({ length: 5 }, () =>
        Math.floor(1000 + Math.random() * 9000).toString()
    ).join('')

    const { data, error } = await supabase
        .from('tokens')
        .insert({
            token_code: tokenCode,
            amount_kwh: amount,
            status: 'unused',
        })
        .select()
        .single()

    if (error) return { error: error.message }

    revalidatePath('/admin')
    return { success: true, token: data }
}
