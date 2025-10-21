// types.ts

export interface Stat {
  label: string;
  value: number;
  iconClass: string;
  iconType: 'time' | 'box' | 'check';
}

export interface Match {
  id: string;
  name: string;
  donor: string;
  initials: string;
  initialsColor: 'j' | 'c';
  tag: 'Food' | 'Education';
  matchPercent: number;
  distanceKm: number;
  timePosted: string;
  isMatch: true;
  status?: never; // Matches don't have a status property
}

export interface Request {
  id: string;
  name: string;
  tag: 'Food' | 'Education';
  timeAgo: string;
  status: 'Matched' | 'Pending';
  isMatch: false;
  donor?: never; // Requests don't have a donor property
}

export type CardData = Match | Request;