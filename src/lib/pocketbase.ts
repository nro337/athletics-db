import PocketBase from 'pocketbase'

export const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090')

export interface Country {
  id: string
  name: string
  emoji: string
  created: string
  updated: string
}

export interface Athlete {
  id: string
  name: string
  surname: string
  birthdate?: string
  wa_profile?: string
  country: string
  created: string
  updated: string
}

export interface Event {
  id: string
  name: string
  core_event: boolean
  created: string
  updated: string
}

export interface AthleteExpanded extends Athlete {
  expand?: {
    country: Country
    primary_events: Event[]
  }
}
