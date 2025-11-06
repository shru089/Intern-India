import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Search, Home, MapPin, Building, CheckCircle, ChevronDown, PlusCircle, Check } from 'lucide-react';
import PageWrapper from '../layout/PageWrapper';
import InputField from '../common/InputField';
import AnimatedButton from '../common/AnimatedButton';
import { mockApi } from '../api/mockApi';
import { useAuth } from '../hooks/useAuth';

const InternshipFinderPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [preferences, setPreferences] = useState({ locations: '', isRural: false, socialCategory: '', sectors: [] });
    const [resume, setResume] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [matches, setMatches] = useState(null);
    const [appliedIds, setAppliedIds] = useState(new Set()); // --- NEW: To track applied internships in this session

    // --- NEW: Fetch existing applications to disable buttons ---
    useEffect(() => {
        const fetchAppliedStatus = async () => {
            if(user) {
                const applied = await mockApi.getAppliedInternships(user.email);
                setAppliedIds(new Set(applied.map(app => app.id)));
            }
        };
        fetchAppliedStatus();
    }, [user]);

    const handleNext = () => setStep(s => Math.min(s + 1, 3));
    const handlePrev = () => setStep(s => Math.max(s - 1, 1));
    
    const handleSubmit = async () => {
        if (!resume) {
            setError('Please upload your resume to proceed.');
            return;
        }
        setIsSubmitting(true);
        setError('');
        setMatches(null);
        try {
            const foundMatches = await mockApi.findInternships(preferences);
            setMatches(foundMatches);
            handleNext();
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- NEW: Handler for applying ---
    const handleApply = async (internshipId) => {
        try {
            await mockApi.applyForInternship(internshipId);
            setAppliedIds(prev => new Set(prev).add(internshipId)); // Update state to give instant feedback
        } catch (err) {
            console.error("Failed to apply:", err);
            // Optionally, show an error toast to the user
        }
    };
    
    const sectors = ['Technology', 'E-commerce', 'Analytics', 'Marketing', 'Design', 'Finance'];
    const socialCategories = ['General', 'OBC', 'SC', 'ST', 'EWS'];
    const steps = [{ name: 'Background' }, { name: 'Profession' }, { name: 'Results' }];

    return (
        <PageWrapper>
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
                <div className="w-full max-w-4xl">
                    <div className="glass-card overflow-hidden">
                        {/* Header and Steps remain the same... */}
                        <header className="p-6 border-b border-white/10">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h1 className="text-xl font-bold text-white">AI Internship Matchmaker</h1>
                                    <p className="text-sm text-neutral-400">Find your perfect government internship.</p>
                                </div>
                                <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 bg-neutral-800/50 hover:bg-neutral-700/50 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"><Home size={16} /> Dashboard</button>
                            </div>
                             <div className="flex items-center">
                                {steps.map((s, index) => (
                                    <React.Fragment key={index}>
                                        <div className="flex items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all ${index + 1 <= step ? 'bg-primary text-white' : 'bg-neutral-700 text-neutral-300'}`}>
                                                {index + 1}
                                            </div>
                                            <span className={`ml-2 font-semibold transition-all ${index + 1 <= step ? 'text-primary' : 'text-neutral-400'}`}>{s.name}</span>
                                        </div>
                                        {index < steps.length - 1 && <div className={`flex-1 h-1 mx-4 transition-all ${index + 1 < step ? 'bg-primary' : 'bg-neutral-700'}`}></div>}
                                    </React.Fragment>
                                ))}
                            </div>
                        </header>
                        
                        <AnimatePresence mode="wait">
                            <motion.div key={step} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.4, ease: "easeInOut" }}>
                                {step === 1 && (
                                    <div className="p-8 space-y-6">
                                        <h2 className="text-2xl font-bold text-white">1. Background Information</h2>
                                        {/* Step 1 content remains the same... */}
                                        <InputField variant="dark" id="location" label="Location Preference" value={preferences.locations} onChange={(e) => setPreferences(p => ({ ...p, locations: e.target.value }))} placeholder="e.g., Remote, Delhi" />
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-300 mb-2">Affirmative Action Details</label>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between bg-neutral-800/50 p-3 rounded-lg border-2 border-neutral-700">
                                                    <label htmlFor="isRural" className="font-medium">From a Rural / Aspirational District?</label>
                                                    <button onClick={() => setPreferences(p => ({...p, isRural: !p.isRural }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.isRural ? 'bg-primary' : 'bg-neutral-600'}`}>
                                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.isRural ? 'translate-x-6' : 'translate-x-1'}`} />
                                                    </button>
                                                </div>
                                                <div className="relative">
                                                    <select value={preferences.socialCategory} onChange={(e) => setPreferences(p => ({ ...p, socialCategory: e.target.value }))} className="w-full appearance-none px-4 py-3 border-2 border-neutral-700 bg-neutral-800/50 rounded-lg focus:outline-none focus:border-primary">
                                                        <option value="" disabled>Select Social Category...</option>
                                                        {socialCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-end pt-4"><AnimatedButton onClick={handleNext}>Next</AnimatedButton></div>
                                    </div>
                                )}

                                 {step === 2 && (
                                    <div className="p-8 space-y-6">
                                        <h2 className="text-2xl font-bold text-white">2. Professional Details</h2>
                                        {/* Step 2 content remains the same... */}
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-300 mb-2">Sector Interests</label>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {sectors.map(sector => (
                                                    <button type="button" key={sector} onClick={() => setPreferences(p => ({ ...p, sectors: p.sectors.includes(sector) ? p.sectors.filter(s => s !== sector) : [...p.sectors, sector] }))} className={`p-3 rounded-lg font-semibold text-center border-2 transition-all ${preferences.sectors.includes(sector) ? 'bg-primary text-white border-primary shadow-md' : 'bg-neutral-800/50 text-neutral-300 border-neutral-700 hover:border-primary hover:bg-primary/10'}`}>
                                                        {sector}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-300 mb-2">Upload Resume (PDF, DOCX)</label>
                                            <label htmlFor="resume-upload" className={`flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${resume ? 'border-green-500 bg-green-500/10' : 'border-neutral-700 hover:border-primary hover:bg-primary/10'}`}>
                                                <UploadCloud className={`w-8 h-8 mb-2 ${resume ? 'text-green-400' : 'text-neutral-500'}`} />
                                                <span className={`font-semibold ${resume ? `✓ ${resume.name}` : 'text-neutral-400'}`}>{resume ? `✓ ${resume.name}` : 'Click to upload'}</span>
                                                <input id="resume-upload" type="file" className="hidden" accept=".pdf,.docx" onChange={(e) => { setResume(e.target.files[0]); setError('') }} />
                                            </label>
                                            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                                        </div>
                                        <div className="flex justify-between pt-4">
                                            <button onClick={handlePrev} className="px-6 py-2 bg-neutral-700 text-white font-semibold rounded-lg hover:bg-neutral-600 transition-colors">Back</button>
                                            <AnimatedButton onClick={handleSubmit} disabled={isSubmitting} icon={isSubmitting ? null : Search}>
                                                {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Find Matches'}
                                            </AnimatedButton>
                                        </div>
                                    </div>
                                )}

                                 {step === 3 && (
                                    <div className="p-8">
                                        <div className="text-center">
                                            {/* Step 3 header remains the same */}
                                             <motion.div initial={{scale:0.5, opacity:0}} animate={{scale:1, opacity:1}} className="w-20 h-20 bg-green-500/10 text-green-400 rounded-full mx-auto flex items-center justify-center mb-4">
                                                <CheckCircle size={40}/>
                                            </motion.div>
                                            <h2 className="text-2xl font-bold text-white">AI Matchmaking Results</h2>
                                            <p className="text-neutral-400">Here are the top opportunities based on your profile.</p>
                                        </div>
                                        <div className="mt-6 space-y-4">
                                            {isSubmitting && <div className="text-center p-8">Loading...</div>}
                                            {matches && matches.map((match, i) => {
                                                const isApplied = appliedIds.has(match.id);
                                                return (
                                                <motion.div key={match.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-neutral-800/50 p-4 rounded-xl border-2 border-neutral-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-lg hover:border-primary transition-all">
                                                    <div className="flex-grow">
                                                        <h3 className="font-bold text-white">{match.title}</h3>
                                                        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-400 mt-1">
                                                            <span className="flex items-center gap-1.5"><Building size={14} /> {match.company}</span>
                                                            <span className="flex items-center gap-1.5"><MapPin size={14} /> {match.location}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-left sm:text-right w-full sm:w-auto mt-2 sm:mt-0 shrink-0 flex sm:flex-col items-center sm:items-end gap-2">
                                                        <p className="font-bold text-lg text-green-400">{(match.score * 100)}% Match</p>
                                                        {/* --- UPDATED BUTTON --- */}
                                                        <AnimatedButton 
                                                            onClick={() => handleApply(match.id)} 
                                                            disabled={isApplied}
                                                            icon={isApplied ? Check : PlusCircle}
                                                            className={`text-xs !px-4 !py-1.5 ${isApplied ? '!bg-green-600 !shadow-none' : ''}`}
                                                        >
                                                            {isApplied ? 'Tracked' : 'Track Application'}
                                                        </AnimatedButton>
                                                    </div>
                                                </motion.div>
                                            )})}
                                        </div>
                                        <div className="flex justify-center mt-8">
                                            <button onClick={() => {setStep(1); setMatches(null); setResume(null)}} className="px-6 py-2 bg-neutral-700 text-white font-semibold rounded-lg hover:bg-neutral-600 transition-colors">Start Over</button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default InternshipFinderPage;