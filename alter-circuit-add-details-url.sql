-- Add circuitDetailsUrl column to circuits table
ALTER TABLE circuits ADD COLUMN circuit_details_url VARCHAR(500) DEFAULT NULL;
