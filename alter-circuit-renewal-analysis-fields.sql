ALTER TABLE circuits
ADD COLUMN IF NOT EXISTS renewal_circuit_expiration_date VARCHAR(255),
ADD COLUMN IF NOT EXISTS renewal_monthly_cost DOUBLE,
ADD COLUMN IF NOT EXISTS savings_difference DOUBLE,
ADD COLUMN IF NOT EXISTS months_to_customer_contract_expiration INT,
ADD COLUMN IF NOT EXISTS savings_until_customer_contract_expiration DOUBLE,
ADD COLUMN IF NOT EXISTS cost_from_customer_expiration_to_renewal_expiration DOUBLE;