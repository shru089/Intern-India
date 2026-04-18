import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// A visual component to show the user's profile completion percentage.
const ProfileCompletion = ({ completion }) => {
    const navigate = useNavigate();
    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg">
            <h4 className="font-bold text-lg text-slate-800">Profile Completion</h4>
            <p className="text-sm text-slate-500 mt-1">Complete your profile for better matches.</p>
            <div className="flex items-center gap-4 mt-4">
                <div className="relative w-16 h-16">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path className="text-slate-200" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <motion.path 
                            className="text-secondary" strokeWidth="3" fill="none" strokeLinecap="round"
                            initial={{ strokeDasharray: `0, 100` }}
                            animate={{ strokeDasharray: `${completion}, 100` }}
                            transition={{ duration: 1, ease: 'easeInOut' }}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-secondary-dark">{completion}%</div>
                </div>
                <div>
                     <button onClick={() => navigate('/profile')} className="text-sm font-semibold text-primary-dark hover:underline">Update Profile</button>
                </div>
            </div>
        </motion.div>
    );
};

export default ProfileCompletion;
