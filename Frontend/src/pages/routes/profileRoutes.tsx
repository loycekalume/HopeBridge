
import { useParams } from 'react-router-dom';
import DonorProfileWizard from '../profileWizards/donorProfile'; // Assuming this is DonorProfile.tsx
import BeneficiaryProfileWizard from '../profileWizards/beneficiary'; // Assuming this is beneficiary.tsx
// You'll eventually add OrganizerProfileWizard, etc., here

export default function ProfileWizardRouter() {
    const { role } = useParams<{ role: string }>();

    switch (role) {
        case 'donor':
        case 'company':
            // Renders the Donor form for both individual and corporate donors
            return <DonorProfileWizard />;
            
        case 'beneficiary':
            // Renders the dedicated Beneficiary form
            return <BeneficiaryProfileWizard />;
            
        // Add other roles here as you build them
        case 'organizer':
        case 'community':
            // Placeholder for roles not yet built
            return <div>Profile Wizard for {role} coming soon...</div>;
            
        default:
            // Handle invalid/unknown role in the URL
            return <div>Error: Invalid profile role specified.</div>;
    }
}