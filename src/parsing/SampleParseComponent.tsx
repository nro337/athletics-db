import { useState } from 'react';
import { parseMeetResults, formatMark, getEventType } from './parse_pdf';
import type { MeetResults, Event, PDFSource } from './parsing_types';

export default function MeetResultsParser() {
  const [results, setResults] = useState<MeetResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<PDFSource>('world-athletics');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const meetResults = await parseMeetResults(file, source);
      setResults(meetResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse PDF');
      console.error('Error parsing PDF:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadJSON = () => {
    if (!results) return;

    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'meet-results.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Track & Field Meet Results Parser</h1>

      {/* File Upload */}
      <div className="mb-8">
        <label className="block mb-2 text-sm font-medium">
          PDF Source
        </label>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value as PDFSource)}
          className="block w-full mb-4 text-sm border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        >
          <option value="world-athletics">World Athletics</option>
          <option value="usatf">USATF</option>
          <option value="other">Other</option>
        </select>
        <p className="mt-0 mb-2 text-xs text-gray-500">
          Select the source that matches your PDF format. Different sources may have different formatting.
        </p>
        
        <label className="block mb-2 text-sm font-medium">
          Upload Meet Results PDF
        </label>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileUpload}
          className="block w-full text-sm border border-gray-300 rounded-lg cursor-pointer focus:outline-none p-2"
          disabled={loading}
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Parsing PDF...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Results */}
      {results && !loading && (
        <div>
          {/* Meet Info */}
          <div className="bg-slate-500 border border-blue-200 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-2">{results.meetName}</h2>
            <p className="text-gray-700">{results.location}</p>
            <p className="text-gray-600">{results.date}</p>
            {results.source && (
              <p className="text-sm mt-2">
                Source: <span className="font-semibold">{results.source}</span>
              </p>
            )}
            <button
              onClick={downloadJSON}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Download JSON
            </button>
          </div>

          {/* Events */}
          <div className="space-y-6">
            {results.events.map((event, idx) => (
              <EventCard key={idx} event={event} />
            ))}
          </div>

          {/* Summary */}
          <div className="mt-8 bg-slate-600 border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold mb-2">Summary</h3>
            <p>Total Events: {results.events.length}</p>
            <p>
              Total Athletes: {results.events.reduce((sum, e) => sum + e.athletes.length, 0)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function EventCard({ event }: { event: Event }) {
  const [expanded, setExpanded] = useState(true);
  const eventType = getEventType(event.eventName);

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Event Header */}
      <div
        className="bg-slate-600 p-4 cursor-pointer hover:bg-slate-400 transition"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs text-gray-300 uppercase">{event.category}</span>
            <h3 className="text-lg font-bold">{event.eventName}</h3>
            {event.round && <span className="text-sm text-gray-200">{event.round}</span>}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {event.athletes.length} athletes
            </span>
            <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
              {eventType}
            </span>
            <svg
              className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Athletes Table */}
      {expanded && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Place</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Birth Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mark</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Records</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {event.athletes.map((athlete, idx) => (
                <tr key={idx} className="hover:bg-slate-500">
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                        athlete.place === 1
                          ? 'bg-yellow-100 text-yellow-800'
                          : athlete.place === 2
                          ? 'bg-gray-200 text-gray-800'
                          : athlete.place === 3
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {athlete.place}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{athlete.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-200">{athlete.birthDate}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                      {athlete.country}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold">{formatMark(athlete.mark)}</td>
                  <td className="px-4 py-3">
                    {athlete.records && (
                      <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">
                        {athlete.records}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}