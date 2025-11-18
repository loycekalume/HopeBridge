import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/auth/signup";
import { AuthProvider } from './context/authContext';
import Login from "./pages/auth/login";
import Home from "./pages/home";
import DonorDashboard from "./pages/dashboards/donorDashbord";
import BeneficiaryDashboard from "./pages/dashboards/beneficiaryDashboard";
import AdminDashboard from "./pages/dashboards/adminDashboard";
import OrganizerDashboard from "./pages/dashboards/organizersDashboard";
import CommunityDashboard from "./pages/dashboards/communityGroup";
import CompanyDashboard from "./pages/dashboards/companyDashboard";
import ProfileWizard from "./pages/routes/profileRoutes";
import PendingVerificationsPage from "./components/organizers/pendingVerifications";
import ApprovedRequests from "./components/organizers/approvedRequests";
import MatchedDonations from "./components/organizers/matchedDonations"; 
import CommunityEvents from "./components/organizers/communityEvents";
import ManageEvents from "./components/community/events";
import CommunityMembers from "./components/community/communityMembers";
import CommunityImpact from "./components/community/impacts";
import AdminUsers from "./components/admin/adminUsers";
import AdminCommunities from "./components/admin/adminCommunities";
import AdminEvents from "./components/admin/adminEvents";
import AdminReports from "./components/admin/adminReports";
import CompanyCampaigns from "./components/company/campaigns";
import CompanyImpacts from "./components/company/impact";
import CompanyDonations from "./components/company/donations";
import MyDonations from "./components/donor/myDonations";
import DonorBeneficiaries  from "./components/donor/beneficiaries"
import RequestsPage from "./components/beneficiary/requests"
import Donations from "./components/beneficiary/donations"

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* General Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/completeProfile/:role" element={<ProfileWizard />} />

          {/* Dashboards */}
          <Route path="/donor" element={<DonorDashboard />} />
          <Route path="/beneficiary" element={<BeneficiaryDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/organizer" element={<OrganizerDashboard />} />
          <Route path="/community" element={<CommunityDashboard />} />
          <Route path="/company" element={<CompanyDashboard />} />


          {/* Donor pages */}
             <Route path="/donor/donations" element={<MyDonations />} />
             <Route path="/donor/beneficiaries" element={<DonorBeneficiaries />} />

          {/* Beneficiary pages */}
          <Route path="/beneficiary/donations" element={<Donations />} />
          <Route path="/beneficiary/requests" element={<RequestsPage />} />
         

          {/* Organizer pages */}
          <Route path="/pending-verifications" element={<PendingVerificationsPage />} />
          <Route path="/approvedRequests" element={<ApprovedRequests />} />
          <Route path="/matched-donations" element={<MatchedDonations />} />
          <Route path="/community-events" element={<CommunityEvents />} />

          {/* Community Pages */}
          <Route path="/manage-events" element={<ManageEvents />} />
          <Route path="/members" element={<CommunityMembers />} />
          <Route path="/impact-reports" element={<CommunityImpact />} />

          {/* Admin pages */}
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/communities" element={<AdminCommunities />} />
          <Route path="/admin/events" element={<AdminEvents />} />
          <Route path="/admin/reports" element={<AdminReports />} />

          {/* Company pages */}
          <Route path="/company/campaigns" element={<CompanyCampaigns />} />
          <Route path="/company/donations" element={<CompanyDonations />} />
          <Route path="/company/impacts" element={<CompanyImpacts />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
