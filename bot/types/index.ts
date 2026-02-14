export namespace Playlists {
  export interface Data {
    title: string
    description: string
    time: string
  }
}

export interface CalendarSession {
  year: number
  month: number
  day?: number
  hour: number
  minute: number
}

export interface User {
  id: number
  firstName: string
  lastName: string
  username: string
  songs: any[]
}
