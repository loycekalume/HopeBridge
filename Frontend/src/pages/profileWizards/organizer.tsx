// OrganizerProfileWizard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import type { OrganizerProfileData } from '../../types/organizer'; 
import { FaUpload, FaCheckSquare, FaArrowRight } from 'react-icons/fa'; 
import { apiCall } from '../../utils/api'; 

// --- Organizer Type Definition ---
const organizerTypes = ['NGO Rep', 'Social Worker', 'Community Leader', 'Other'];


const Step1BasicInfo: React.FC<{ 
    data: Partial<OrganizerProfileData>, 
    user: any, 
    update: (name: keyof OrganizerProfileData, value: string) => void 
}> = ({ data, user, update }) => {
    return (
        <div className="wizard-step-card">
            <h2 className="step-card-title">1. Professional Information</h2>
            <p className="step-subtitle">Define your role and location on the platform.</p>

            <div className="form-grid-2">
                {/* Read-Only Fields */}
                <div className="input-group"><label>Full Name *</label><input type="text" value={user?.full_name || ''} readOnly disabled /></div>
                <div className="input-group"><label>Email Address *</label><input type="email" value={user?.email || ''} readOnly disabled /></div>
                
                {/* Organizer Type Selector (NEW FIELD) */}
                <div className="input-group full-width">
                    <label>Organizer Type *</label>
                    <select
                        value={data.organizer_type || ''}
                        onChange={(e) => update('organizer_type', e.target.value)}
                        required
                    >
                        <option value="" disabled>Select your primary role</option>
                        {organizerTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
                
                {/* Location Fields */}
                <div className="input-group full-width">
                    <label>Street Address *</label>
                    <input type="text" value={data.street_address || ''} onChange={(e) => update('street_address', e.target.value)} required />
                </div>
                <div className="input-group">
                    <label>City *</label>
                    <input type="text" value={data.city || ''} onChange={(e) => update('city', e.target.value)} required />
                </div>
                <div className="input-group">
                    <label>State/Region *</label>
                    <input type="text" value={data.state_region || ''} onChange={(e) => update('state_region', e.target.value)} required />
                </div>

                {/* About You */}
                <div className="input-group full-width">
                    <label>About Your Experience</label>
                    <textarea
                        value={data.about_me || ''}
                        onChange={(e) => update('about_me', e.target.value)}
                        placeholder="e.g., I have 10 years experience running local aid programs."
                        rows={3}
                    />
                </div>
            </div>
        </div>
    );
};

const Step2Verification: React.FC<{ 
    data: Partial<OrganizerProfileData>, 
    onFileUpload: (file: File, urlKey: keyof OrganizerProfileData) => void, 
    isUploading: boolean 
}> = ({ data, onFileUpload, isUploading }) => {
    
    // Helper to abstract the upload box rendering
    const FileUploadBox = ({ label, subtext, urlKey }: { label: string, subtext: string, urlKey: keyof OrganizerProfileData }) => {
        const isDocUploaded = data[urlKey];
        
        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files.length > 0) {
                onFileUpload(e.target.files[0], urlKey); 
                e.target.value = ''; // Clear input
            }
        };

        return (
            <div className="input-group">
                <label>{label} *</label>
                <div 
                    className={`file-upload-box ${isDocUploaded ? 'file-uploaded' : ''}`}
                    onClick={() => document.getElementById(`file-input-${urlKey}`)?.click()}
                >
                    {isUploading ? (
                        <span>Uploading...</span>
                    ) : isDocUploaded ? (
                        <span className="file-name"><FaCheckSquare /> {label} Uploaded</span>
                    ) : (
                        <>
                            <FaUpload size={30} />
                            <span>{label}</span>
                            <small>{subtext}</small>
                        </>
                    )}
                    <input id={`file-input-${urlKey}`} type="file" style={{ display: 'none' }} onChange={handleFileChange} accept="image/*,application/pdf" required />
                </div>
            </div>
        );
    };

    return (
        <div className="wizard-step-card">
            <h2 className="step-card-title">2. Verification Documents</h2>
            <p className="step-subtitle">Verification is required to ensure eligibility to handle donations and distributions.</p>

            <div className="info-box">
                <p><strong>Trust & Safety:</strong> We require professional documentation to authorize your role as a Verifier/Organizer.</p>
            </div>
            
            <div className="form-grid-2">
                {/* Document 1: Government ID */}
                <FileUploadBox 
                    label="Government-Issued ID"
                    subtext="National ID or passport for identity verification."
                    urlKey="gov_id_url"
                />
                
                {/* Document 2: Professional Certificate/ID (NEW) */}
                <FileUploadBox 
                    label="Professional Certificate / ID"
                    subtext="NGO ID, Social Worker License, or Employer verification letter."
                    urlKey="professional_cert_url"
                />
            </div>
            <small className="upload-note full-width">All documents must be in JPG, PNG, or PDF format. Max size 5MB.</small>
            
            <div className="terms-note-text">
                 Your documents will be reviewed by the HopeBridge Admin team.
            </div>

        </div>
    );
};


