/*
  # Fix Chat Tables Migration

  1. Changes
    - Safely check for existing tables before creating new ones
    - Handle potential conflicts with existing tables
    - Preserve existing data
    - Add missing indexes for performance

  2. Security
    - Maintain existing RLS policies
    - Add missing indexes for foreign keys
*/

-- Safely handle chat_contexts table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'chat_contexts'
  ) THEN
    CREATE TABLE chat_contexts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id uuid REFERENCES events(id) ON DELETE CASCADE,
      platform text NOT NULL CHECK (platform IN ('sms', 'imessage', 'whatsapp')),
      chat_id text NOT NULL,
      created_at timestamptz DEFAULT now()
    );

    CREATE UNIQUE INDEX chat_contexts_platform_chat_id_idx ON chat_contexts(platform, chat_id);
    CREATE INDEX chat_contexts_event_id_idx ON chat_contexts(event_id);

    ALTER TABLE chat_contexts ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can manage chat contexts for their events"
      ON chat_contexts FOR ALL TO authenticated
      USING (EXISTS (
        SELECT 1 FROM events WHERE events.id = chat_contexts.event_id AND events.user_id = auth.uid()
      ));
  END IF;
END $$;

-- Safely handle chat_messages table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'chat_messages'
  ) THEN
    CREATE TABLE chat_messages (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      context_id uuid REFERENCES chat_contexts(id) ON DELETE CASCADE,
      content text NOT NULL,
      sender_id text NOT NULL,
      is_ai_response boolean DEFAULT false,
      created_at timestamptz DEFAULT now()
    );

    CREATE INDEX chat_messages_context_id_idx ON chat_messages(context_id);
    CREATE INDEX chat_messages_created_at_idx ON chat_messages(created_at);

    ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can manage chat messages for their events"
      ON chat_messages FOR ALL TO authenticated
      USING (EXISTS (
        SELECT 1 FROM chat_contexts 
        JOIN events ON events.id = chat_contexts.event_id 
        WHERE chat_contexts.id = chat_messages.context_id 
        AND events.user_id = auth.uid()
      ));
  END IF;
END $$;

-- Safely handle unanswered_questions table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'unanswered_questions'
  ) THEN
    CREATE TABLE unanswered_questions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id uuid REFERENCES events(id) ON DELETE CASCADE,
      question text NOT NULL,
      context text,
      status text DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'ignored')),
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    CREATE INDEX unanswered_questions_event_id_idx ON unanswered_questions(event_id);
    CREATE INDEX unanswered_questions_status_idx ON unanswered_questions(status);

    ALTER TABLE unanswered_questions ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can manage unanswered questions for their events"
      ON unanswered_questions FOR ALL TO authenticated
      USING (EXISTS (
        SELECT 1 FROM events WHERE events.id = unanswered_questions.event_id AND events.user_id = auth.uid()
      ));
  END IF;
END $$;