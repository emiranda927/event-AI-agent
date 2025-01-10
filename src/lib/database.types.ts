export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          name: string
          date: string
          start_time: string
          end_time: string | null
          location_name: string
          location_address: string
          location_map_link: string | null
          parking_instructions: string | null
          dress_code: string | null
          gift_registry_link: string | null
          ai_tone: string
          response_style: string
          active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          name: string
          date: string
          start_time: string
          end_time?: string | null
          location_name: string
          location_address: string
          location_map_link?: string | null
          parking_instructions?: string | null
          dress_code?: string | null
          gift_registry_link?: string | null
          ai_tone?: string
          response_style?: string
          active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          name?: string
          date?: string
          start_time?: string
          end_time?: string | null
          location_name?: string
          location_address?: string
          location_map_link?: string | null
          parking_instructions?: string | null
          dress_code?: string | null
          gift_registry_link?: string | null
          ai_tone?: string
          response_style?: string
          active?: boolean
        }
      }
      chat_contexts: {
        Row: {
          id: string
          event_id: string
          platform: string
          chat_id: string
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          platform: string
          chat_id: string
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          platform?: string
          chat_id?: string
          created_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          context_id: string
          content: string
          sender_id: string
          is_ai_response: boolean
          created_at: string
        }
        Insert: {
          id?: string
          context_id: string
          content: string
          sender_id: string
          is_ai_response?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          context_id?: string
          content?: string
          sender_id?: string
          is_ai_response?: boolean
          created_at?: string
        }
      }
      unanswered_questions: {
        Row: {
          id: string
          event_id: string
          question: string
          context: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          question: string
          context?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          question?: string
          context?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      get_chat_history: {
        Args: {
          p_context_id: string
          p_limit?: number
        }
        Returns: {
          content: string
          is_ai_response: boolean
          created_at: string
        }[]
      }
    }
  }
}