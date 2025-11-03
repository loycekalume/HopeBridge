// DonationFormModal.tsx - FINAL CORRECTED VERSION

import React, { useState } from 'react';
import type { DonationFormData } from '../../types/donationForm';
import { CATEGORY_OPTIONS, CONDITION_OPTIONS, AVAILABILITY_OPTIONS } from '../../types/donationForm';
import '../../styles/donorForm.css';
import { FaUpload, FaTimes } from 'react-icons/fa';

// DonationFormModalProps interface remains correct
interface DonationFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: DonationFormData) => void;
    isSubmitting: boolean; // Correctly defined
}


const DonationFormModal: React.FC<DonationFormModalProps> = ({ isOpen, onClose, onSubmit, isSubmitting }) => {

    // Initializing state with default/empty values
    const [formData, setFormData] = useState<DonationFormData>({
        category: '',
        title: '',
        description: '',
        condition: '',
        quantity: 1,
        location: '',
        availability: '',
        photos: [],
    });
    const [loading] = useState(false); 
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null; 

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value,
        }));
        setError(null);
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            // Convert FileList to Array and append to existing photos
            const newPhotos = Array.from(e.target.files);
            setFormData(prev => ({
                ...prev,
                photos: [...prev.photos, ...newPhotos],
            }));
        }
        setError(null);
    };


    const handleRemovePhoto = (fileName: string) => {
        setFormData(prev => ({
            ...prev,
            photos: prev.photos.filter(file => file.name !== fileName),
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.category || !formData.title || !formData.condition || formData.quantity <= 0 || !formData.location) {
            setError("Please fill all required fields and ensure Quantity is valid.");
            return;
        }

        // Pass data up to the parent component/API handler
        // NOTE: We don't need local 'loading' state anymore, we rely entirely on the 'isSubmitting' prop
        onSubmit(formData); 
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Post a New Donation</h2>
                    <button className="close-btn" onClick={onClose} disabled={isSubmitting}><FaTimes /></button>
                </div>
                <p className="subtitle">Share what you'd like to donate with the community</p>

                <form onSubmit={handleSubmit} className="donation-form">

                    {/* --- Row 1: Category & Title --- */}
                    <div className="form-row">
                        <label className="full-width">Category *</label>
                        <select name="category" value={formData.category} onChange={handleChange} required>
                            <option value="" disabled>Select category</option>
                            {CATEGORY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>

                    <div className="form-row full-width">
                        <label>Title *</label>
                        <input name="title" type="text" value={formData.title} onChange={handleChange} placeholder="e.g., Winter Clothes for Children" required />
                    </div>

                    {/* --- Row 2: Description --- */}
                    <div className="form-row full-width">
                        <label>Description *</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe the items, their condition, and any other relevant details..." rows={3} required />
                    </div>

                    {/* --- Row 3: Condition & Quantity --- */}
                    <div className="form-row half-width">
                        <label>Condition *</label>
                        <select name="condition" value={formData.condition} onChange={handleChange} required>
                            <option value="" disabled>Select condition</option>
                            {CONDITION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>

                    <div className="form-row half-width">
                        <label>Quantity *</label>
                        <input name="quantity" type="number" value={formData.quantity} onChange={handleChange} min="1" required />
                    </div>

                    {/* --- Row 4: Location & Availability --- */}
                    <div className="form-row full-width">
                        <label>Location *</label>
                        <input name="location" type="text" value={formData.location} onChange={handleChange} placeholder="City, State" required />
                    </div>

                    <div className="form-row full-width">
                        <label>Availability *</label>
                        <select name="availability" value={formData.availability} onChange={handleChange} required>
                            <option value="" disabled>When is this available?</option>
                            {AVAILABILITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>

                    {/* --- Row 5: Photos --- */}
                    <div className="form-row full-width">
                        <label>Photos (Optional)</label>
                        <div className="photo-upload-area">
                            <label htmlFor="photo-upload-input" className="upload-box">
                                <FaUpload size={24} />
                                <p>Click to upload photos</p>
                                <small>PNG, JPG up to 10MB</small>
                                <input id="photo-upload-input" type="file" onChange={handlePhotoUpload} accept=".png, .jpg, .jpeg" multiple style={{ display: 'none' }} />
                            </label>

                            <div className="photo-preview-container">
                                {formData.photos.map((file, index) => (
                                    <div key={index} className="photo-preview-tag">
                                        {file.name}
                                        <button type="button" onClick={() => handleRemovePhoto(file.name)}><FaTimes /></button>
                                    </div>
                                ))}
                                {formData.photos.length === 0 && <p className="no-photos">No files selected.</p>}
                            </div>
                        </div>
                    </div>

                    {error && <p className="error-message">{error}</p>}

                  

                    <button type="submit" className="submit-btn" disabled={loading || isSubmitting}>
                        {loading || isSubmitting ? 'Posting...' : 'Post Donation'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DonationFormModal;