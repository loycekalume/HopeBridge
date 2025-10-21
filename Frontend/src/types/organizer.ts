// types.ts (Organizer-specific additions)

export interface OrganizerStat {
  id: number;
  label: string;
  value: number | string;
  iconClass: string;
  bgColor: 'blue' | 'green' | 'yellow' | 'purple';
}

export interface VerificationTask {
  id: string;
  type: 'Donation' | 'Distribution' | 'Distribution' | 'User';
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  location: string;
  timeRemaining: string;
  status: 'New' | 'Pending Verification' | 'Ready for Pickup';
  donorName?: string;
  beneficiaryName?: string;
}