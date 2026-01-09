import type { MeetResults, Event, Athlete, PDFSource } from './parsing_types';

// Configure PDF.js worker on module load
let workerConfigured = false;

async function configurePDFWorker() {
  if (workerConfigured) return;
  
  const { PDFParse } = await import('pdf-parse');
  
  // Set the worker source to use the CDN version
  PDFParse.setWorker('https://cdn.jsdelivr.net/npm/pdf-parse@latest/dist/pdf-parse/web/pdf.worker.mjs');
  
  workerConfigured = true;
}

/**
 * Parse track and field meet results from a PDF file
 * For use in browser with Vite-React
 * @param file - The PDF file to parse
 * @param source - The source of the PDF (e.g., 'world-athletics', 'usatf', 'other')
 */
export async function parseMeetResults(file: File, source?: PDFSource): Promise<MeetResults> {
  // Configure worker first
  await configurePDFWorker();
  
  // Dynamic import for pdf-parse (browser version)
  const { PDFParse } = await import('pdf-parse');
  
  // Read file as ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);
  
  // Initialize parser
  const parser = new PDFParse({ data: buffer });
  
  // Get text content
  const result = await parser.getText();
  await parser.destroy();
  
  const text = result.text;
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Parse meet header info
  const meetResults: MeetResults = {
    meetName: '',
    location: '',
    date: '',
    source: source || 'world-athletics', // Default to world-athletics for backward compatibility
    events: []
  };
  
  // Extract meet name, location, and date
  for (let i = 0; i < Math.min(15, lines.length); i++) {
    if (lines[i].includes('Grand Prix') || lines[i].includes('Championship') || lines[i].includes('Indoor')) {
      if (!meetResults.meetName) {
        meetResults.meetName = lines[i];
      }
    }
    if (lines[i].includes('Boston') || lines[i].match(/\([A-Z]{3}\)/)) {
      meetResults.location = lines[i];
    }
    if (lines[i].match(/\d{2}\s+[A-Z]{3}\s+\d{4}/)) {
      meetResults.date = lines[i];
    }
  }
  
  // Parse events
  let currentEvent: Event | null = null;
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    
    // Detect event category
    if (line.includes('World Athletics Indoor Tour') || 
        line.includes('Indoor Meeting') || 
        line.includes('U20 Events') ||
        line.includes('Split times')) {
      if (currentEvent && currentEvent.athletes.length > 0) {
        meetResults.events.push(currentEvent);
      }
      
      currentEvent = {
        eventName: '',
        category: line,
        athletes: []
      };
      i++;
      continue;
    }
    
    // Detect event name (Men's/Women's + discipline)
    if (line.match(/^(Men's|Women's)\s+/)) {
      if (currentEvent) {
        currentEvent.eventName = line;
      }
      i++;
      continue;
    }
    
    // Detect round type
    if (line === 'Final' || line.match(/^Round \d+/) || line.includes('Heat')) {
      if (currentEvent) {
        currentEvent.round = line;
      }
      i++;
      continue;
    }
    
    // Skip table headers and other metadata
    if (line.includes('PLACE') || 
        line.includes('NAME') || 
        line.includes('BIRTH DATE') ||
        line.includes('MARK') ||
        line === 'A' ||
        line.includes('Select discipline') ||
        line.includes('Day 1')) {
      i++;
      continue;
    }
    
    // Parse athlete results
    // Pattern: "1. Name SURNAME DD MMM YYYY COUNTRY TIME/MARK"
    const athleteMatch = line.match(/^(\d+)\.\s+(.+?)\s+(\d{2}\s+[A-Z]{3}\s+\d{4})\s+([A-Z]{3})\s+([\d:.]+|DNF|DNS|NM)(\s+(.+))?$/);
    
    if (athleteMatch && currentEvent) {
      const athlete: Athlete = {
        place: parseInt(athleteMatch[1]),
        name: athleteMatch[2].trim(),
        birthDate: athleteMatch[3],
        country: athleteMatch[4],
        mark: athleteMatch[5],
        records: athleteMatch[7] || undefined
      };
      currentEvent.athletes.push(athlete);
    }
    
    i++;
  }
  
  // Add last event
  if (currentEvent && currentEvent.athletes.length > 0) {
    meetResults.events.push(currentEvent);
  }
  
  return meetResults;
}

