export interface Session {
  id: string;
  startTime: number;
  endTime: number;
  duration: number; // in seconds
  note: string; // What did they talk about?
  date: string; // ISO Date string YYYY-MM-DD
}

export interface DailyStat {
  date: string;
  totalSeconds: number;
  count: number;
  minutes: number;
  fullDate: string;
}

export enum ViewState {
  TRACKER = 'TRACKER',
  DASHBOARD = 'DASHBOARD',
  HISTORY = 'HISTORY'
}