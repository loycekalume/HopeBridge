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
export interface OrganizerProfileData {
  // --- Step 1: Basic Info & Type ---
  organizer_type: 'NGO Rep' | 'Social Worker' | 'Community Leader' | 'Other'; // New required field
  street_address: string;
  city: string;
  state_region: string;
  about_me: string; // Bio on experience/motivation

  // --- Step 2: Verification Documents ---
  gov_id_url: string; // Required (Personal Identity)
  professional_cert_url: string; // Required (Proof of Eligibility: NGO ID, License, etc.)
  
  
}