/**
 * Alternative parser using table extraction
 * @param file - The PDF file to parse
 * @param source - The source of the PDF (e.g., 'world-athletics', 'usatf', 'other')
 */
export async function parseMeetResultsWithTables(file: File, source?: PDFSource): Promise<MeetResults> {
  // Configure worker first
  await configurePDFWorker();
  
  const { PDFParse } = await import('pdf-parse');
  
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);
  
  const parser = new PDFParse({ data: buffer });
  
  // Extract both text and tables
  const [textResult, tableResult] = await Promise.all([
    parser.getText(),
    parser.getTable()
  ]);
  
  await parser.destroy();
  
  const meetResults: MeetResults = {
    meetName: '',
    location: '',
    date: '',
    source: source || 'world-athletics', // Default to world-athletics for backward compatibility
    events: []
  };
  
  // Extract basic info from text
  const lines = textResult.text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  for (let i = 0; i < Math.min(15, lines.length); i++) {
    if ((lines[i].includes('Grand Prix') || lines[i].includes('Championship')) && !meetResults.meetName) {
      meetResults.meetName = lines[i];
    }
    if (lines[i].match(/\([A-Z]{3}\)/) && !meetResults.location) {
      meetResults.location = lines[i];
    }
    if (lines[i].match(/\d{2}\s+[A-Z]{3}\s+\d{4}/) && !meetResults.date) {
      meetResults.date = lines[i];
    }
  }
  
  // Process tables from all pages
  for (const page of tableResult.pages) {
    for (const table of page.tables) {
      if (table.length > 1) {
        const event = parseEventFromTable(table);
        if (event) {
          meetResults.events.push(event);
        }
      }
    }
  }
  
  return meetResults;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseEventFromTable(table: any[][]): Event | null {
  const event: Event = {
    eventName: '',
    category: '',
    athletes: []
  };
  
  // Skip if table is too small
  if (table.length < 2) return null;
  
  // Process each row (skip header)
  for (let i = 1; i < table.length; i++) {
    const row = table[i];
    
    if (row.length >= 4) {
      const placeStr = String(row[0] || '').trim();
      const placeMatch = placeStr.match(/^(\d+)/);
      
      if (placeMatch) {
        const athlete: Athlete = {
          place: parseInt(placeMatch[1]),
          name: String(row[1] || '').trim(),
          birthDate: String(row[2] || '').trim(),
          country: String(row[3] || '').trim(),
          mark: String(row[4] || '').trim()
        };
        
        event.athletes.push(athlete);
      }
    }
  }
  
  return event.athletes.length > 0 ? event : null;
}

/**
 * Format time/mark for display
 */
export function formatMark(mark: string): string {
  if (mark === 'DNF') return 'Did Not Finish';
  if (mark === 'DNS') return 'Did Not Start';
  if (mark === 'NM') return 'No Mark';
  return mark;
}

/**
 * Get event type (sprint, distance, field, hurdles)
 */
export function getEventType(eventName: string): string {
  if (eventName.includes('Metres') && !eventName.includes('Hurdles')) {
    const match = eventName.match(/(\d+)\s+Metres/);
    if (match) {
      const distance = parseInt(match[1]);
      if (distance <= 400) return 'sprint';
      if (distance <= 1500) return 'middle-distance';
      return 'distance';
    }
  }
  if (eventName.includes('Hurdles')) return 'hurdles';
  if (eventName.includes('Jump') || eventName.includes('Throw')) return 'field';
  if (eventName.includes('Mile')) return 'distance';
  return 'other';
}