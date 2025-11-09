import React from "react";

interface OverviewItem {
  title: string;
  value: string;
}

const OverviewCards: React.FC = () => {
  const overviewData: OverviewItem[] = [
    { title: "Total Donations", value: "120+" },
    { title: "Active Events", value: "4" },
    { title: "Volunteers Engaged", value: "15" },
    { title: "Beneficiaries Helped", value: "800+" },
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