// --- Main Component ---
const TOTAL_STEPS = 2;

export default function OrganizerProfileWizard() {
    const { user, login: authLogin } = useAuth();
    const navigate = useNavigate();
    const { role } = useParams<{ role: string }>();

    const [step, setStep] = useState(1);
    const [profileData, setProfileData] = useState<Partial<OrganizerProfileData>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // --- EFFECT: Safety Check ---
    useEffect(() => {
        if (user === undefined) return; 
        setIsCheckingAuth(false);
        
        const isOrganizerRoute = (role === 'organizer');

        if (user === null) {
            navigate('/login', { replace: true });
            return;
        }

        // Check for INVALID ACCESS
        if (user.is_profile_complete || !isOrganizerRoute || user.role !== 'organizer') {
            const destination = user.is_profile_complete ? `/${user.role}` : '/login';
            navigate(destination, { replace: true });
        }
        
    }, [user, navigate, role]);


    if (isCheckingAuth || !user) {
        return <div className="loading-screen">Verifying access...</div>;
    }


    const updateProfileData = (name: keyof OrganizerProfileData, value: string) => {
        setProfileData(prev => ({ ...prev, [name]: value }));
    };
    
    // Simulating File Upload (Unified handler)
    const handleFileUpload = async (file: File, urlKey: keyof OrganizerProfileData) => {
        setIsUploading(true);
        setError(null);
        
        try {
            console.log(`Starting upload for file: ${file.name} to field: ${urlKey}`); 
            await new Promise(resolve => setTimeout(resolve, 1500)); 
            
            updateProfileData(urlKey, `https://cdn.hopebridge.org/uploads/${user.user_id}-${urlKey}-${Date.now()}.pdf`);

        } catch (e) {
            setError("File upload failed.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleNext = () => {
        const d = profileData;
        // Step 1 Validation: Check core fields including the new organizer_type
        if (step === 1) {
            if (!d.organizer_type || !d.street_address || !d.city || !d.state_region) {
                setError("Please complete all required fields, including your Organizer Type.");
                return;
            }
        }
        setError(null);
        setStep(step + 1);
    };

  // ✅ Make sure to import apiCall

const handleFinish = async () => {
    const d = profileData;

    // Validation: Ensure both required documents are uploaded
    if (!d.gov_id_url || !d.professional_cert_url) {
        setError("You must upload both the Government ID and the Professional Certificate/ID.");
        return;
    }

    setIsLoading(true);
    setError(null);

    try {
        // ✅ Use centralized API helper
        const data = await apiCall(
            `/api/organizerprofile/${user.user_id}/profile/organizer`,
            'PUT',
            profileData
        );

        // Update Auth Context with profile completion
        authLogin(data.accessToken, { ...user!, is_profile_complete: true });

        alert("Profile submitted! You will be notified once your organizer status is verified.");
        navigate('/organizer', { replace: true });

    } catch (err: any) {
        console.error("Profile submission error:", err);
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
                return <Step2Verification data={profileData} onFileUpload={handleFileUpload} isUploading={isUploading} />;
            default:
                return <div>Unexpected Step!</div>;
        }
    };

    // Main Render
    return (
        <div className="wizard-container">
            <div className="wizard-box">
                <h1 className="wizard-title">Organizer Profile Completion</h1>
                
                <div className="wizard-step-tracker">
                    <span className={step === 1 ? 'active' : ''}>1. Professional Info</span>
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
                            disabled={isLoading || isUploading || !profileData.gov_id_url || !profileData.professional_cert_url}
                        >
                            {isLoading ? 'Submitting Application...' : 'Submit for Verification'}
                            <FaArrowRight style={{ marginLeft: '10px' }} />
                        </button>
                    )}
                </div>
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
}