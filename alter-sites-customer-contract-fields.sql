ALTER TABLE sites
ADD COLUMN IF NOT EXISTS customer_contract_date VARCHAR(255),
ADD COLUMN IF NOT EXISTS customer_contract_expiration_date VARCHAR(255);