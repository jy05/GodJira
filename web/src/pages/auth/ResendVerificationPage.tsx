import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import authService from '@/services/auth.service';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

interface ResendFormData {
  email: string;
}

export const ResendVerificationPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResendFormData>();

  const onSubmit = async (data: ResendFormData) => {
    try {
      setIsSubmitting(true);
      setSuccess(false);
      await authService.resendVerification(data.email);
      setSuccess(true);
      toast.success('Verification email sent! Check your inbox (or Mailhog at localhost:8025)');
    } catch (err) {
      const axiosError = err as AxiosError<any>;
      toast.error(axiosError.response?.data?.message || 'Failed to send verification email');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-4xl font-bold text-primary-600">GodJira</h1>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Resend Verification Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address to receive a new verification link
          </p>
        </div>

        {success ? (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Email sent!</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    Check your email inbox for the verification link. If you're in development, check{' '}
                    <a
                      href="http://localhost:8025"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium underline"
                    >
                      Mailhog (localhost:8025)
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
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
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </div>

            <div className="text-center text-sm">
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
