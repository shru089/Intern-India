import { useAuth } from "./contexts/AuthContext";

export function SignOutButton() {
  const { token, logout } = useAuth();

  if (!token) {
    return null;
  }

  return (
    <button
      className="px-4 py-2 rounded bg-white text-secondary border border-gray-200 font-semibold hover:bg-gray-50 hover:text-secondary-hover transition-colors shadow-sm hover:shadow"
      onClick={logout}
    >
      Sign out
    </button>
  );
}
