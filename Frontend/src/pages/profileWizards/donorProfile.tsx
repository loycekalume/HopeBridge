// DonorProfileWizard.tsx - FINAL CORRECTED VERSION

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import type { DonorProfileData } from '../../types/donorProfile';
import '../../styles/donorProfile.css';
import { FaUpload, FaCheckSquare } from 'react-icons/fa'; 

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
                {/* Read-Only Fields */}
                <div className="input-group"><label>Full Name *</label><input type="text" value={user?.full_name || ''} readOnly disabled /></div>
                <div className="input-group"><label>Email Address *</label><input type="email" value={user?.email || ''} readOnly disabled /></div>
                <div className="input-group"><label>Password *</label><input type="password" value="********" readOnly disabled /></div>
                <div className="input-group"><label>Confirm Password *</label><input type="password" value="********" readOnly disabled /></div>
                <div className="input-group full-width"><label>Phone Number *</label><input type="tel" value={user?.phone || ''} readOnly disabled /></div>
                
                {/* Editable Fields */}
                <div className="input-group full-width"><label>Street Address *</label><input type="text" value={data.street_address || ''} onChange={(e) => update('street_address', e.target.value)} placeholder="Kimathi" required /></div>
                <div className="input-group"><label>City *</label><input type="text" value={data.city || ''} onChange={(e) => update('city', e.target.value)} placeholder="Nyeri, Kenya" required /></div>
                <div className="input-group"><label>State/Region *</label><input type="text" value={data.state_region || ''} onChange={(e) => update('state_region', e.target.value)} placeholder="Central" required /></div>

                <div className="input-group full-width">
                    <label>About You</label>
                    <textarea value={data.about_you || ''} onChange={(e) => update('about_you', e.target.value)} placeholder="e.g., We are a thriving supermarket willing to offer excess goods, or I am an individual who donates regularly." rows={3} />
                </div>
            </div>
        </div>
    );
};

