import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import type { BeneficiaryProfileData } from '../../types/beneficiary'; // New Interface

import { FaUpload, FaCheckSquare, FaArrowRight } from 'react-icons/fa'; 



const Step1NeedsInfo: React.FC<{ 
    data: Partial<BeneficiaryProfileData>, 
    user: any, 
    update: (name: keyof BeneficiaryProfileData | 'phone', value: string) => void 
}> = ({ data, user, update }) => {
    return (
        <div className="wizard-step-card">
            <h2 className="step-card-title">1. Needs and Location</h2>
            <p className="step-subtitle">Tell us about your primary needs and location for assistance.</p>

            <div className="form-grid-2">
                {/* Read-Only Fields */}
                <div className="input-group"><label>Full Name *</label><input type="text" value={user?.full_name || ''} readOnly disabled /></div>
                <div className="input-group"><label>Email Address *</label><input type="email" value={user?.email || ''} readOnly disabled /></div>
                <div className="input-group full-width"><label>Phone Number *</label><input type="tel" value={user?.phone || ''} readOnly disabled /></div> 
                
                {/* Editable Location Fields */}
                <div className="input-group full-width">
                    <label>Street Address *</label>
                    <input type="text" value={data.street_address || ''} onChange={(e) => update('street_address', e.target.value)} placeholder="Kimathi, 4th Street" required />
                </div>
                <div className="input-group">
                    <label>City *</label>
                    <input type="text" value={data.city || ''} onChange={(e) => update('city', e.target.value)} placeholder="Nyeri, Kenya" required />
                </div>
                <div className="input-group">
                    <label>State/Region *</label>
                    <input type="text" value={data.state_region || ''} onChange={(e) => update('state_region', e.target.value)} placeholder="Central" required />
                </div>

                {/* About Needs */}
                <div className="input-group full-width">
                    <label>Tell us about your Needs (Required for verification) *</label>
                    <textarea
                        value={data.about_you_needs || ''}
                        onChange={(e) => update('about_you_needs', e.target.value)}
                        placeholder="e.g., I need assistance with educational materials for my two children, or I require food aid for my family this month."
                        rows={3}
                        required
                    />
                </div>
            </div>
        </div>
    );
};


const Step2Verification: React.FC<{ 
    data: Partial<BeneficiaryProfileData>, 
    onFileUpload: (file: File, urlKey: keyof BeneficiaryProfileData) => void, 
    isUploading: boolean 
}> = ({ data, onFileUpload, isUploading }) => {
    
    // Helper function to render a file upload box for a specific document type
    const FileUploadBox = ({ label, subtext, urlKey }: { label: string, subtext: string, urlKey: keyof BeneficiaryProfileData }) => {
        const isDocUploaded = data[urlKey];
        
        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files.length > 0) {
               
                onFileUpload(e.target.files[0], urlKey); 
                e.target.value = ''; // Clear input
            }
        };

        return (
            <div className="input-group full-width">
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
                    <input 
                        id={`file-input-${urlKey}`}
                        type="file" 
                        style={{ display: 'none' }} 
                        onChange={handleFileChange}
                        accept="image/*,application/pdf"
                        required
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="wizard-step-card">
            <h2 className="step-card-title">2. Verification Documents</h2>
            <p className="step-subtitle">To ensure resources go to those who need them most, please upload the following documents.</p>

            <div className="info-box">
                <p><strong>Verification is vital:</strong> Your documents are encrypted and reviewed by our Organizers to confirm your eligibility.</p>
            </div>
            
            <div className="form-grid-2">
                {/* Document 1: Government ID */}
                <FileUploadBox 
                    label="Government-Issued ID"
                    subtext="National ID or passport of the primary applicant."
                    urlKey="gov_id_url"
                />
                
                {/* Document 2: Proof of Need */}
                <FileUploadBox 
                    label="Proof of Need Document"
                    subtext="Medical statement, school enrollment, or income verification."
                    urlKey="proof_of_need_url"
                />

                {/* Document 3: Recommendation Letter (Optional for now) */}
                <FileUploadBox 
                    label="Recommendation Letter (Optional)"
                    subtext="Letter from a local religious leader, school, or social worker."
                    urlKey="recommendation_letter_url"
                />
            </div>
            <small className="upload-note full-width">All documents must be in JPG, PNG, or PDF format. Max size 5MB.</small>
            
            <div className="terms-note-text">
                 Your data will be used solely for platform safety and verification purposes.
            </div>

        </div>
    );
};


