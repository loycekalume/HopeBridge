// DonorProfileWizard.tsx - FINAL CORRECTED VERSION

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import type { DonorProfileData } from '../../types/donorProfile';
import '../../styles/donorProfile.css';
import { FaUpload, FaCheckSquare } from 'react-icons/fa';
import { apiCall } from '../../utils/api';

// --- Sub-Components ---

const Step1BasicInfo: React.FC<{
    data: Partial<DonorProfileData>,
    user: any,
    update: (name: keyof DonorProfileData, value: string) => void
}> = ({ data, user, update }) => {

    return (
        <div className="wizard-step-card">
            <h2 className="step-card-title">Basic Information</h2>
            <p className="step-subtitle">Tell us about yourself</p>

            <div className="form-grid-2">

                <div className="input-group"><label>Full Name *</label><input type="text" value={user?.full_name || ''} readOnly disabled /></div>
                <div className="input-group"><label>Email Address *</label><input type="email" value={user?.email || ''} readOnly disabled /></div>
                <div className="input-group"><label>Password *</label><input type="password" value="********" readOnly disabled /></div>
                <div className="input-group"><label>Confirm Password *</label><input type="password" value="********" readOnly disabled /></div>
                <div className="input-group full-width"><label>Phone Number *</label><input type="tel" value={user?.phone || ''} readOnly disabled /></div>

                <div className="input-group full-width"><label>Street Address *</label><input type="text" value={data.street_address || ''} onChange={(e) => update('street_address', e.target.value)} placeholder="Kimathi" required /></div>
                <div className="input-group"><label>City *</label><input type="text" value={data.city || ''} onChange={(e) => update('city', e.target.value)} placeholder="Nyeri, Kenya" required /></div>
                <div className="input-group"><label>State/Region *</label><input type="text" value={data.state_region || ''} onChange={(e) => update('state_region', e.target.value)} placeholder="Central" required /></div>

                <div className="input-group full-width">
                    <label>About You</label>
                    <textarea value={data.about_you || ''} onChange={(e) => update('about_you', e.target.value)} placeholder="e.g., We are a supermarket donating excess goods, or I am an individual donor." rows={3} />
                </div>
            </div>
        </div>
    );
};

const Step2Verification: React.FC<{
    data: Partial<DonorProfileData>,
    onFileUpload: (file: File, field: 'gov_id_url' | 'registration_cert_url') => void
    isUploading: boolean,
    isCompany: boolean
}> = ({ data, onFileUpload,  isCompany }) => {

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        field: 'gov_id_url' | 'registration_cert_url'
    ) => {
        if (e.target.files && e.target.files.length > 0) {
            onFileUpload(e.target.files[0], field);
        }
    };

    const UploadBox = (uploaded: boolean, label: string) => (
        uploaded ? (
            <div className="uploaded-indicator">
                <FaCheckSquare className="check-icon" />
                <span>{label} uploaded</span>
            </div>
        ) : (
            <div className="upload-prompt">
                <FaUpload className="upload-icon" />
                <span>Click to upload</span>
            </div>
        )
    );

    return (
        <div className="wizard-step-card">
            <h2 className="step-card-title">Verification Documents</h2>
            <p className="step-subtitle">Help us maintain safety and trust</p>

            <div className="info-box">
                <p><strong>Why we need verification:</strong> All documents are encrypted and used only for verification.</p>
            </div>

            <div className="form-grid-2">

                {/* GOVERNMENT ID - ALWAYS REQUIRED */}
                <div className={`input-group ${!isCompany ? 'full-width' : ''}`}>
                    <label>Government-Issued ID *</label>

                    <div
                        className={`file-upload-box ${data.gov_id_url ? 'file-uploaded' : ''}`}
                        onClick={() => document.getElementById('file-upload-input-id')?.click()}
                    >
                        {UploadBox(!!data.gov_id_url, "Document")}
                        <input
                            id="file-upload-input-id"
                            type="file"
                            style={{ display: 'none' }}
                            onChange={(e) => handleFileChange(e, 'gov_id_url')}
                            accept="image/*,application/pdf"
                        />
                    </div>
                </div>

                {/* REGISTRATION CERT - ONLY FOR COMPANIES */}
                {isCompany && (
                    <div className="input-group">
                        <label>Registration Certificate *</label>

                        <div
                            className={`file-upload-box ${data.registration_cert_url ? 'file-uploaded' : ''}`}
                            onClick={() => document.getElementById('file-upload-input-cert')?.click()}
                        >
                            {UploadBox(!!data.registration_cert_url, "Certificate")}
                            <input
                                id="file-upload-input-cert"
                                type="file"
                                style={{ display: 'none' }}
                                onChange={(e) => handleFileChange(e, 'registration_cert_url')}
                                accept="image/*,application/pdf"
                            />
                        </div>
                    </div>
                )}

            </div>

            <small className="upload-note full-width">
                Supported formats: JPG, PNG, PDF — Max size 5MB.
            </small>

            <div className="terms-note-text">
                By completing this profile, you agree to our
                <a href="/terms" target="_blank"> Terms of Service</a> and
                <a href="/privacy" target="_blank"> Privacy Policy</a>.
            </div>
        </div>
    );
};


