// Type definitions for track and field meet results

export interface Athlete {
  place: number;
  name: string;
  birthDate: string;
  country: string;
  mark: string;
  records?: string;
}

export interface Event {
  eventName: string;
  category: string; // "World Athletics Indoor Tour - A", "Indoor Meeting - A", etc.
  round?: string; // "Final", "Round 1 - Heat 1", etc.
  athletes: Athlete[];
}

export interface MeetResults {
  meetName: string;
  location: string;
  date: string;
  events: Event[];
}