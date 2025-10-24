

export interface CommunityProfileData {
  // --- Step 1: Organization Details ---
  org_focus: 'Elderly Care' | 'Education' | 'Childrens Home' | 'Other'; // New field
  street_address: string;
  city: string;
  state_region: string;
  about_organization: string; // Bio on group's mission
  
  // --- Step 2: Verification Documents ---
  gov_id_url: string; // Representative's ID
  group_reg_cert_url: string; // Group Registration/Charter
}