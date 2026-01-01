import PocketBase from 'pocketbase'

export const pb = new PocketBase('http://127.0.0.1:8090')

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

export interface AthleteExpanded extends Athlete {
  expand?: {
    country: Country
  }
}
