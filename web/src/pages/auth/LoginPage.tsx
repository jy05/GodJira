import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { settingsApi } from '@/services/settings.service';
import type { LoginRequest } from '@/types';
import { AxiosError } from 'axios';

interface LoginFormData extends LoginRequest {}

export const LoginPage = () => {
  const { login } = useAuth();
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  // Check if registration is enabled
  const { data: registrationEnabled, isLoading: isCheckingRegistration } = useQuery({
    queryKey: ['registration-status'],
    queryFn: () => settingsApi.isRegistrationEnabled(),
    retry: 1,
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const onSubmit = async (data: LoginFormData) => {
    if (isLoading) return; // Prevent double submission
    
    try {
      setIsLoading(true);
      setIsLocked(false);
      setLockoutTime(0);
      await login(data);
      toast.success('Login successful!');
    } catch (err) {
      const axiosError = err as AxiosError<any>;
      
      // Handle account lockout
      if (axiosError.response?.data?.message?.includes('locked')) {
        const lockoutMinutes = axiosError.response?.data?.lockoutMinutes || 15;
        setIsLocked(true);
        setLockoutTime(lockoutMinutes);
        toast.error(
          `Account locked due to too many failed attempts. Try again in ${lockoutMinutes} minutes.`,
          { duration: 10000 }
        );
      } 
      // Handle invalid credentials
      else if (axiosError.response?.status === 401) {
        toast.error('Invalid email or password. Please try again.');
      }
      // Handle rate limiting
      else if (axiosError.response?.status === 429) {
        const retryAfter = axiosError.response?.headers?.['retry-after'];
        const message = retryAfter
          ? `Too many requests. Please wait ${retryAfter} seconds before trying again.`
          : 'Too many requests. Please try again later.';
        toast.error(message, { duration: 10000 });
      }
      // Generic error
      else {
        toast.error(axiosError.response?.data?.message || 'An error occurred during login.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <img 
              src="/logo.png" 
              alt="GodJira Logo" 
              style={{ height: '300px' }}
              className="w-auto"
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          {!isCheckingRegistration && registrationEnabled && (
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                create a new account
              </Link>
            </p>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Lockout warning banner */}
          {isLocked && lockoutTime > 0 && (
            <div className="rounded-md p-4 bg-yellow-50 border border-yellow-200">
              <div className="flex">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Account Locked - Please wait {lockoutTime} minutes before trying again
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-md shadow-sm space-y-4">
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
                autoComplete="current-password"
                {...register('password', {
                  required: 'Password is required',
                })}
                className="input"
                placeholder="••••••••"
              />
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || isLocked}
              className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
