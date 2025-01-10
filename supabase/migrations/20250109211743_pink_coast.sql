/*
  # Initial Schema for AI Event Agent

  1. New Tables
    - `events`
      - Core event information including name, date, time, location
      - Customization settings for AI responses
    - `event_schedules`
      - Timeline of activities for each event
    - `guests`
      - Guest information and RSVP status
    - `faqs`
      - Custom FAQ entries for each event
    - `emergency_contacts`
      - Emergency contact information for events
    
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own events
    - Add policies for reading event data
*/

-- Events table
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id),
  name text NOT NULL,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time,
  location_name text NOT NULL,
  location_address text NOT NULL,
  location_map_link text,
  parking_instructions text,
  dress_code text,
  gift_registry_link text,
  ai_tone text DEFAULT 'formal' CHECK (ai_tone IN ('formal', 'casual', 'humorous')),
  response_style text DEFAULT 'detailed' CHECK (response_style IN ('detailed', 'brief')),
  active boolean DEFAULT true
);

-- Event schedules table
CREATE TABLE event_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  activity_name text NOT NULL,
  start_time time NOT NULL,
  end_time time,
  description text,
  location_detail text,
  created_at timestamptz DEFAULT now()
);

-- Guests table
CREATE TABLE guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone_number text,
  email text,
  rsvp_status text DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'confirmed', 'declined')),
  dietary_restrictions text,
  plus_one boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- FAQs table
CREATE TABLE faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Emergency contacts table
CREATE TABLE emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL,
  phone_number text NOT NULL,
  email text,
  primary_contact boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Policies for events
CREATE POLICY "Users can create their own events"
  ON events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own events"
  ON events FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own events"
  ON events FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events"
  ON events FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Policies for event_schedules
CREATE POLICY "Users can manage schedules for their events"
  ON event_schedules FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM events WHERE events.id = event_schedules.event_id AND events.user_id = auth.uid()
  ));

-- Policies for guests
CREATE POLICY "Users can manage guests for their events"
  ON guests FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM events WHERE events.id = guests.event_id AND events.user_id = auth.uid()
  ));

-- Policies for faqs
CREATE POLICY "Users can manage FAQs for their events"
  ON faqs FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM events WHERE events.id = faqs.event_id AND events.user_id = auth.uid()
  ));

-- Policies for emergency_contacts
CREATE POLICY "Users can manage emergency contacts for their events"
  ON emergency_contacts FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM events WHERE events.id = emergency_contacts.event_id AND events.user_id = auth.uid()
  ));

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_guests_updated_at
  BEFORE UPDATE ON guests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();