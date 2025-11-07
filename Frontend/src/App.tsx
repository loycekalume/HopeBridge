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
import DonationsPage from "./pages/dashboards/donations";
import PendingVerificationsPage from "./components/organizers/pendingVerifications";
import ApprovedRequests from "./components/organizers/approvedRequests";
import MatchedDonations from "./components/organizers/matchedDonations"; // ✅ import this page
 // optional if you have this

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

          {/* Beneficiary pages */}
          <Route path="/beneficiary/donations" element={<DonationsPage />} />

          {/* Organizer pages */}
          <Route path="/pending-verifications" element={<PendingVerificationsPage />} />
          <Route path="/approvedRequests" element={<ApprovedRequests />} />
          <Route path="/matched-donations" element={<MatchedDonations />} /> 
        

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
