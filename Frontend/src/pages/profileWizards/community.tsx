
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import type { CommunityProfileData } from '../../types/community'; 
import { FaUpload, FaCheckSquare, FaArrowRight } from 'react-icons/fa'; 

// --- Organizer Type Definition ---
const focusAreas = ['Elderly Care', 'Education', 'Childrens Home', 'Skills Training', 'Other'];


const Step1BasicInfo: React.FC<any> = ({ data, user, update }) => {
    return (
        <div className="wizard-step-card">
            <h2 className="step-card-title">1. Organization Details</h2>
            <p className="step-subtitle">Define your group's focus and service area.</p>

            <div className="form-grid-2">
                {/* Read-Only Fields */}
                <div className="input-group"><label>Group Name *</label><input type="text" value={user?.company_name || user?.full_name || ''} readOnly disabled /></div>
                <div className="input-group"><label>Representative Email *</label><input type="email" value={user?.email || ''} readOnly disabled /></div>
                
                {/* Focus Area Selector */}
                <div className="input-group full-width">
                    <label>Primary Focus Area *</label>
                    <select
                        value={data.org_focus || ''}
                        onChange={(e) => update('org_focus', e.target.value)}
                        required
                    >
                        <option value="" disabled>Select your main area of activity</option>
                        {focusAreas.map(focus => (
                            <option key={focus} value={focus}>{focus}</option>
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

                {/* About Organization */}
                <div className="input-group full-width">
                    <label>About Our Mission</label>
                    <textarea
                        value={data.about_organization || ''}
                        onChange={(e) => update('about_organization', e.target.value)}
                        placeholder="e.g., We visit the local elderly community every weekend to provide social services."
                        rows={3}
                    />
                </div>
            </div>
        </div>
    );
};

const Step2Verification: React.FC<any> = ({ data, onFileUpload, isUploading }) => {
    
    // Helper function (same as company/donor wizard)
    const FileUploadBox = ({ label, subtext, urlKey }: { label: string, subtext: string, urlKey: keyof CommunityProfileData }) => {
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
                    {/* ... (Upload JSX remains the same) ... */}
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
            <p className="step-subtitle">Verification is required to ensure eligibility to organize volunteer activities.</p>

            <div className="info-box">
                <p><strong>Trust & Safety:</strong> We verify the legal status and identity of group representatives.</p>
            </div>
            
            <div className="form-grid-2">
                {/* Document 1: Representative's Government ID */}
                <FileUploadBox 
                    label="Representative's Govt. ID"
                    subtext="National ID or passport of the primary contact."
                    urlKey="gov_id_url"
                />
                
                {/* Document 2: Group Registration Certificate */}
                <FileUploadBox 
                    label="Group Registration/Charter"
                    subtext="Official group registration document or organizational charter."
                    urlKey="group_reg_cert_url"
                />
            </div>
            <small className="upload-note full-width">All documents must be in JPG, PNG, or PDF format. Max size 5MB.</small>
            
            <div className="terms-note-text">
                 Your documents will be reviewed by the HopeBridge Admin team.
            </div>

        </div>
    );
};


// --- Main Component (Structure) ---
const TOTAL_STEPS = 2;

export default function CommunityProfileWizard() {
    const { user, login: authLogin } = useAuth();
    const navigate = useNavigate();
    const { role } = useParams<{ role: string }>();

    const [step, setStep] = useState(1);
    const [profileData, setProfileData] = useState<Partial<CommunityProfileData>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // --- EFFECT: Safety Check ---
    useEffect(() => {
        if (user === undefined) return; 
        setIsCheckingAuth(false);
        
        const isCommunityRoute = (role === 'community');

        if (user === null) {
            navigate('/login', { replace: true });
            return;
        }

        // Check for INVALID ACCESS
        if (user.is_profile_complete || !isCommunityRoute || user.role !== 'community') {
            const destination = user.is_profile_complete ? `/${user.role}` : '/login';
            navigate(destination, { replace: true });
        }
        
    }, [user, navigate, role]);


    if (isCheckingAuth || !user) {
        return <div className="loading-screen">Verifying access...</div>;
    }


    const updateProfileData = (name: keyof CommunityProfileData, value: string) => {
        setProfileData(prev => ({ ...prev, [name]: value }));
    };
    
    // Simulating File Upload 
    const handleFileUpload = async (file: File, urlKey: keyof CommunityProfileData) => {
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
        // Step 1 Validation
        if (step === 1) {
            if (!d.org_focus || !d.street_address || !d.city || !d.state_region) {
                setError("Please complete all required fields, including your Primary Focus Area.");
                return;
            }
        }
        setError(null);
        setStep(step + 1);
    };

    const handleFinish = async () => {
        const d = profileData;
        
        // Final Validation: Check BOTH required documents
        if (!d.gov_id_url || !d.group_reg_cert_url) {
            setError("You must upload both the Representative ID and the Group Registration Certificate.");
            return;
        }

        setIsLoading(true);
        setError(null);
        
        try {
            // API call to the NEW Community endpoint
            const res = await fetch(`http://localhost:3000/api/communityprofile/${user.user_id}/profile/community`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData), 
            });

            const data = await res.json();
            
            if (res.ok) {
                authLogin(data.accessToken, { ...user, is_profile_complete: true }); 

                alert("Profile submitted! Your group status will be reviewed.");
                navigate('/community', { replace: true }); 
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
                return <Step2Verification data={profileData} onFileUpload={handleFileUpload} isUploading={isUploading} />;
            default:
                return <div>Unexpected Step!</div>;
        }
    };

    // Main Render
    return (
        <div className="wizard-container">
            <div className="wizard-box">
                <h1 className="wizard-title">Community Group Profile Completion</h1>
                
                <div className="wizard-step-tracker">
                    <span className={step === 1 ? 'active' : ''}>1. Group Details</span>
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
                            disabled={isLoading || isUploading || !profileData.gov_id_url || !profileData.group_reg_cert_url}
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