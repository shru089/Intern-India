import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ListChecks, Bell, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import PageWrapper from '../layout/PageWrapper';
import ProfileCompletion from '../common/ProfileCompletion';
import MagicText from '../common/MagicText';

const BentoCard = ({ children, className = '', ...props }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    }}
    whileHover={{
      scale: 1.02,
      boxShadow: '0 0 40px -10px rgba(6, 182, 212, 0.5)',
    }}
    className={`glass-card p-6 relative overflow-hidden ${className}`}
    {...props}
  >
    {children}
  </motion.div>
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  return (
    <PageWrapper>
      <div className="min-h-screen background-emblem-dim">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">Dashboard</h2>
            <p className="text-neutral-400">Welcome back, {user.fullName.split(' ')[0]}!</p>
          </div>
          <div className="flex items-center gap-4">
             <button className="glass-card p-3 rounded-full hover:text-primary"><Bell size={20}/></button>
             <button className="glass-card p-3 rounded-full hover:text-primary"><Settings size={20}/></button>
          </div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 grid-rows-3 gap-6"
        >
          <BentoCard className="lg:col-span-2 xl:col-span-3 row-span-1" onClick={() => navigate('/find-internships')}>
            <div className="flex flex-col justify-between h-full cursor-pointer">
              <div>
                <Search className="text-primary mb-2" size={28} />
                <h3 className="text-xl font-bold text-white">Find New Internships</h3>
                <p className="text-neutral-400 mt-1">Use our AI to discover your next opportunity.</p>
              </div>
              <MagicText text="Get Matched →" className="text-lg font-semibold mt-4" />
            </div>
          </BentoCard>

          <BentoCard className="row-span-2">
             <ProfileCompletion completion={user.profileCompletion} />
          </BentoCard>

          <BentoCard className="lg:col-span-1 xl:col-span-2 row-span-2" onClick={() => navigate('/applied-internships')}>
             <div className="cursor-pointer h-full flex flex-col">
                <ListChecks className="text-secondary mb-2" size={28} />
                <h3 className="text-xl font-bold text-white">Track Applications</h3>
                <p className="text-neutral-400 mt-1">See the status of all your applications on an interactive board.</p>
                <div className="mt-auto pt-4">
                    {/* Mock Data */}
                    <div className="text-sm space-y-2">
                        <p className="font-semibold">Recent Activity:</p>
                        <p>• AI/ML Intern <span className="text-yellow-400">Under Review</span></p>
                        <p>• Data Analyst Intern <span className="text-green-400">Shortlisted</span></p>
                    </div>
                </div>
            </div>
          </BentoCard>
          
          <BentoCard>
             <h3 className="font-bold text-white">Profile Views</h3>
             <p className="text-5xl font-extrabold text-primary mt-2">12</p>
             <p className="text-xs text-neutral-400">+2 this week</p>
          </BentoCard>

           <BentoCard>
             <h3 className="font-bold text-white">Tip of the Day</h3>
             <p className="text-sm text-neutral-300 mt-2">Tailor your resume for each application to highlight relevant skills.</p>
          </BentoCard>

        </motion.div>
      </div>
    </PageWrapper>
  );
};

export default DashboardPage;
