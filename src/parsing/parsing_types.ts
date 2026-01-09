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

/**
 * Supported PDF sources for meet results
 * Different sources may have different formatting which requires different parsing strategies
 */
export type PDFSource = 'world-athletics' | 'usatf' | 'other';

export interface MeetResults {
  meetName: string;
  location: string;
  date: string;
  source?: PDFSource; // Source of the PDF (e.g., 'world-athletics', 'usatf', 'other')
  events: Event[];
}