
import React, { useState, useEffect } from 'react'; 
import { useNavigate, useParams } from 'react-router-dom'; 
import { useAuth } from '../../context/authContext';
import type { DonorProfileData } from '../../types/donorProfile';
import '../../styles/donorProfile.css';
import { FaUpload, FaCheckSquare } from 'react-icons/fa'; 



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
    onFileUpload: (file: File) => void, 
    isUploading: boolean 
}> = ({ data, onFileUpload, isUploading }) => {
    
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
            
            <div className="input-group full-width">
                <label>Government-Issued ID *</label>
                <div 
                    className={`file-upload-box ${data.gov_id_url ? 'file-uploaded' : ''}`}
                    onClick={() => document.getElementById('file-upload-input')?.click()}
                >
                    {isUploading ? (
                        <span>Uploading...</span>
                    ) : data.gov_id_url ? (
                        <span className="file-name"><FaCheckSquare /> Document Uploaded</span>
                    ) : (
                        <>
                            <FaUpload size={30} />
                            <span>Upload ID Document</span>
                            <small>Driver's license, passport, or national ID</small>
                        </>
                    )}
                    <input id="file-upload-input" type="file" style={{ display: 'none' }} onChange={handleFileChange} accept="image/*,application/pdf" required />
                </div>
                <small className="upload-note">Only JPG, PNG, or PDF files. Max size 5MB.</small>
            </div>
            
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
    const { role } = useParams<{ role: string }>(); // Get role from URL params

    const [step, setStep] = useState(1);
    const [profileData, setProfileData] = useState<Partial<DonorProfileData>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true); // State to control initial rendering

    // 🔥 FIX: Safety Check and Redirection using useEffect (runs AFTER render)
    useEffect(() => {
        // Only run check if user state is ready (not undefined)
        if (user === undefined) return; 

        setIsCheckingAuth(false);
        
        const isDonorRoute = (role === 'donor' || role === 'company');

        // 1. Check if user is logged out (user is explicitly null)
        if (user === null) {
            navigate('/login', { replace: true });
            return;
        }

        // 2. Check for INVALID ACCESS (Wrong role for this wizard OR already complete)
        // Note: The user.role in the context must match the URL role (donor/company)
        if (user.is_profile_complete || !isDonorRoute || (user.role !== 'donor' && user.role !== 'company')) {
            
            // Determine the safe destination
            const destination = user.is_profile_complete ? `/${user.role}` : '/login';
            
            // Only redirect if the current page is not the final destination
            navigate(destination, { replace: true });
        }
        
    }, [user, navigate, role]); // Re-run if user state or URL changes

    // ------------------------------------------
    // Render Loading State while Auth is being checked
    if (isCheckingAuth || !user) {
        // Display a simple loading screen to prevent UI flash while checking
        return <div className="loading-screen">Verifying profile access...</div>;
    }
    // ------------------------------------------


    const updateProfileData = (name: keyof DonorProfileData, value: string) => {
        setProfileData(prev => ({ ...prev, [name]: value }));
    };
    
    // Simulating File Upload
    const handleFileUpload = async (file: File) => {
        setIsUploading(true);
        setError(null);
        try {
            console.log("Starting upload for file:", file.name, "of type:", file.type); 
            await new Promise(resolve => setTimeout(resolve, 3000)); 
            
            updateProfileData('gov_id_url', `https://cdn.hopebridge.org/ids/${user.user_id}-${Date.now()}.pdf`);

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

    const handleFinish = async () => {
        const d = profileData;
        
        // Final Step 2 Validation: Check only for the document upload
        if (!d.gov_id_url) {
            setError("Please upload a Government-Issued ID.");
            return;
        }

        setIsLoading(true);
        setError(null);
        
        try {
            // NOTE: URL updated to match the backend structure we agreed upon: /api/users/:userId/profile/donor
            const res = await fetch(`http://localhost:3000/api/donorprofile/${user.user_id}/profile/donor`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData), 
            });

            const data = await res.json();
            
            if (res.ok) {
                // Update Auth Context: Crucial! Mark the user as complete.
                authLogin(data.accessToken, { ...user, is_profile_complete: true }); 

                alert("Profile completed successfully! We will review your verification documents shortly.");
                navigate('/donor', { replace: true }); // Redirect to final dashboard
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

    // Main Render: Only execute if checks passed
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
                        <button className="finish-btn" onClick={handleFinish} disabled={isLoading || isUploading || !profileData.gov_id_url}>
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