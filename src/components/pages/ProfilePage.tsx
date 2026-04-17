import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Save, Camera, User, X, CheckCircle, Briefcase, Link as LinkIcon } from 'lucide-react';

import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../api/api";
import PageWrapper from "../layout/PageWrapper";
import InputField from "../common/InputField";
import AnimatedButton from "../common/AnimatedButton";
import BackButton from "../common/BackButton";
import ProfileCompletion from '../common/ProfileCompletion';
import type { User as UserType } from '../../types';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};
const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
};

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [userDetails, setUserDetails] = useState<UserType | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!user) { navigate('/auth'); return; }
        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                const profileData = await api.getUserProfile(user.email);
                setUserDetails(profileData);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [navigate, user]);

    const handleSave = async () => {
        if (!user || !userDetails) return;
        setIsSaving(true);
        try {
            const { success } = await api.updateUserProfile(user.email, userDetails);
            if (success) {
                setIsEditing(false);
                setIsModalOpen(true);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setUserDetails(prev => prev ? { ...prev, [id]: value } : prev);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const newImageUrl = URL.createObjectURL(e.target.files[0]);
            setUserDetails(prev => prev ? { ...prev, profileImage: newImageUrl } : prev);
        }
    };

    if (isLoading || !userDetails) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary rounded-full border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <PageWrapper>
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
                            className="bg-neutral-800 border border-white/10 rounded-2xl p-8 text-center max-w-sm w-full"
                        >
                            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-white">Profile Updated!</h3>
                            <p className="text-neutral-400 mt-2 mb-6">Your changes have been saved successfully.</p>
                            <AnimatedButton onClick={() => setIsModalOpen(false)} className="w-full">Close</AnimatedButton>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <BackButton />
                    <h2 className="text-3xl font-bold text-white mt-2">My Profile</h2>
                </div>
                {isEditing ? (
                    <AnimatedButton onClick={handleSave} disabled={isSaving} icon={isSaving ? undefined : Save}>
                        {isSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Save Changes'}
                    </AnimatedButton>
                ) : (
                    <AnimatedButton onClick={() => setIsEditing(true)} icon={Edit}>Edit Profile</AnimatedButton>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div variants={itemVariants} initial="hidden" animate="visible" className="lg:col-span-1 space-y-6">
                    <div className="glass-card p-6 flex flex-col items-center text-center">
                        <div className="relative mb-4">
                            <div className="w-32 h-32 rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden border-4 border-primary/50 shadow-lg">
                                {userDetails.profileImage
                                    ? <img src={userDetails.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                    : <User className="w-16 h-16 text-neutral-500" />
                                }
                            </div>
                            <label htmlFor="avatar-upload" className={`absolute -bottom-1 -right-1 bg-primary text-white p-2 rounded-full shadow-md transition-all duration-300 ${isEditing ? 'cursor-pointer hover:bg-primary-dark scale-100' : 'scale-0'}`}>
                                <Camera size={20} />
                                <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} disabled={!isEditing} />
                            </label>
                        </div>
                        <h3 className="text-2xl font-bold text-white">{userDetails.fullName}</h3>
                        <p className="text-neutral-400">{userDetails.email}</p>
                    </div>
                    <ProfileCompletion completion={userDetails.profileCompletion ?? 0} />
                </motion.div>

                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="lg:col-span-2 space-y-8">
                    <motion.div variants={itemVariants} className="glass-card p-8">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><User size={20} /> Personal Details</h3>
                        <div className="space-y-6">
                            <InputField variant="dark" id="fullName" label="Full Name" type="text" value={userDetails.fullName} onChange={handleInputChange} disabled={!isEditing} className={isEditing ? 'input-edit-glow' : ''} placeholder="Your full name" />
                            <InputField variant="dark" id="email" label="Email Address" type="email" value={userDetails.email} disabled placeholder={userDetails.email} />
                            <InputField variant="dark" id="phoneNumber" label="Phone Number" type="tel" value={userDetails.phoneNumber ?? ''} onChange={handleInputChange} disabled={!isEditing} className={isEditing ? 'input-edit-glow' : ''} placeholder="+91 9876543210" />
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="glass-card p-8">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Briefcase size={20} /> Professional Details</h3>
                        <div className="space-y-6">
                            <InputField as="textarea" variant="dark" id="bio" label="Professional Summary / Bio" value={userDetails.bio ?? ''} onChange={handleInputChange} disabled={!isEditing} className={isEditing ? 'input-edit-glow' : ''} placeholder="A short bio about yourself..." />
                            <InputField variant="dark" id="skills" label="Skills (comma-separated)" type="text" value={userDetails.skills ?? ''} onChange={handleInputChange} disabled={!isEditing} placeholder="e.g., Python, React, Data Analysis" className={isEditing ? 'input-edit-glow' : ''} />
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="glass-card p-8">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><LinkIcon size={20} /> Online Presence</h3>
                        <div className="space-y-6">
                            <InputField variant="dark" id="linkedin" label="LinkedIn Profile URL" type="url" value={userDetails.linkedin ?? ''} onChange={handleInputChange} disabled={!isEditing} className={isEditing ? 'input-edit-glow' : ''} placeholder="https://linkedin.com/in/you" />
                            <InputField variant="dark" id="portfolio" label="Portfolio / Website URL" type="url" value={userDetails.portfolio ?? ''} onChange={handleInputChange} disabled={!isEditing} className={isEditing ? 'input-edit-glow' : ''} placeholder="https://yourportfolio.dev" />
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </PageWrapper>
    );
};

export default ProfilePage;