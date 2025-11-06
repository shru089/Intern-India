import { useForm } from "react-hook-form";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

type FormValues = {
  name: string;
  department: string;
  skills: string; // Comma-separated
  gpa: number;
  location: string;
  prefDomains: string; // Comma-separated
  prefLocations: string; // Comma-separated
};

export default function StudentProfileSetup() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();
  const createProfile = useMutation(api.users.createStudentProfile);

  const onSubmit = (data: FormValues) => {
    const skillsArray = data.skills.split(",").map((s) => s.trim());
    const domainsArray = data.prefDomains.split(",").map((s) => s.trim());
    const locationsArray = data.prefLocations.split(",").map((s) => s.trim());

    toast.promise(
      createProfile({
        name: data.name,
        department: data.department,
        skills: skillsArray,
        gpa: Number(data.gpa),
        location: data.location,
        preferences: {
          domains: domainsArray,
          locations: locationsArray,
        },
      }),
      {
        loading: "Saving your profile...",
        success: "Profile saved successfully!",
        error: "Failed to save profile.",
      }
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Complete Your Student Profile</h1>
      <p className="text-secondary mb-6">
        This information will help us match you with the best internships.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label>Full Name</label>
          <input {...register("name", { required: true })} className="auth-input-field" />
          {errors.name && <span className="text-red-500">This field is required</span>}
        </div>
        <div>
          <label>Department / Major</label>
          <input {...register("department", { required: true })} className="auth-input-field" />
        </div>
        <div>
          <label>Skills (comma-separated)</label>
          <input {...register("skills", { required: true })} placeholder="e.g., React, Python, Figma" className="auth-input-field" />
        </div>
        <div>
          <label>GPA</label>
          <input type="number" step="0.1" {...register("gpa", { required: true, min: 0, max: 4 })} className="auth-input-field" />
          {errors.gpa && <span className="text-red-500">Please enter a valid GPA (0.0-4.0)</span>}
        </div>
        <div>
          <label>Your Current Location</label>
          <input {...register("location", { required: true })} className="auth-input-field" />
        </div>
        <div>
          <label>Preferred Internship Domains (comma-separated)</label>
          <input {...register("prefDomains")} placeholder="e.g., Web Development, AI/ML" className="auth-input-field" />
        </div>
        <div>
          <label>Preferred Locations (comma-separated)</label>
          <input {...register("prefLocations")} placeholder="e.g., Mumbai, Remote" className="auth-input-field" />
        </div>
        <button type="submit" className="auth-button">
          Save Profile
        </button>
      </form>
    </div>
  );
}