// --- Main Component ---
const TOTAL_STEPS = 2;

export default function DonorProfileWizard() {
    const { user, login: authLogin } = useAuth();
    const navigate = useNavigate();
    const { role } = useParams<{ role: string }>();

    const [step, setStep] = useState(1);
    const [profileData, setProfileData] = useState<Partial<DonorProfileData>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    const currentUserRole = user?.role;
    const isCompany = currentUserRole === 'company';

    useEffect(() => {
        if (user === undefined) return;
        setIsCheckingAuth(false);

        const isDonorRoute = (role === 'donor' || role === 'company');

        if (user === null) {
            navigate('/login', { replace: true });
            return;
        }

        if (user.is_profile_complete || !isDonorRoute || (user.role !== 'donor' && user.role !== 'company')) {
            const destination = user.is_profile_complete ? `/${user.role}` : '/login';
            navigate(destination, { replace: true });
        }

    }, [user, navigate, role]);

    if (isCheckingAuth || !user) {
        return <div className="loading-screen">Verifying profile access...</div>;
    }

    const updateProfileData = (name: keyof DonorProfileData, value: string) => {
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (file: File, field: 'gov_id_url' | 'registration_cert_url') => {
        setIsUploading(true);
        setError(null);

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            updateProfileData(
                field,
                `https://cdn.hopebridge.org/uploads/${user.user_id}-${field}-${Date.now()}.pdf`
            );

        } catch (e) {
            setError("File upload failed.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleNext = () => {
        const d = profileData;

        if (step === 1) {
            if (!d.street_address || !d.city || !d.state_region) {
                setError("Please complete all required fields.");
                return;
            }
        }

        setError(null);
        setStep(step + 1);
    };

    const handleFinish = async () => {
        const d = profileData;

        if (!d.gov_id_url) {
            setError("Please upload your Government-Issued ID.");
            return;
        }

        if (isCompany && !d.registration_cert_url) {
            setError("Please upload your Company Registration Certificate.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const data = await apiCall(
                `/api/donorprofile/${user?.user_id}/profile/donor`,
                'PUT',
                profileData
            );

            authLogin(data.accessToken, { ...user!, is_profile_complete: true });

            alert("Profile completed successfully!");
            navigate('/donor', { replace: true });

        } catch (err: any) {
            setError(err.message || "Network error during profile submission.");
        } finally {
            setIsLoading(false);
        }
    };


    const renderStep = () => {
        switch (step) {
            case 1:
                return <Step1BasicInfo data={profileData} user={user} update={updateProfileData} />;
            case 2:
                return <Step2Verification data={profileData} onFileUpload={handleFileUpload} isUploading={isUploading} isCompany={isCompany} />;
            default:
                return <div>Unexpected Step!</div>;
        }
    };

    return (
        <div className="wizard-container">
            <div className="wizard-box">
                <h1 className="wizard-title">Donor Profile Completion</h1>

                <div className="wizard-step-tracker">
                    <span className={step === 1 ? 'active' : ''}>1. Basic Info</span>
                    <span className={step === 2 ? 'active' : ''}>2. Verification</span>
                </div>

                <div className="wizard-content">
                    {renderStep()}
                </div>

                <div className="wizard-actions">
                    {step > 1 && (
                        <button className="back-btn" onClick={() => setStep(step - 1)} disabled={isLoading || isUploading}>
                            Back
                        </button>
                    )}

                    {step < TOTAL_STEPS && (
                        <button className="next-btn" onClick={handleNext} disabled={isLoading || isUploading}>
                            Next
                        </button>
                    )}

                    {step === TOTAL_STEPS && (
                        <button
                            className="finish-btn"
                            onClick={handleFinish}
                            disabled={isLoading || isUploading || !profileData.gov_id_url || (isCompany && !profileData.registration_cert_url)}
                        >
                            {isLoading ? 'Completing Profile...' : 'Complete Profile'}
                            <i className="fas fa-arrow-right"></i>
                        </button>
                    )}
                </div>

                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
}
