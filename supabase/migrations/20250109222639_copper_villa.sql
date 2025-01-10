/*
  # AI Agent Messaging System

  1. New Tables
    - `chat_messages`
      - Stores all messages from group chats
      - Tracks message content, sender, and context
    - `chat_contexts` 
      - Stores active chat contexts/threads
      - Links messages to specific events
    - `unanswered_questions`
      - Tracks questions the AI couldn't answer
      - Helps hosts improve event FAQs

  2. Security
    - Enable RLS on all new tables
    - Add policies for event owners
*/

-- Chat contexts table
CREATE TABLE chat_contexts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('sms', 'imessage', 'whatsapp')),
  chat_id text NOT NULL, -- Platform-specific chat/group ID
  created_at timestamptz DEFAULT now(),
  UNIQUE(platform, chat_id)
);

-- Chat messages table
CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  context_id uuid REFERENCES chat_contexts(id) ON DELETE CASCADE,
  content text NOT NULL,
  sender_id text NOT NULL, -- Platform-specific sender ID
  is_ai_response boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Unanswered questions table
CREATE TABLE unanswered_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  question text NOT NULL,
  context text, -- Additional context from the conversation
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'ignored')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE chat_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE unanswered_questions ENABLE ROW LEVEL SECURITY;

-- Policies for chat_contexts
CREATE POLICY "Users can manage chat contexts for their events"
  ON chat_contexts FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM events WHERE events.id = chat_contexts.event_id AND events.user_id = auth.uid()
  ));

-- Policies for chat_messages
CREATE POLICY "Users can manage chat messages for their events"
  ON chat_messages FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM chat_contexts 
    JOIN events ON events.id = chat_contexts.event_id 
    WHERE chat_contexts.id = chat_messages.context_id 
    AND events.user_id = auth.uid()
  ));

-- Policies for unanswered_questions
CREATE POLICY "Users can manage unanswered questions for their events"
  ON unanswered_questions FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM events WHERE events.id = unanswered_questions.event_id AND events.user_id = auth.uid()
  ));