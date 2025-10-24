
import { useParams } from 'react-router-dom';
import DonorProfileWizard from '../profileWizards/donorProfile'; // Assuming this is DonorProfile.tsx
import BeneficiaryProfileWizard from '../profileWizards/beneficiary'; // Assuming this is beneficiary.tsx
import OrganizerProfileWizard from '../profileWizards/organizer';
import CommunityProfileWizard from '../profileWizards/community';

export default function ProfileWizardRouter() {
    const { role } = useParams<{ role: string }>();

    switch (role) {
        case 'donor':
        case 'company':
         
            return <DonorProfileWizard />;
            
        case 'beneficiary':
            // Renders the dedicated Beneficiary form
            return <BeneficiaryProfileWizard />;
            
        // Add other roles here as you build them
        case 'organizer':
             return <OrganizerProfileWizard />;
        case 'community':
             return <CommunityProfileWizard />;
           
            
        default:
            // Handle invalid/unknown role in the URL
            return <div>Error: Invalid profile role specified.</div>;
    }
}