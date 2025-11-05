import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { settingsApi } from '@/services/settings.service';
import type { RegisterRequest } from '@/types';
import { AxiosError } from 'axios';
import { PASSWORD_RULES } from '@/config/constants';

interface RegisterFormData extends RegisterRequest {
  confirmPassword: string;
}

export const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string>('');
  const [passwordStrength, setPasswordStrength] = useState<string>('');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>();

  // Check if registration is enabled
  const { data: registrationStatus, isLoading: isCheckingStatus } = useQuery({
    queryKey: ['registration-status'],
    queryFn: () => settingsApi.isRegistrationEnabled(),
    retry: 1,
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const password = watch('password');

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

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError('');
      const { confirmPassword, ...registerData } = data;
      await registerUser(registerData);
    } catch (err) {
      const axiosError = err as AxiosError<any>;
      setError(axiosError.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  // Show loading state while checking registration status
  if (isCheckingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Show message if registration is disabled
  if (registrationStatus === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="flex justify-center">
              <img 
                src="/logo.png" 
                alt="GodJira Logo" 
                className="h-24 w-auto"
              />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Registration Disabled
            </h2>
          </div>
          <div className="rounded-md bg-yellow-50 p-6 border border-yellow-200">
            <p className="text-center text-gray-700">
              User registration is currently disabled. Please contact your administrator if you need access.
            </p>
          </div>
          <div className="text-center">
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <img 
              src="/logo.png" 
              alt="GodJira Logo" 
              className="h-24 w-auto"
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="name" className="label">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                {...register('name', {
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' },
                })}
                className="input"
                placeholder="John Doe"
              />
              {errors.name && <p className="error-text">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="label">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                className="input"
                placeholder="you@example.com"
              />
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
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
                <p className={`text-xs mt-1 ${
                  passwordStrength === 'Strong' ? 'text-green-600' :
                  passwordStrength === 'Good' ? 'text-blue-600' :
                  passwordStrength === 'Fair' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  Password strength: {passwordStrength}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {PASSWORD_RULES.hint}
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">
                Confirm Password
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
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
