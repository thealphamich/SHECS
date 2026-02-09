-- Update all meters to have status 'ON'
UPDATE public.meters
SET status = 'ON'
WHERE status = 'OFF';

-- Note: This is a safe operation if you want all meters to be ON by default.
-- Users can still theoretically be turned OFF if we implement that feature,
-- but for now this fixes the "System is OFF" complaint for existing meters.
