import { Toaster } from "sonner";
import StudentDashboard from "./components/StudentDashboard";
import OrganizationDashboard from "./components/OrganizationDashboard";
import AdminDashboard from "./components/AdminDashboard";
import RoleSelector from "./pages/RoleSelector";
import LoadingSpinner from "./components/LoadingSpinner";
import StudentProfileSetup from "./pages/StudentProfileSetup";
import OrganizationProfileSetup from "./pages/OrganizationProfileSetup";
import ChatbotWidget from "./components/ChatbotWidget";
import { useTheme } from "./hooks/useTheme";
import { useAuth } from "./contexts/AuthContext";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { useState, useEffect } from "react";
import { apiClient } from "./services/api";

export default function App() {
  const { theme, setTheme } = useTheme();
  const { token, loading: authLoading } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Fetch user data from backend
      // For now, we'll use a simple approach - in production decode JWT or call /auth/me
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [token]);

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0b1220] antialiased">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-md px-4 transition-all duration-300 ease-in-out hover:shadow-lg">
        <h2 className="text-xl font-semibold text-primary dark:text-white transition-transform duration-200 hover:scale-105">
          Intern-India
        </h2>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-2 rounded border text-sm bg-white dark:bg-[#1f2937] dark:text-white hover:bg-gray-50 dark:hover:bg-[#374151]"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
          <SignOutButton />
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8 transition-opacity duration-500 ease-in">
        <div className="w-full max-w-6xl mx-auto">
          {token ? (
            <Content userData={userData} setUserData={setUserData} />
          ) : (
            <div className="relative">
              <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent rounded-2xl" />
              <div className="w-full max-w-3xl mx-auto text-center py-8 md:py-12">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Find the right internship, faster
                </h1>
                <p className="mt-3 md:mt-4 text-lg md:text-xl text-secondary dark:text-gray-400">
                  Join students and organizations connecting through smart matching.
                </p>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-secondary dark:text-gray-400">
                  <div className="rounded-lg border bg-white dark:bg-[#111827] p-3 shadow-sm">Personalized matches</div>
                  <div className="rounded-lg border bg-white dark:bg-[#111827] p-3 shadow-sm">Verified organizations</div>
                  <div className="rounded-lg border bg-white dark:bg-[#111827] p-3 shadow-sm">Fast applications</div>
                </div>
                <div className="mt-8 w-full max-w-md mx-auto text-left">
                  <div className="rounded-2xl border bg-white dark:bg-[#111827] p-5 shadow-md">
                    <h2 className="text-lg font-semibold mb-3 dark:text-white">Sign in to continue</h2>
                    <SignInForm />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Toaster />
      {token && <ChatbotWidget />}
    </div>
  );
}

function Content({ userData, setUserData }: { userData: any; setUserData: any }) {
  const [profileComplete, setProfileComplete] = useState(false);
  const [role, setRole] = useState<"student" | "organization" | "admin">("student");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has profile
    // For prototype, we'll assume they need to complete profile
    setLoading(false);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!role) {
    return <RoleSelector onRoleSelect={setRole} />;
  }

  if (!profileComplete) {
    if (role === "student") {
      return <StudentProfileSetup onComplete={() => setProfileComplete(true)} />;
    }
    if (role === "organization") {
      return <OrganizationProfileSetup onComplete={() => setProfileComplete(true)} />;
    }
  }

  switch (role) {
    case "student":
      return <StudentDashboard />;
    case "organization":
      return <OrganizationDashboard />;
    case "admin":
      return <AdminDashboard />;
    default:
      return <div>Loading your dashboard...</div>;
  }
}
