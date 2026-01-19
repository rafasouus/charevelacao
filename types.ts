export enum Gender {
  BOY = 'BOY',
  GIRL = 'GIRL'
}

export interface Vote {
  id: string;
  name: string;
  guess: Gender;
  timestamp: string;
  aiMessage?: string;
}

export interface StatData {
  name: string;
  value: number;
  fill: string;
}