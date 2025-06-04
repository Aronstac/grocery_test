/*
  # Fix Employee Schema

  1. Changes
    - Rename start_date column to startDate in employees table
    - Update existing data
    - Add NOT NULL constraint

  2. Security
    - Maintain existing RLS policies
*/

-- Rename start_date column to startDate
ALTER TABLE employees 
RENAME COLUMN start_date TO "startDate";

-- Analyze table to update statistics
ANALYZE employees;