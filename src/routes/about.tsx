import { createFileRoute } from '@tanstack/react-router'
import MeetResultsParser from '../parsing/SampleParseComponent'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return <div className="p-2">
      <MeetResultsParser />
  </div>
}