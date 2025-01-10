/*
  # Add chat platform support

  1. Changes
    - Add platform-specific fields to chat_contexts
    - Add indexes for better query performance
*/

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS chat_contexts_platform_idx ON chat_contexts(platform);
CREATE INDEX IF NOT EXISTS chat_messages_created_at_desc_idx ON chat_messages(created_at DESC);

-- Add function to get chat history
CREATE OR REPLACE FUNCTION get_chat_history(
  p_context_id uuid,
  p_limit integer DEFAULT 10
)
RETURNS TABLE (
  content text,
  is_ai_response boolean,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cm.content,
    cm.is_ai_response,
    cm.created_at
  FROM chat_messages cm
  WHERE cm.context_id = p_context_id
  ORDER BY cm.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;