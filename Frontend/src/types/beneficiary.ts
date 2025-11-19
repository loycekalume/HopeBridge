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
  category:string;
  matchPercent: number;
  distanceKm: number;
  timePosted: string;
  isMatch: true;
  status?: never; // Matches don't have a status property
}


// types/beneficiaryProfile.ts

export interface BeneficiaryProfileData {
  // --- Step 1: Needs and Location ---
  street_address: string;
  city: string;
  state_region: string;
  primary_need?: string; // Although not explicitly used in the form, good for data structure
  about_you_needs: string; // The required text area detailing their situation

  // --- Step 2: Verification Documents ---
  gov_id_url: string; // Required
  recommendation_letter_url?: string; // Optional field, hence the '?'
  proof_of_need_url: string; // Required (e.g., medical statement, school enrollment)

}

export interface MatchedDonation {
  donor: string;
  quantity: number;
  location: string;
  matchPercent: string; // e.g. "75"
}

export interface Request {
  id: number;
  name: string;
  tag: string;
  timeAgo: string;
  category:string;
  status: string;
  matchedDonation?: MatchedDonation | null;
}

export type CardData = Match | Request;