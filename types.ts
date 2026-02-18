export interface Source {
  title: string;
  uri: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  sources?: Source[];
  isThinking?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  date: Date;
}

export enum TaxCategory {
  DEDUCTIONS = 'Deductions & Credits',
  FILING = 'Filing Status',
  FORMS = 'Forms & Instructions',
  DEADLINES = 'Dates & Deadlines',
  AUDITS = 'Audits & Notices'
}