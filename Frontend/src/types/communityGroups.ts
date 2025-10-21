// types.ts (Community Group specific additions)

export interface GroupMetric {
  id: number;
  label: string;
  value: number | string;
  iconClass: string;
  color: 'blue' | 'green' | 'warm-yellow' | 'teal'; // Using warmer accents
}

export interface ScheduledActivity {
  id: string;
  name: string;
  type: 'Visit' | 'Teaching' | 'Service';
  date: string;
  time: string;
  location: string;
  volunteers: number;
  maxVolunteers: number;
  status: 'Upcoming' | 'Recruiting' | 'Completed';
}