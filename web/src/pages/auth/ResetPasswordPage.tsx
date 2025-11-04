import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import authService from '@/services/auth.service';
import { PASSWORD_RULES } from '@/config/constants';
import { AxiosError } from 'axios';

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<string>('');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>();

  const password = watch('password');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token');
    }
  }, [token]);

  const checkPasswordStrength = (pwd: string) => {
    if (!pwd) return '';
    const strength = [];
    if (pwd.length >= 12) strength.push('length');
    if (/[a-z]/.test(pwd)) strength.push('lowercase');
    if (/[A-Z]/.test(pwd)) strength.push('uppercase');
    if (/\d/.test(pwd)) strength.push('digit');
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength.push('special');

    const score = strength.length;
    if (score <= 2) return 'Weak';
    if (score === 3) return 'Fair';
    if (score === 4) return 'Good';
    return 'Strong';
  };

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('Invalid reset token');
      return;
    }

    try {
      setError('');
      await authService.resetPassword(token, data.password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      const axiosError = err as AxiosError<any>;
      setError(
        axiosError.response?.data?.message ||
          'Failed to reset password. The link may have expired.'
      );
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">
              Invalid or missing reset token. Please request a new password reset.
            </p>
            <div className="mt-4">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                Request password reset
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-4xl font-bold text-primary-600">GodJira</h1>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Set new password
          </h2>
        </div>

        {success ? (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Password reset successful!
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Your password has been reset. Redirecting to login...</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="password" className="label">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...register('password', {
                    required: 'Password is required',
                    pattern: {
                      value: PASSWORD_RULES.regex,
                      message: PASSWORD_RULES.message,
                    },
                    onChange: (e) => setPasswordStrength(checkPasswordStrength(e.target.value)),
                  })}
                  className="input"
                  placeholder="••••••••"
                />
                {errors.password && <p className="error-text">{errors.password.message}</p>}
                {password && passwordStrength && (
                  <p
                    className={`text-xs mt-1 ${
                      passwordStrength === 'Strong'
                        ? 'text-green-600'
                        : passwordStrength === 'Good'
                        ? 'text-blue-600'
                        : passwordStrength === 'Fair'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    Password strength: {passwordStrength}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">{PASSWORD_RULES.hint}</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="label">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) => value === password || 'Passwords do not match',
                  })}
                  className="input"
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="error-text">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Resetting password...' : 'Reset password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
