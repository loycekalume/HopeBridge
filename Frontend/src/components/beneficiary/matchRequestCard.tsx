import React from "react";
import type { Request } from "../../types/beneficiary";
import "../../styles/beneficiacyDashboard.css";

interface Props {
  data: Request;
  onViewMatch: (matchedDonation: any) => void; // <--- add this
}

const RequestCard: React.FC<Props> = ({ data, onViewMatch }) => {
  const isMatched = !!data.matchedDonation;

  return (
    <div className={isMatched ? "match-card" : "request-item"}>
      {/* Request Title */}
      <div className="request-details">{data.name}</div>

      {/* Category + Time */}
      <div className="request-metadata">
        <span className="request-category">{data.category}</span>
        <span className="time-ago">{data.timeAgo}</span>
      </div>

      {/* Matched Donation Section */}
      {isMatched && data.matchedDonation ? (
        <div className="match-section">
          <p className="donor">Donor: {data.matchedDonation.donor}</p>
          <p className="location">Location: {data.matchedDonation.location}</p>
          <p className="percent-match">Match: {data.matchedDonation.matchPercent}%</p>

          <button
            className="accept-btn"
            onClick={() => onViewMatch(data.matchedDonation)}  // <-- OPEN MODAL
          >
            Contact Donor
          </button>
        </div>
      ) : (
        <div className="match-section">
          <p className="not-matched">Not matched yet</p>
        </div>
      )}

      {/* Status */}
      {!isMatched && (
        <div className="request-status-actions">
          <span className={`status ${data.status.toLowerCase()}-status`}>
            {data.status}
          </span>
          <button className="update-btn">Update</button>
        </div>
      )}
    </div>
  );
};

export default RequestCard;
