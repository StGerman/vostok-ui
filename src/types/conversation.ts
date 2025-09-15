export interface ConversationSession {
  id: string;
  title: string;
  created_at: Date;
  updated_at: Date;
  message_count: number;
  total_tokens_used: number;
  status: 'active' | 'archived' | 'deleted';
}

export interface ConversationMetadata {
  conversation_id: string;
  user_id?: string;
  session_duration_ms: number;
  average_response_time_ms: number;
  total_cost_cents?: number;
}
