// MatchRequestCard.tsx
import React from 'react';
import type{ CardData, Match, Request } from '../../types/beneficiary';
import '../../styles/beneficiacyDashboard.css';

interface CardProps {
  data: CardData;
}

const MatchRequestCard: React.FC<CardProps> = ({ data }) => {
  // Type Guard to safely check the type
  const isMatch = data.isMatch;
  const cardData = data as Match | Request;

  const renderMetadata = () => {
    if (isMatch) {
      const match = cardData as Match;
      return (
        <div className="match-metadata">
          <span className={`tag ${match.tag.toLowerCase()}-tag`}>{match.tag}</span>
          <span className="match-percent">{match.matchPercent}% match</span>
          <span className="distance">{match.distanceKm} km <i className="fas fa-location-dot"></i></span>
          <span className="time-posted">{match.timePosted} <i className="fas fa-clock"></i></span>
        </div>
      );
    } else {
      const request = cardData as Request;
      return (
        <div className="request-metadata">
          <span className={`tag ${request.tag.toLowerCase()}-tag`}>{request.tag}</span>
          <span className="time-ago">{request.timeAgo}</span>
        </div>
      );
    }
  };

  const renderActions = () => {
    if (isMatch) {
      return (
        <div className="match-actions">
          <button className="view-details-btn">View Details</button>
          <button className="accept-btn">Accept</button>
        </div>
      );
    } else {
      const request = cardData as Request;
      const statusClass = `${request.status.toLowerCase()}-status`;
      return (
        <div className="request-status-actions">
          <span className={`status ${statusClass}`}>{request.status}</span>
          <button className="update-btn">Update</button>
        </div>
      );
    }
  };

  return (
    <div className={isMatch ? "match-card" : "request-item"}>
      {isMatch ? (
        <>
          <div className="match-info-main">
            <div className={`initials-circle initials-${(cardData as Match).initialsColor}`}>
              {(cardData as Match).initials}
            </div>
            <div className="match-details">
              <span className="item-name">{cardData.name}</span>
              <span className="donor">Donated by {(cardData as Match).donor}</span>
            </div>
          </div>
          {renderActions()}
          {renderMetadata()}
        </>
      ) : (
        <>
          <div className="request-details">
            <span className="request-name">{cardData.name}</span>
            {renderMetadata()}
          </div>
          {renderActions()}
        </>
      )}
    </div>
  );
};

export default MatchRequestCard;