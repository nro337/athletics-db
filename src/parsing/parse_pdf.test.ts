import { describe, it, expect, vi } from 'vitest';
import { formatMark, getEventType } from './parse_pdf';

// Mock pdf-parse module
vi.mock('pdf-parse', () => ({
  PDFParse: vi.fn().mockImplementation(() => ({
    getText: vi.fn(),
    getTable: vi.fn(),
    destroy: vi.fn(),
  })),
  default: {
    setWorker: vi.fn(),
  },
}));

describe('pdfParser', () => {
  describe('formatMark', () => {
    it('should format DNF as "Did Not Finish"', () => {
      expect(formatMark('DNF')).toBe('Did Not Finish');
    });

    it('should format DNS as "Did Not Start"', () => {
      expect(formatMark('DNS')).toBe('Did Not Start');
    });

    it('should format NM as "No Mark"', () => {
      expect(formatMark('NM')).toBe('No Mark');
    });

    it('should return time marks unchanged', () => {
      expect(formatMark('7.42')).toBe('7.42');
      expect(formatMark('45.66')).toBe('45.66');
      expect(formatMark('3:33.66')).toBe('3:33.66');
      expect(formatMark('1:46.04')).toBe('1:46.04');
    });

    it('should return distance marks unchanged', () => {
      expect(formatMark('13.89')).toBe('13.89');
      expect(formatMark('2.19')).toBe('2.19');
    });

    it('should handle empty strings', () => {
      expect(formatMark('')).toBe('');
    });
  });

  describe('getEventType', () => {
    describe('sprints', () => {
      it('should identify 60m as sprint', () => {
        expect(getEventType("Men's 60 Metres")).toBe('sprint');
      });

      it('should identify 100m as sprint', () => {
        expect(getEventType("Women's 100 Metres")).toBe('sprint');
      });

      it('should identify 200m as sprint', () => {
        expect(getEventType("Men's 200 Metres")).toBe('sprint');
      });

      it('should identify 400m as sprint', () => {
        expect(getEventType("Women's 400 Metres Short Track")).toBe('sprint');
      });

      it('should identify 300m as sprint', () => {
        expect(getEventType("Men's 300 Metres Short Track")).toBe('sprint');
      });
    });

    describe('middle-distance', () => {
      it('should identify 500m as middle-distance', () => {
        expect(getEventType("Women's 500 Metres Short Track")).toBe('middle-distance');
      });

      it('should identify 800m as middle-distance', () => {
        expect(getEventType("Men's 800 Metres Short Track")).toBe('middle-distance');
      });

      it('should identify 1500m as middle-distance', () => {
        expect(getEventType("Women's 1500 Metres Short Track")).toBe('middle-distance');
      });
    });

    describe('distance', () => {
      it('should identify 3000m as distance', () => {
        expect(getEventType("Men's 3000 Metres Short Track")).toBe('distance');
      });

      it('should identify 5000m as distance', () => {
        expect(getEventType("Women's 5000 Metres")).toBe('distance');
      });

      it('should identify Mile as distance', () => {
        expect(getEventType("Men's Mile Short Track")).toBe('distance');
        expect(getEventType("Women's Mile Short Track")).toBe('distance');
      });
    });

    describe('hurdles', () => {
      it('should identify 60m hurdles as hurdles', () => {
        expect(getEventType("Men's 60 Metres Hurdles")).toBe('hurdles');
      });

      it('should identify 100m hurdles as hurdles', () => {
        expect(getEventType("Women's 100 Metres Hurdles")).toBe('hurdles');
      });

      it('should identify 110m hurdles as hurdles', () => {
        expect(getEventType("Men's 110 Metres Hurdles")).toBe('hurdles');
      });

      it('should identify 400m hurdles as hurdles', () => {
        expect(getEventType("Women's 400 Metres Hurdles")).toBe('hurdles');
      });
    });

    describe('field events', () => {
      it('should identify high jump as field', () => {
        expect(getEventType("Men's High Jump")).toBe('field');
      });

      it('should identify long jump as field', () => {
        expect(getEventType("Women's Long Jump")).toBe('field');
      });

      it('should identify triple jump as field', () => {
        expect(getEventType("Men's Triple Jump")).toBe('field');
      });

    //   it('should identify pole vault as field', () => {
    //     expect(getEventType("Women's Pole Vault")).toBe('field');
    //   });

    //   it('should identify shot put as field', () => {
    //     expect(getEventType("Men's Shot Put")).toBe('field');
    //   });

      it('should identify discus throw as field', () => {
        expect(getEventType("Women's Discus Throw")).toBe('field');
      });

      it('should identify javelin throw as field', () => {
        expect(getEventType("Men's Javelin Throw")).toBe('field');
      });

      it('should identify hammer throw as field', () => {
        expect(getEventType("Women's Hammer Throw")).toBe('field');
      });
    });

    describe('edge cases', () => {
      it('should return "other" for unknown events', () => {
        expect(getEventType('Unknown Event')).toBe('other');
      });

      it('should return "other" for empty string', () => {
        expect(getEventType('')).toBe('other');
      });

    //   it('should handle case sensitivity', () => {
    //     expect(getEventType("men's 100 metres")).toBe('sprint');
    //   });
    });
  });

  describe('parseEventFromTable (internal function)', () => {
    // Note: This function is not exported, so we'll test it indirectly through parseMeetResultsWithTables
    // or export it for testing purposes. For now, we'll document what should be tested:
    
    it.todo('should parse valid table with athletes');
    it.todo('should return null for tables with less than 2 rows');
    it.todo('should skip rows without valid place numbers');
    it.todo('should handle tables with missing data');
  });
});