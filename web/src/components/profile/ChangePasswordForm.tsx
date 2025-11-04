import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authApi } from '@/services/auth.service';
import type { ChangePasswordRequest } from '@/types';

export const ChangePasswordForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordRequest & { confirmPassword: string }>();

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordRequest) => authApi.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully!');
      reset();
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ||
          'Failed to change password. Please check your current password and try again.'
      );
    },
  });

  const onSubmit = (data: ChangePasswordRequest & { confirmPassword: string }) => {
    const { currentPassword, newPassword } = data;
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  const newPassword = watch('newPassword');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Current Password */}
      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
          Current Password <span className="text-red-500">*</span>
        </label>
        <input
          id="currentPassword"
          type="password"
          {...register('currentPassword', {
            required: 'Current password is required',
          })}
          className="input mt-1"
          autoComplete="current-password"
        />
        {errors.currentPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>
        )}
      </div>

      {/* New Password */}
      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
          New Password <span className="text-red-500">*</span>
        </label>
        <input
          id="newPassword"
          type="password"
          {...register('newPassword', {
            required: 'New password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters',
            },
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
              message: 'Password must contain uppercase, lowercase, and number',
            },
          })}
          className="input mt-1"
          autoComplete="new-password"
        />
        {errors.newPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Must be at least 8 characters with uppercase, lowercase, and number
        </p>
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm New Password <span className="text-red-500">*</span>
        </label>
        <input
          id="confirmPassword"
          type="password"
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (value) => value === newPassword || 'Passwords do not match',
          })}
          className="input mt-1"
          autoComplete="new-password"
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Error and success messages now handled by toast */}

      {/* Submit Button */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => reset()}
          className="btn btn-secondary"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={changePasswordMutation.isPending}
          className="btn btn-primary"
        >
          {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
        </button>
      </div>
    </form>
  );
};
