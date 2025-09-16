-- Add currency support to request_costs table
ALTER TABLE request_costs ADD COLUMN currency TEXT DEFAULT 'SYP';

-- Add currency preference to users table  
ALTER TABLE users ADD COLUMN preferred_currency TEXT DEFAULT 'SYP';

-- Update existing records to use SYP as default
UPDATE request_costs SET currency = 'SYP' WHERE currency IS NULL;
UPDATE users SET preferred_currency = 'SYP' WHERE preferred_currency IS NULL;
