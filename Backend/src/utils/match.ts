import pool from "../db/db.config";

/**
 * Auto-matches a donation with the best available beneficiary request.
 * Can be triggered on:
 *  - new donation posted
 *  - new beneficiary request posted
 *  - periodic cron job (future scalability)
 */
export const matchDonation = async (donationId: number) => {
  // 1️⃣ Fetch donation details
  const donationRes = await pool.query(
    `SELECT * FROM donations WHERE donation_id = $1`,
    [donationId]
  );
  const donation = donationRes.rows[0];

  if (!donation) return null;

  // ❗Stop if already matched
  if (donation.status === "Matched" && donation.matched_beneficiary_id) {
    return null;
  }

  // 2️⃣ Get ALL pending requests compatible with this donation
  const requestsRes = await pool.query(
    `
      SELECT *
      FROM beneficiary_requests
      WHERE 
        category = $1 AND 
        status = 'Pending'
    `,
    [donation.category]
  );

  const requests = requestsRes.rows;
  if (requests.length === 0) return null;

  // 3️⃣ Score requests
  const scored = requests.map((req) => {
  const categoryMatch = 1;

  // Location contributes a smaller fraction
  const locationMatch = req.location === donation.location ? 0.5 : 0;

  // Ignore strict quantity, just use 1
  const quantityMatch = 1;

  const urgencyWeight =
    req.urgency_level === "High"
      ? 1
      : req.urgency_level === "Moderate"
      ? 0.7
      : 0.4;

  const score = categoryMatch + locationMatch + quantityMatch + urgencyWeight;

  return { req, score };
});


  // 4️⃣ Pick request with highest score
  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];

  // Prevent weak matches
  if (!best || best.score < 1.2) {
    return null;
  }

  const matched = best.req;

  // 5️⃣ Match donation → beneficiary
  await pool.query(
    `
      UPDATE donations
      SET matched_beneficiary_id = $1,
          status = 'Matched'
      WHERE donation_id = $2
    `,
    [matched.beneficiary_id, donationId]
  );

  // 6️⃣ Match request → donation
  await pool.query(
    `
      UPDATE beneficiary_requests
      SET matched_donation_id = $1,
          status = 'Matched'
      WHERE request_id = $2
    `,
    [donationId, matched.request_id]
  );

  return matched;
};

 
export const matchRequest = async (requestId: number) => {
  //  Fetch the request details
  const requestRes = await pool.query(
    `SELECT * FROM beneficiary_requests WHERE request_id = $1`,
    [requestId]
  );

  const request = requestRes.rows[0];
  if (!request) return null;

  // 2️⃣ Find pending donations in the same category
  const donationsRes = await pool.query(
    `
      SELECT *
      FROM donations
      WHERE category = $1
        AND status = 'Pending'
        AND quantity >= $2
    `,
    [request.category, request.quantity]
  );

  const donations = donationsRes.rows;
  if (donations.length === 0) return null;

  // 3️⃣ Score each donation
 const scored = donations.map((donation) => {
  const locationMatch = donation.location === request.location ? 0.5 : 0;
  const quantityMatch = 1; // ignore strict quantity
  const urgencyWeight =
    request.urgency_level === "High"
      ? 1
      : request.urgency_level === "Moderate"
      ? 0.7
      : 0.5;

  const flexibleWeight = request.flexible_condition ? 0.8 : 1;

  const score = locationMatch + quantityMatch + urgencyWeight + flexibleWeight;

  return { donation, score };
});


  // 4️⃣ Pick the highest score
  scored.sort((a, b) => b.score - a.score);
  const bestMatch = scored[0];

  if (!bestMatch || bestMatch.score < 1.5) {
    // Not a strong match → skip automatic matching
    return null;
  }

  const donation = bestMatch.donation;

  // 5️⃣ Update donation → matched beneficiary
  await pool.query(
    `
      UPDATE donations
      SET matched_beneficiary_id = $1, status = 'Matched'
      WHERE donation_id = $2
    `,
    [request.beneficiary_id, donation.donation_id]
  );

  // 6️⃣ Update request → matched donation
  await pool.query(
    `
      UPDATE beneficiary_requests
      SET matched_donation_id = $1, status = 'Matched'
      WHERE request_id = $2
    `,
    [donation.donation_id, request.request_id]
  );

  // 7️⃣ Return matched donation so frontend can show it
  return donation;
};