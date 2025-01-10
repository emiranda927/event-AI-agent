/*
  # Add SMS functionality

  1. New Tables
    - `sms_messages`
      - `id` (uuid, primary key)
      - `event_id` (uuid, references events)
      - `guest_id` (uuid, references guests)
      - `phone_number` (text)
      - `message` (text)
      - `direction` (text, inbound/outbound)
      - `status` (text)
      - `created_at` (timestamp)
    - `sms_settings`
      - `id` (uuid, primary key)
      - `event_id` (uuid, references events)
      - `enabled` (boolean)
      - `welcome_message` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Changes
    - Add `phone_number` column to guests table
    - Add `sms_enabled` column to guests table

  3. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Add phone_number to guests
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'guests' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE guests ADD COLUMN phone_number text;
    ALTER TABLE guests ADD COLUMN sms_enabled boolean DEFAULT false;
  END IF;
END $$;

-- SMS Messages table
CREATE TABLE IF NOT EXISTS sms_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  guest_id uuid REFERENCES guests(id),
  phone_number text NOT NULL,
  message text NOT NULL,
  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  created_at timestamptz DEFAULT now()
);

-- SMS Settings table
CREATE TABLE IF NOT EXISTS sms_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE UNIQUE,
  enabled boolean DEFAULT false,
  welcome_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_settings ENABLE ROW LEVEL SECURITY;

-- Policies for sms_messages
CREATE POLICY "Users can manage SMS messages for their events"
  ON sms_messages FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM events WHERE events.id = sms_messages.event_id AND events.user_id = auth.uid()
  ));

-- Policies for sms_settings
CREATE POLICY "Users can manage SMS settings for their events"
  ON sms_settings FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM events WHERE events.id = sms_settings.event_id AND events.user_id = auth.uid()
  ));