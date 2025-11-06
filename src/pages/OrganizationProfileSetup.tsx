import { useForm } from "react-hook-form";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

type FormValues = {
  name: string;
  website: string;
  location: string;
};

export default function OrganizationProfileSetup() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();
  const createProfile = useMutation(api.users.createOrganizationProfile);

  const onSubmit = (data: FormValues) => {
    toast.promise(createProfile(data), {
      loading: "Saving your profile...",
      success: "Profile saved successfully!",
      error: "Failed to save profile.",
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Complete Your Organization Profile</h1>
      <p className="text-secondary mb-6">
        Tell us about your organization to attract the best talent.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label>Organization Name</label>
          <input {...register("name", { required: true })} className="auth-input-field" />
          {errors.name && <span className="text-red-500">This field is required</span>}
        </div>
        <div>
          <label>Website</label>
          <input type="url" {...register("website", { required: true })} placeholder="https://example.com" className="auth-input-field" />
          {errors.website && <span className="text-red-500">Please enter a valid URL</span>}
        </div>
        <div>
          <label>Headquarters Location</label>
          <input {...register("location", { required: true })} className="auth-input-field" />
        </div>
        <button type="submit" className="auth-button">
          Save Profile
        </button>
      </form>
    </div>
  );
}
