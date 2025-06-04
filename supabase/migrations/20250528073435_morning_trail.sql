/*
  # Create users table and RLS policies

  1. New Tables
    - `users`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text, optional)
      - `role` (text, required)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `users` table
    - Add policy for authenticated users to read their own data
    - Add policy for admins to read all users
    - Add RLS policy on employees table for admin access
*/

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'logistics_specialist', 'driver', 'warehouse_worker')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data"
    ON public.users
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "Admins can read all users"
    ON public.users
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.users
            WHERE users.id = auth.uid()
              AND users.role = 'admin'
        )
    );

-- Enable RLS on employees table if not already enabled
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Enforce RLS so even super roles obey policies
ALTER TABLE public.employees FORCE ROW LEVEL SECURITY;

-- Create policy for admin access to employees table
CREATE POLICY "Admins have full access to employees"
    ON public.employees
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.users
            WHERE users.id = auth.uid()
              AND users.role = 'admin'
        )
    );

-- Create policy for users to read their own employee record
CREATE POLICY "Users can read own employee record"
    ON public.employees
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());