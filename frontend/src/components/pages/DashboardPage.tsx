import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ListChecks, Bell, Settings, Sparkles, TrendingUp, Award } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import PageWrapper from '../layout/PageWrapper';
import ProfileCompletion from '../common/ProfileCompletion';
import MagicText from '../common/MagicText';

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const BentoCard = ({ children, className = '', ...props }: BentoCardProps) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    }}
    whileHover={{
      scale: 1.02,
      boxShadow: '0 0 40px -10px rgba(6, 182, 212, 0.5)',
    }}
    className={`glass-card p-6 relative overflow-hidden transition-all duration-300 ${className}`}
    {...props}
  >
    {children}
  </motion.div>
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [insights, setInsights] = React.useState<{ summary: string; recommendations: string[] } | null>(null);
  const [dashboardData, setDashboardData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const [insightsData, dashData] = await Promise.all([
          api.getCareerInsights(user.id),
          api.getStudentDashboard()
        ]);
        setInsights(insightsData);
        setDashboardData(dashData);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

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
            <p className="text-neutral-400">Welcome back, {(user.fullName || user.email || 'User').split(' ')[0]}!</p>
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
          <BentoCard className="lg:col-span-2 xl:col-span-2 row-span-1" onClick={() => navigate('/find-internships')}>
            <div className="flex flex-col justify-between h-full cursor-pointer">
              <div>
                <Search className="text-primary mb-2" size={28} />
                <h3 className="text-xl font-bold text-white">Find New Internships</h3>
                <p className="text-neutral-400 mt-1">Use our AI to discover your next opportunity.</p>
              </div>
              <MagicText text="Get Matched →" className="text-lg font-semibold mt-4" />
            </div>
          </BentoCard>

          <BentoCard className="lg:col-span-1 xl:col-span-1 row-span-2">
             <div className="h-full flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="text-yellow-400" size={24} />
                    <h3 className="text-xl font-bold text-white">AI Career Scout</h3>
                </div>
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-neutral-300 leading-relaxed italic">
                            "{insights?.summary || 'Scanning current trends to provide your personalized career map...'}"
                        </p>
                        {insights?.recommendations && (
                            <div className="space-y-2">
                                {insights.recommendations.map((rec: string, i: number) => (
                                    <div key={i} className="flex items-center gap-2 text-xs text-neutral-400">
                                        <TrendingUp size={12} className="text-primary" />
                                        <span>{rec}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
             </div>
          </BentoCard>

          <BentoCard className="row-span-2">
             <ProfileCompletion completion={dashboardData?.stats?.profile_completion || user.profileCompletion || 0} />
          </BentoCard>

          <BentoCard className="lg:col-span-1 xl:col-span-2 row-span-2" onClick={() => navigate('/applied-internships')}>
             <div className="cursor-pointer h-full flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <ListChecks className="text-secondary" size={28} />
                    <span className="bg-secondary/20 text-secondary text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {dashboardData?.stats?.applications_count || 0} ACTIVE
                    </span>
                </div>
                <h3 className="text-xl font-bold text-white">Track Applications</h3>
                <p className="text-neutral-400 mt-1">Status updates, interview calls and more.</p>
                <div className="mt-auto pt-6">
                    <div className="space-y-3">
                        {dashboardData?.recent_applications?.length > 0 ? (
                            dashboardData.recent_applications.map((app: any) => (
                                <div key={app.id} className="flex justify-between items-center text-xs">
                                   <span className="text-neutral-300 truncate max-w-[150px]">{app.title}</span>
                                   <span className={`font-bold uppercase tracking-widest text-[8px] ${app.status === 'accepted' ? 'text-green-400' : 'text-yellow-400'}`}>
                                      {app.status}
                                   </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-[10px] text-neutral-500 italic">No recent activity found.</p>
                        )}
                    </div>
                </div>
            </div>
          </BentoCard>
          
          <BentoCard>
             <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg"><Award className="text-primary" size={20}/></div>
                <h3 className="font-bold text-white">Achievements</h3>
             </div>
             <p className="text-4xl font-extrabold text-white mt-3">3</p>
             <p className="text-xs text-neutral-400 mt-1">Badges earned</p>
          </BentoCard>

           <BentoCard className="xl:col-span-1">
             <h3 className="font-bold text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-green-400"/>
                Market Pulse
             </h3>
             <p className="text-sm text-neutral-300 mt-2">Demand for <span className="text-primary">React + FastAPI</span> developers is up 12% this month.</p>
          </BentoCard>

        </motion.div>
      </div>
    </PageWrapper>
  );
};

export default DashboardPage;
