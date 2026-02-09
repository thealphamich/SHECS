'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function simulateConsumption() {
    const supabase = await createClient()

    // 1. Fetch all meters
    const { data: meters, error: metersError } = await supabase
        .from('meters')
        .select('*')

    if (metersError) {
        return { error: metersError.message }
    }

    for (const meter of meters) {
        if (meter.status === 'OFF' && meter.balance_kwh <= 0) continue

        // Simulate consumption values
        const consumption = 0.05 // kWh per simulation step
        const newBalance = Math.max(0, parseFloat(meter.balance_kwh) - consumption)
        const newEnergy = parseFloat(meter.energy_kwh) + consumption
        const voltage = 220 + Math.random() * 20 // 220V - 240V
        const current = Math.random() * 5 // 0A - 5A
        const power = (voltage * current) / 1000 // kW

        let newStatus = meter.status

        // 2. Insert reading
        await supabase.from('readings').insert({
            meter_id: meter.id,
            voltage,
            current,
            power,
            energy_kwh: newEnergy,
            balance_kwh: newBalance,
        })

        // 3. Check for alerts
        if (newBalance <= parseFloat(meter.low_threshold_kwh) && newBalance > 0 && meter.status === 'ON') {
            await supabase.from('alerts').insert({
                meter_id: meter.id,
                type: 'LOW_BALANCE',
                message: `Your balance is low (${newBalance.toFixed(2)} kWh remaining). Please top up soon.`,
            })
        }

        if (newBalance <= 0 && meter.status === 'ON') {
            newStatus = 'OFF'
            await supabase.from('alerts').insert({
                meter_id: meter.id,
                type: 'POWER_OFF',
                message: 'Your balance has run out. Power has been disconnected.',
            })
        }

        // 4. Update meter
        await supabase
            .from('meters')
            .update({
                balance_kwh: newBalance,
                energy_kwh: newEnergy,
                status: newStatus,
            })
            .eq('id', meter.id)
    }

    revalidatePath('/dashboard')
    revalidatePath('/admin')
    return { success: true }
}