const Step2Verification: React.FC<{ 
    data: Partial<DonorProfileData>, 
    onFileUpload: (file: File) => void, // Returns void, as the function is async but we don't await the return value here
    isUploading: boolean,
    isCompany: boolean // 🚨 FIX 1: Prop added to interface
}> = ({ data, onFileUpload, isUploading, isCompany }) => { // 🚨 FIX 2: Prop destructured
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFileUpload(e.target.files[0]);
        }
    };

    return (
        <div className="wizard-step-card">
            <h2 className="step-card-title">Verification Documents</h2>
            <p className="step-subtitle">Help us ensure safety and trust in our community</p>

            <div className="info-box">
                <p><strong>Why we need verification:</strong> To maintain a safe and trustworthy platform, we verify all users. Your documents are encrypted and only used for verification purposes.</p>
            </div>
            
            <div className="form-grid-2">
                {/* Document 1: Government ID (REQUIRED for all) */}
                <div className={`input-group ${!isCompany ? 'full-width' : ''}`}>
                    <label>Government-Issued ID *</label>
                    <div 
                        className={`file-upload-box ${data.gov_id_url ? 'file-uploaded' : ''}`}
                        onClick={() => document.getElementById('file-upload-input-id')?.click()}
                    >
                        {isUploading && <span className="file-name">Uploading...</span>}
                        {!isUploading && data.gov_id_url && <span className="file-name"><FaCheckSquare /> Document Uploaded</span>}
                        {!isUploading && !data.gov_id_url && (
                            <>
                                <FaUpload size={30} />
                                <span>Upload ID Document</span>
                                <small>Driver's license, passport, or national ID</small>
                            </>
                        )}
                        <input id="file-upload-input-id" type="file" style={{ display: 'none' }} onChange={handleFileChange} accept="image/*,application/pdf" />
                    </div>
                </div>

                {/* Document 2: Registration Certificate (Conditional rendering using isCompany) */}
                {isCompany && (
                    <div className="input-group">
                        <label>Registration Certificate *</label>
                        <div 
                            className={`file-upload-box ${data.registration_cert_url ? 'file-uploaded' : ''}`}
                            onClick={() => document.getElementById('file-upload-input-cert')?.click()}
                        >
                            {isUploading && <span className="file-name">Uploading...</span>}
                            {!isUploading && data.registration_cert_url && <span className="file-name"><FaCheckSquare /> Certificate Uploaded</span>}
                            {!isUploading && !data.registration_cert_url && (
                                <>
                                    <FaUpload size={30} />
                                    <span>Upload Registration Certificate</span>
                                    <small>Official government/tax registration document</small>
                                </>
                            )}
                            <input id="file-upload-input-cert" type="file" style={{ display: 'none' }} onChange={handleFileChange} accept="image/*,application/pdf" />
                        </div>
                    </div>
                )}
            </div>
            <small className="upload-note full-width">All documents must be in JPG, PNG, or PDF format. Max size 5MB.</small>
            
            <div className="terms-note-text">
                 By completing this profile, you confirm your acceptance of the 
                 <a href="/terms" target="_blank"> Terms of Service</a> and 
                 <a href="/privacy" target="_blank"> Privacy Policy</a>, 
                 which were accepted during registration.
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
    const isCompany = currentUserRole === 'company'; // Defined here for passing to sub-components


    // 🔥 FIX 3: Safety Check and Redirection using useEffect (Resolves 'navigate()' warning)
    useEffect(() => {
        if (user === undefined) return; 
        setIsCheckingAuth(false);
        
        const isDonorRoute = (role === 'donor' || role === 'company');

        if (user === null) {
            navigate('/login', { replace: true });
            return;
        }

        // Check for INVALID ACCESS (Wrong role or already complete)
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
    
    // Simulating File Upload (Unified handler for both document types)
    const handleFileUpload = async (file: File) => {
        setIsUploading(true);
        setError(null);
        
        // Simple logic to determine which field to update (Gov ID is default, check for 'cert' in name)
        const fileUploadType = file.name.toLowerCase().includes('cert') ? 'registration_cert_url' : 'gov_id_url';

        try {
            console.log(`Starting upload for file: ${file.name} to field: ${fileUploadType}`); 
            await new Promise(resolve => setTimeout(resolve, 1500)); 
            
            updateProfileData(fileUploadType, `https://cdn.hopebridge.org/uploads/${user.user_id}-${fileUploadType}-${Date.now()}.pdf`);

        } catch (e) {
            setError("File upload failed.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleNext = () => {
        const d = profileData;
        // Step 1 Validation
        if (step === 1) {
            if (!d.street_address || !d.city || !d.state_region) {
                setError("Please complete all required location fields.");
                return;
            }
        }
        setError(null);
        setStep(step + 1);
    };

    // FINAL CORRECTED handleFinish with Role-Specific Validation
    const handleFinish = async () => {
        const d = profileData;
        
        // 1. Universal Validation: Gov ID is required for ALL donors/companies
        if (!d.gov_id_url) {
            setError("Please upload the Government-Issued ID.");
            return;
        }
        
        // 2. Conditional Validation: Registration Cert is ONLY required for companies
        if (isCompany && !d.registration_cert_url) {
            setError("Please upload the Company Registration Certificate.");
            return;
        }

        setIsLoading(true);
        setError(null);
        
        try {
            const res = await fetch(`http://localhost:3000/api/users/${user?.user_id}/profile/donor`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData), 
            });

            const data = await res.json();
            
            if (res.ok) {
                authLogin(data.accessToken, { ...user!, is_profile_complete: true }); 

                alert("Profile completed successfully!");
                navigate('/donor', { replace: true }); 
            } else {
                setError(data.message || "Failed to save profile. Please try again.");
            }
        } catch (err) {
            setError("Network error during profile submission.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return <Step1BasicInfo data={profileData} user={user} update={updateProfileData} />;
            case 2:
                // 🚨 FIX 4: Pass the isCompany flag correctly to the sub-component
                return <Step2Verification data={profileData} onFileUpload={handleFileUpload} isUploading={isUploading} isCompany={isCompany} />;
            default:
                return <div>Unexpected Step!</div>;
        }
    };

    // Main Render
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
                            // Disable if Gov ID is missing OR (isCompany AND Cert is missing)
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