// --- Main Component ---
const TOTAL_STEPS = 2;

export default function BeneficiaryProfileWizard() {
    const { user, login: authLogin } = useAuth();
    const navigate = useNavigate();
    const { role } = useParams<{ role: string }>();

    const [step, setStep] = useState(1);
    const [profileData, setProfileData] = useState<Partial<BeneficiaryProfileData>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // --- EFFECT: Safety Check (Essential for robust routing) ---
    useEffect(() => {
        if (user === undefined) return; 
        setIsCheckingAuth(false);
        
        const isBeneficiaryRoute = (role === 'beneficiary');

        if (user === null) {
            navigate('/login', { replace: true });
            return;
        }

        // Check for INVALID ACCESS
        if (user.is_profile_complete || !isBeneficiaryRoute || user.role !== 'beneficiary') {
            const destination = user.is_profile_complete ? `/${user.role}` : '/login';
            navigate(destination, { replace: true });
        }
        
    }, [user, navigate, role]);


    if (isCheckingAuth || !user) {
        return <div className="loading-screen">Verifying access...</div>;
    }


    const updateProfileData = (name: keyof BeneficiaryProfileData | 'phone', value: string) => {
        setProfileData(prev => ({ ...prev, [name]: value as any }));
    };
    
    // 🔥 FIX 3: Corrected signature for handleFileUpload to accept urlKey
    const handleFileUpload = async (file: File, urlKey: keyof BeneficiaryProfileData) => {
        setIsUploading(true);
        setError(null);
        
        try {
            console.log(`Starting upload for file: ${file.name} to field: ${urlKey}`); 
            await new Promise(resolve => setTimeout(resolve, 1500)); 
            
            // On success, update the respective URL field
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
            if (!d.street_address || !d.city || !d.state_region || !d.about_you_needs) {
                setError("Please complete all required location and needs fields.");
                return;
            }
        }
        setError(null);
        setStep(step + 1);
    };

    const handleFinish = async () => {
        const d = profileData;
        
        // Final Validation: Check Gov ID and Proof of Need (Recommendation Letter is Optional)
        if (!d.gov_id_url || !d.proof_of_need_url) {
            setError("You must upload both the Government ID and the Proof of Need document.");
            return;
        }

        setIsLoading(true);
        setError(null);
        
        try {
            // API call to the Beneficiary endpoint
            const res = await fetch(`http://localhost:3000/api/beneficiaryprofile/${user.user_id}/profile/beneficiary`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData), 
            });

            const data = await res.json();
            
            if (res.ok) {
                // Update Auth Context: Flip the status
                authLogin(data.accessToken, { ...user!, is_profile_complete: true }); 

                alert("Profile submitted! Your application is now in the queue for verification.");
                navigate('/beneficiary', { replace: true }); // Redirect to final dashboard
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
                return <Step1NeedsInfo data={profileData} user={user} update={updateProfileData} />;
            case 2:
                // 🔥 FIX 4: Correctly pass the handleFileUpload function (signature now matches)
                return <Step2Verification data={profileData} onFileUpload={handleFileUpload} isUploading={isUploading} />;
            default:
                return <div>Unexpected Step!</div>;
        }
    };

    // Main Render
    return (
        <div className="wizard-container">
            <div className="wizard-box">
                <h1 className="wizard-title">Beneficiary Profile Completion</h1>
                
                <div className="wizard-step-tracker">
                    <span className={step === 1 ? 'active' : ''}>1. Needs Info</span>
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
                            disabled={isLoading || isUploading || !profileData.gov_id_url || !profileData.proof_of_need_url}
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