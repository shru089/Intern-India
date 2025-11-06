import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export default function RoleSelector() {
  const createUserRole = useMutation(api.users.createUserRole);

  const handleSelectRole = (
    role: "student" | "organization" | "admin"
  ) => {
    createUserRole({ role });
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Choose Your Role</h1>
        <p className="text-secondary mt-2">
          Are you here to find an internship or to offer one?
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => handleSelectRole("student")}
          className="group relative overflow-hidden rounded-2xl border bg-white p-6 text-left shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 text-primary grid place-items-center font-semibold">
              S
            </div>
            <div>
              <h2 className="text-xl font-semibold">I am a Student</h2>
              <p className="mt-1 text-sm text-secondary">
                Find and apply for internships.
              </p>
            </div>
          </div>
        </button>
        <button
          onClick={() => handleSelectRole("organization")}
          className="group relative overflow-hidden rounded-2xl border bg-white p-6 text-left shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-accent/10 text-accent grid place-items-center font-semibold">
              O
            </div>
            <div>
              <h2 className="text-xl font-semibold">I am an Organization</h2>
              <p className="mt-1 text-sm text-secondary">
                Post internships and find talent.
              </p>
            </div>
          </div>
        </button>
      </div>
      {/* Admin role selection can be hidden or handled separately */}
    </div>
  );
}
