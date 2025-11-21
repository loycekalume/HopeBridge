// types/donor.ts (Conceptual Types)
export interface DonorStats {
    totalDonations: number;
    beneficiariesHelped: number;
    impactScore: string; // e.g., "98%"
}

export interface Donation {
    donation_id: number;
    item_name: string;
    category: string;
    created_at: string;
    status: 'Pending' | 'Matched' | 'Delivered';
    matched_to: string | null;
    photo_urls: string[] | null;
    beneficiary_email?: string;
    beneficiary_phone?: string;
    beneficiary_city?: string;

}

export interface DashboardData {
    stats: DonorStats;
    recentDonations: Donation[];
}