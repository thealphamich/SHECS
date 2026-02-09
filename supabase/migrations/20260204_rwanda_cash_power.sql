-- RWANDA CASH POWER MODEL SCHEMA

-- 1. Tariffs Table
CREATE TABLE IF NOT EXISTS public.tariffs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL, -- RWF per kWh
    fixed_charge NUMERIC(10, 2) DEFAULT 0, -- Monthly or per transaction fee
    tax_rate NUMERIC(5, 2) DEFAULT 18.00, -- VAT %
    regulatory_fee NUMERIC(10, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for tariffs
ALTER TABLE public.tariffs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active tariffs" ON public.tariffs
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage tariffs" ON public.tariffs
    FOR ALL USING (public.is_admin());

-- 2. Update Topups Table for dynamic tracking
ALTER TABLE public.topups ADD COLUMN IF NOT EXISTS tariff_id UUID REFERENCES public.tariffs(id);
ALTER TABLE public.topups ADD COLUMN IF NOT EXISTS unit_price_at_purchase NUMERIC(10, 2);
ALTER TABLE public.topups ADD COLUMN IF NOT EXISTS taxes_paid NUMERIC(10, 2);
ALTER TABLE public.topups ADD COLUMN IF NOT EXISTS token_id UUID REFERENCES public.tokens(id);

-- 3. Update Tokens for 20-digit support (Standard STS is 20 digits)
-- Note: token_code is already TEXT, so it supports 20 digits.

-- 4. Seed a default Residential Tariff
INSERT INTO public.tariffs (name, unit_price, fixed_charge, tax_rate, regulatory_fee, is_active)
VALUES ('Residential Standard', 212.00, 0, 18.00, 0, true)
ON CONFLICT DO NOTHING;
