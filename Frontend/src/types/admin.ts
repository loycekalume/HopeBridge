// types.ts

export interface AdminStat {
  id: number;
  mainValue: string;
  mainLabel: string;
  primaryDetail: string;
  secondaryDetail: string;
  iconClass: string;
  iconBgColor: 'user-card' | 'donation-card' | 'flagged-card' | 'success-card';
  primaryDetailColor: 'success' | 'danger' | 'primary';
}

export interface User {
  id: number;
  name: string;
  email: string;
  isVerified: boolean;
  role: 'Donor' | 'Beneficiary';
  status: 'Active' | 'Suspended';
  activityMain: string;
  activitySub: string;
  joinedDate: string;
}