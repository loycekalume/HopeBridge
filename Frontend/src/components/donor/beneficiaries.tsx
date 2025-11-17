import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/donor/dashboardLayout";
import { apiCall } from "../../utils/api";
import "../../styles/donorDashboard.css";
import { Mail, Copy } from "lucide-react";

interface Beneficiary {
  user_id: number;
  full_name: string;
  email: string;
  primary_need: string;
  location: string;
}

const Beneficiaries: React.FC = () => {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [filtered, setFiltered] = useState<Beneficiary[]>([]);

  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [needFilter, setNeedFilter] = useState("");

  const [showEmail, setShowEmail] = useState<number | null>(null);

  useEffect(() => {
    const fetchBeneficiaries = async () => {
      const res = await apiCall("/api/donations/donors/beneficiaries", "GET");
      setBeneficiaries(res.beneficiaries);
      setFiltered(res.beneficiaries);
    };
    fetchBeneficiaries();
  }, []);

  // Extract cities & needs for dropdowns
  const uniqueCities = [...new Set(beneficiaries.map(b => b.location.split(",")[1]?.trim()))];
  const uniqueNeeds = [...new Set(beneficiaries.map(b => b.primary_need))];

  // Filtering logic
  useEffect(() => {
    let result = beneficiaries;

    if (search.trim() !== "") {
      result = result.filter(b =>
        b.full_name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (cityFilter !== "") {
      result = result.filter(b =>
        b.location.toLowerCase().includes(cityFilter.toLowerCase())
      );
    }

    if (needFilter !== "") {
      result = result.filter(b =>
        b.primary_need?.toLowerCase() === needFilter.toLowerCase()
      );
    }

    setFiltered(result);
  }, [search, cityFilter, needFilter, beneficiaries]);

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    alert("Email copied!");
  };

  return (
    <DashboardLayout title="Beneficiaries">
      {/* Filters Section */}
      <div className="filters-container">
        <input
          type="text"
          placeholder="Search by name..."
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="filter-select"
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
        >
          <option value="">Filter by City</option>
          {uniqueCities.map((city, idx) => (
            <option key={idx} value={city}>
              {city}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={needFilter}
          onChange={(e) => setNeedFilter(e.target.value)}
        >
          <option value="">Filter by Need</option>
          {uniqueNeeds.map((need, idx) => (
            <option key={idx} value={need}>
              {need}
            </option>
          ))}
        </select>
      </div>

      {/* Beneficiaries Grid */}
      <div className="beneficiaries-grid">
        {filtered.map((b) => (
          <div className="beneficiary-card" key={b.user_id}>
            <h3>{b.full_name}</h3>

            <p>
              <strong>Location:</strong><br /> {b.location}
            </p>

            <p>
              <strong>Primary Need:</strong><br /> {b.primary_need || "Not specified"}
            </p>

            <button
              className="contact-btn"
              onClick={() => setShowEmail(showEmail === b.user_id ? null : b.user_id)}
            >
              <Mail size={18} /> Contact
            </button>

            {showEmail === b.user_id && (
              <div className="email-box">
                <p>{b.email}</p>
                <button className="copy-btn" onClick={() => copyEmail(b.email)}>
                  <Copy size={16} /> Copy
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Beneficiaries;
