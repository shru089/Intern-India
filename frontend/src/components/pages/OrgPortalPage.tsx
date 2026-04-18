import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  PlusCircle,
  Users,
  TrendingUp,
  Briefcase,
  MapPin,
  ChevronRight,
  Star,
  BarChart2,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import PageWrapper from "../layout/PageWrapper";
import { apiClient } from "../../services/api";

// ── Types ──────────────────────────────────────────────────────────────────────

interface OrgInternship {
  id: number;
  title: string;
  company_name: string;
  location: string;
  domain: string;
  required_skills: string;
  stipend: string;
  duration_months: number;
  posted_at: string;
}

interface TopMatch {
  email: string;
  full_name: string | null;
  skills: string[];
  match_score: number;
  location: string | null;
  pref_domains: string[];
}

interface DashboardStats {
  total_listings: number;
  total_students_on_platform: number;
  total_applications: number;
  applications_by_status: Record<string, number>;
  top_skills_in_demand: { skill: string; count: number }[];
  domains: string[];
  recent_listings: {
    id: number;
    title: string;
    posted_at: string;
    location: string;
  }[];
}

interface PostForm {
  title: string;
  company_name: string;
  location: string;
  domain: string;
  required_skills: string;
  stipend: string;
  duration_months: string;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, color }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card p-5 flex items-center gap-4"
  >
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
    >
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-extrabold text-white">{value}</p>
      <p className="text-sm text-neutral-400">{label}</p>
    </div>
  </motion.div>
);

const ScoreBadge = ({ score }: { score: number }) => {
  const color =
    score >= 75
      ? "text-green-400 bg-green-400/10 border-green-400/30"
      : score >= 50
        ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/30"
        : "text-neutral-400 bg-neutral-700/40 border-neutral-600";
  return (
    <span
      className={`text-xs font-bold px-2.5 py-1 rounded-full border ${color}`}
    >
      {score.toFixed(0)}% match
    </span>
  );
};

// ── Post Internship Modal ─────────────────────────────────────────────────────

const DOMAINS = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Government",
  "E-commerce",
  "Analytics",
  "Design",
  "Research",
];

