// types/donation.ts

export interface DonationFormData {
    category: string;
    title: string;
    description: string;
    condition: string;
    quantity: number;
    location: string;
    availability: string;
    photos: File[]; // Array of File objects for upload
}

export const CATEGORY_OPTIONS = [
    'Food / Groceries', 'Clothing / Linens', 'Educational Supplies',
    'Furniture / Household Items', 'Services / Skills', 'Other'
];

export const CONDITION_OPTIONS = [
    'New', 'Like New', 'Gently Used', 'Fair', 'Needs Repair'
];

export const AVAILABILITY_OPTIONS = [
    'Available Today', 'Available This Week', 'Available Next Week', 'Flexible'
];