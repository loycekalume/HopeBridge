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
import DonationsPage from "./pages/dashboards/donations"
import PendingVerificationsPage from "./components/organizers/pendingVerifications";

function App() {
  return (
    <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/donor" element={<DonorDashboard />} />
        <Route path="/beneficiary" element={<BeneficiaryDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/organizer" element={<OrganizerDashboard />} />
        <Route path="/community" element={<CommunityDashboard />} />
        <Route path="/company" element={<CompanyDashboard />} />
        <Route path="/beneficiary/donations" element={<DonationsPage />} />
         <Route path="/completeProfile/:role" element={<ProfileWizard />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
          <Route path="/pending-verifications" element={<PendingVerificationsPage />} />
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;