const PostModal = ({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [form, setForm] = useState<PostForm>({
    title: "",
    company_name: "",
    location: "",
    domain: "",
    required_skills: "",
    stipend: "",
    duration_months: "2",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (k: keyof PostForm, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title || !form.company_name || !form.required_skills) {
      setError("Title, Company, and Skills are required.");
      return;
    }
    setLoading(true);
    try {
      await apiClient.post("/orgs/internships", {
        ...form,
        duration_months: parseInt(form.duration_months) || 2,
      });
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(
        e?.response?.data?.detail ||
          "Failed to post. Please check your account role.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card w-full max-w-lg p-8 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <PlusCircle size={20} className="text-primary" /> Post New Internship
        </h2>

        <div className="space-y-4">
          {[
            {
              label: "Role Title *",
              key: "title",
              placeholder: "e.g. AI/ML Research Intern",
            },
            {
              label: "Company / Ministry *",
              key: "company_name",
              placeholder: "e.g. NITI Aayog",
            },
            {
              label: "Location",
              key: "location",
              placeholder: "e.g. Remote, New Delhi",
            },
            {
              label: "Required Skills * (comma-separated)",
              key: "required_skills",
              placeholder: "Python, Machine Learning, SQL",
            },
            {
              label: "Stipend",
              key: "stipend",
              placeholder: "e.g. ₹15,000/month or Unpaid",
            },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-neutral-300 mb-1">
                {label}
              </label>
              <input
                value={form[key as keyof PostForm]}
                onChange={(e) =>
                  handleChange(key as keyof PostForm, e.target.value)
                }
                placeholder={placeholder}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-700 bg-neutral-800/60 text-white placeholder-neutral-500 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">
                Domain
              </label>
              <select
                value={form.domain}
                onChange={(e) => handleChange("domain", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-700 bg-neutral-800/60 text-white focus:outline-none focus:border-primary"
              >
                <option value="">Select domain</option>
                {DOMAINS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">
                Duration (months)
              </label>
              <input
                type="number"
                min={1}
                max={24}
                value={form.duration_months}
                onChange={(e) =>
                  handleChange("duration_months", e.target.value)
                }
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-700 bg-neutral-800/60 text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 mt-4 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-6 w-full py-3 rounded-xl font-bold bg-primary text-white hover:bg-primary/80 transition-all disabled:opacity-50"
        >
          {loading ? "Posting…" : "Post Internship"}
        </button>
      </motion.div>
    </motion.div>
  );
};

// ── Top Matches Drawer ─────────────────────────────────────────────────────────

const MatchesDrawer = ({
  internship,
  onClose,
}: {
  internship: OrgInternship;
  onClose: () => void;
}) => {
  const [matches, setMatches] = useState<TopMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<TopMatch[]>(`/orgs/internships/${internship.id}/matches?top_n=10`)
      .then((res) => setMatches(res.data))
      .catch(() => setMatches([]))
      .finally(() => setLoading(false));
  }, [internship.id]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        className="glass-card w-full max-w-2xl p-8 relative max-h-[80vh] flex flex-col"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
          <Users size={20} className="text-primary" /> Top Matches
        </h2>
        <p className="text-sm text-neutral-400 mb-6">
          for{" "}
          <span className="text-white font-semibold">{internship.title}</span>
        </p>

        <div className="overflow-y-auto space-y-3 pr-1">
          {loading && (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
          )}
          {!loading && matches.length === 0 && (
            <p className="text-center text-neutral-500 py-8">
              No student profiles found yet.
            </p>
          )}
          {matches.map((m, i) => (
            <motion.div
              key={m.email}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 bg-neutral-800/50 rounded-xl p-4 border border-neutral-700"
            >
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                {(m.full_name || m.email)[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">
                  {m.full_name || m.email}
                </p>
                <p className="text-xs text-neutral-400 truncate">
                  {m.skills.slice(0, 4).join(" · ")}
                </p>
              </div>
              <ScoreBadge score={m.match_score} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────────

const OrgPortalPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [listings, setListings] = useState<OrgInternship[]>([]);
  const [selectedJob, setSelectedJob] = useState<OrgInternship | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const loadData = async () => {
    try {
      const [statsRes, listRes] = await Promise.all([
        apiClient.get<DashboardStats>("/orgs/dashboard"),
        apiClient.get<OrgInternship[]>("/orgs/internships"),
      ]);
      setStats(statsRes.data);
      setListings(Array.isArray(listRes.data) ? listRes.data : []);
    } catch {
      // org account may not be set up yet
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePostSuccess = () => {
    setSuccessMsg("Internship posted! Students are being matched now.");
    setTimeout(() => setSuccessMsg(""), 4000);
    loadData();
  };

  return (
    <PageWrapper>
      <div className="min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
              <Building2 className="text-primary" size={32} /> Organization
              Portal
            </h1>
            <p className="text-neutral-400 mt-1">
              Post internships and discover your best-matched candidates.
            </p>
          </div>
          <button
            id="post-internship-btn"
            onClick={() => setShowPostModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold bg-primary text-white hover:bg-primary/80 transition-all shadow-lg shadow-primary/20"
          >
            <PlusCircle size={18} /> Post Internship
          </button>
        </div>

        {/* Success toast */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 mb-6 bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl"
            >
              <Check size={16} /> {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
            <StatCard
              icon={Briefcase}
              label="Active Listings"
              value={stats.total_listings}
              color="bg-primary/30"
            />
            <StatCard
              icon={Users}
              label="Total Applications"
              value={stats.total_applications}
              color="bg-green-500/30"
            />
            <StatCard
              icon={Check}
              label="Applied"
              value={stats.applications_by_status?.applied || 0}
              color="bg-blue-500/30"
            />
            <StatCard
              icon={Star}
              label="Shortlisted"
              value={stats.applications_by_status?.shortlisted || 0}
              color="bg-yellow-500/30"
            />
            <StatCard
              icon={TrendingUp}
              label="Top Domain"
              value={stats.domains[0] || "—"}
              color="bg-purple-500/30"
            />
            <StatCard
              icon={BarChart2}
              label="Most Wanted Skill"
              value={stats.top_skills_in_demand[0]?.skill || "—"}
              color="bg-amber-500/30"
            />
          </div>
        )}

        {/* Listings */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-white mb-5">
            Your Internship Listings
          </h2>

          {listings.length === 0 ? (
            <div className="text-center py-16 text-neutral-500">
              <Briefcase size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No internships posted yet</p>
              <p className="text-sm mt-1">
                Click "Post Internship" to get matched with top students.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {listings.map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-neutral-800/50 rounded-xl p-4 border border-neutral-700 hover:border-primary/50 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white">{job.title}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Building2 size={13} /> {job.company_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={13} /> {job.location || "Remote"}
                      </span>
                      {job.domain && (
                        <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full border border-primary/20">
                          {job.domain}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(job.required_skills || "")
                        .split(",")
                        .slice(0, 5)
                        .map((sk) => (
                          <span
                            key={sk}
                            className="text-[11px] bg-neutral-700 text-neutral-300 px-2 py-0.5 rounded"
                          >
                            {sk.trim()}
                          </span>
                        ))}
                    </div>
                  </div>

                  <button
                    id={`view-matches-${job.id}`}
                    onClick={() => setSelectedJob(job)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-700 hover:bg-primary hover:text-white text-sm font-semibold transition-all shrink-0"
                  >
                    <Star size={14} /> View Matches <ChevronRight size={14} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Modals */}
        <AnimatePresence>
          {showPostModal && (
            <PostModal
              onClose={() => setShowPostModal(false)}
              onSuccess={handlePostSuccess}
            />
          )}
          {selectedJob && (
            <MatchesDrawer
              internship={selectedJob}
              onClose={() => setSelectedJob(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
};

export default OrgPortalPage;
