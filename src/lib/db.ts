import Dexie, { type Table } from 'dexie';

export interface Document {
  id: string;
  tenant_id: string;
  filename: string;
  processing_status: string;
  industry?: string;
  category?: string;
  created_at: string;
  updated_at: string;
  content_preview?: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  tenant_id: string;
  full_name?: string;
}

export interface ApiCacheEntry {
  key: string;
  data: any;
  timestamp: number;
}

export class AppDatabase extends Dexie {
  documents!: Table<Document>;
  chatMessages!: Table<ChatMessage>;
  userProfile!: Table<UserProfile>;
  apiCache!: Table<ApiCacheEntry>;

  constructor() {
    super('AppDatabase');
    this.version(1).stores({
      documents: 'id, tenant_id, processing_status, industry',
      chatMessages: 'id, conversation_id, timestamp',
      userProfile: 'id, email, tenant_id'
    });
    this.version(2).stores({
      apiCache: '&key, timestamp'
    });
  }
}

export const db = new AppDatabase();
