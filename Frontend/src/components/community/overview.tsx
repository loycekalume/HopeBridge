import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import { apiCall } from "../../utils/api";

interface OverviewData {
  totalDonations: number;
  totalEvents: number;
  totalVolunteers: number;
  totalBeneficiaries: number;
}

const OverviewCards: React.FC = () => {
  const { user, token } = useAuth();
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    if (!user || !token) return;
    try {
      const data = await apiCall(
        `/api/communities/${user.user_id}/impact`,
        "GET",
        undefined,
        token
      );
      setOverview(data);
    } catch (error) {
      console.error("Failed to fetch overview:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [user, token]);

  if (loading) return <section className="overview3">Loading...</section>;
  if (!overview)
    return <section className="overview3">No overview data available.</section>;

  const overviewData = [
    { title: "Total Donations", value: overview.totalDonations ?? 0 },
    { title: "Active Events", value: overview.totalEvents ?? 0 },
    { title: "Volunteers Engaged", value: overview.totalVolunteers ?? 0 },
    { title: "Beneficiaries Helped", value: overview.totalBeneficiaries ?? 0 },
  ];

  return (
    <section className="overview3">
      {overviewData.map((item, index) => (
        <div className="card" key={index}>
          <h3>{item.title}</h3>
          <p>{item.value}</p>
        </div>
      ))}
    </section>
  );
};

export default OverviewCards;
