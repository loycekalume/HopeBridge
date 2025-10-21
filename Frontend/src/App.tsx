import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/auth/signup";
import Login from "./pages/auth/login";
import Home from "./pages/home";
import DonorDashboard from "./pages/dashboards/donorDashbord";
import BeneficiaryDashboard from "./pages/dashboards/beneficiaryDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/donor" element={<DonorDashboard />} />
        <Route path="/beneficiary" element={<BeneficiaryDashboard />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
