/**
 * RURA 2025 Tariff Calculator
 * Handles both forward (RWF → kWh) and reverse (kWh → RWF) calculations
 */

const VAT_RATE = 0.18

export interface TariffTier {
    min: number
    max: number
    price: number
}

export const RESIDENTIAL_TIERS: TariffTier[] = [
    { min: 0, max: 20, price: 89 },      // Lifeline
    { min: 20, max: 50, price: 310 },    // Tier 2
    { min: 50, max: 999999, price: 369 } // Standard
]

export const COMMERCIAL_TIERS: TariffTier[] = [
    { min: 0, max: 100, price: 355 },
    { min: 100, max: 999999, price: 376 }
]

/**
 * Calculate kWh from RWF (Forward calculation - used in top-ups)
 */
export function calculateKwhFromRwf(
    amountPaid: number,
    currentMonthlyUsage: number,
    category: 'residential' | 'commercial' = 'residential'
): { kwh: number; taxes: number } {
    let moneyRemaining = amountPaid / (1 + VAT_RATE)
    const taxes = amountPaid - moneyRemaining
    let kwh = 0
    let tempUsage = currentMonthlyUsage

    const tiers = category === 'residential' ? RESIDENTIAL_TIERS : COMMERCIAL_TIERS

    for (const tier of tiers) {
        if (moneyRemaining <= 0) break
        if (tempUsage < tier.max) {
            const availableInTier = tier.max - tempUsage
            const costForFullTier = availableInTier * tier.price

            if (moneyRemaining >= costForFullTier) {
                kwh += availableInTier
                moneyRemaining -= costForFullTier
                tempUsage += availableInTier
            } else {
                kwh += moneyRemaining / tier.price
                moneyRemaining = 0
            }
        }
    }

    return { kwh, taxes }
}

/**
 * Calculate RWF value from kWh balance (Reverse calculation - for display)
 * This estimates how much the remaining kWh would cost to purchase
 */
export function calculateRwfFromKwh(
    kwhBalance: number,
    currentMonthlyUsage: number,
    category: 'residential' | 'commercial' = 'residential'
): number {
    if (kwhBalance <= 0) return 0

    const tiers = category === 'residential' ? RESIDENTIAL_TIERS : COMMERCIAL_TIERS
    let rwfValue = 0
    let remainingKwh = kwhBalance
    let tempUsage = currentMonthlyUsage

    // Calculate tier-by-tier from current position
    for (const tier of tiers) {
        if (remainingKwh <= 0) break

        if (tempUsage < tier.max) {
            const availableInTier = tier.max - tempUsage
            const kwhInThisTier = Math.min(remainingKwh, availableInTier)

            rwfValue += kwhInThisTier * tier.price
            remainingKwh -= kwhInThisTier
            tempUsage += kwhInThisTier
        }
    }

    // Add VAT
    return rwfValue * (1 + VAT_RATE)
}

/**
 * Get current tariff tier information
 */
export function getCurrentTier(
    monthlyUsage: number,
    category: 'residential' | 'commercial' = 'residential'
): { name: string; price: number; tierIndex: number } {
    const tiers = category === 'residential' ? RESIDENTIAL_TIERS : COMMERCIAL_TIERS

    for (let i = 0; i < tiers.length; i++) {
        const tier = tiers[i]
        if (monthlyUsage >= tier.min && monthlyUsage < tier.max) {
            const tierNames = category === 'residential'
                ? ['Lifeline (89 RWF)', 'Tier 2 (310 RWF)', 'Standard (369 RWF)']
                : ['Tier 1 (355 RWF)', 'Tier 2 (376 RWF)']

            return {
                name: tierNames[i],
                price: tier.price,
                tierIndex: i
            }
        }
    }

    return {
        name: 'Standard',
        price: tiers[tiers.length - 1].price,
        tierIndex: tiers.length - 1
    }
}
