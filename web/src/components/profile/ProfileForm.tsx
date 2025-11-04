import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { userApi } from '@/services/user.service';
import type { User } from '@/types';

interface ProfileFormProps {
  user: User;
}

interface ProfileFormData {
  name: string;
  email: string;
  bio?: string;
  jobTitle?: string;
  department?: string;
}

export const ProfileForm = ({ user }: ProfileFormProps) => {
  const { refreshUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: user.name,
      email: user.email,
      bio: user.bio || '',
      jobTitle: user.jobTitle || '',
      department: user.department || '',
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<ProfileFormData>) => userApi.updateProfile(data),
    onSuccess: () => {
      refreshUser();
      toast.success('Profile updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          {...register('name', {
            required: 'Name is required',
            minLength: { value: 2, message: 'Name must be at least 2 characters' },
          })}
          className="input mt-1"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Email (read-only) */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          disabled
          className="input mt-1 bg-gray-50 cursor-not-allowed"
        />
        <p className="mt-1 text-sm text-gray-500">
          Email cannot be changed. Contact an administrator if needed.
        </p>
      </div>

      {/* Job Title */}
      <div>
        <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">
          Job Title
        </label>
        <input
          id="jobTitle"
          type="text"
          {...register('jobTitle')}
          placeholder="e.g., Senior Developer"
          className="input mt-1"
        />
      </div>

      {/* Department */}
      <div>
        <label htmlFor="department" className="block text-sm font-medium text-gray-700">
          Department
        </label>
        <input
          id="department"
          type="text"
          {...register('department')}
          placeholder="e.g., Engineering"
          className="input mt-1"
        />
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
          Bio
        </label>
        <textarea
          id="bio"
          rows={4}
          {...register('bio', {
            maxLength: { value: 500, message: 'Bio must be less than 500 characters' },
          })}
          placeholder="Tell us about yourself..."
          className="input mt-1"
        />
        {errors.bio && (
          <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
        )}
      </div>

      {/* Role (read-only) */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Role</label>
        <div className="mt-1">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              user.role === 'ADMIN'
                ? 'bg-purple-100 text-purple-800'
                : user.role === 'MANAGER'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {user.role}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Your role determines your permissions in the system.
        </p>
      </div>

      {/* Error Message - now handled by toast */}

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!isDirty || updateMutation.isPending}
          className="btn btn-primary"
        >
          {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};
