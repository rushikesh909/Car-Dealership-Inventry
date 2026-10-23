import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, CheckCircle2, Lock, Mail } from 'lucide-react';

interface RegisterFormInputs {
  email: string;
  password: string;
  confirmPassword: string;
}

export const RegisterPage: React.FC = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormInputs>();

  const passwordValue = watch('password', '');

  const onSubmit = async (data: RegisterFormInputs) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await registerAuth(data.email, data.password);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setErrorMessage(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center mx-auto shadow-xl shadow-brand-500/20 mb-4">
          <Car className="w-9 h-9 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Create an Account</h2>
        <p className="mt-2 text-sm text-slate-400">Join AutoVault dealership inventory platform</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800 py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-700/80">
          {errorMessage && (
            <div
              role="alert"
              className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm font-medium"
            >
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="reg-email"
                  type="email"
                  placeholder="buyer@dealership.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: 'Please enter a valid email address',
                    },
                  })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                />
                <Mail className="w-5 h-5 text-slate-500 absolute left-3 top-2.5" />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-rose-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type="password"
                  placeholder="At least 8 chars with 1 letter & 1 number"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters long',
                    },
                    pattern: {
                      value: /(?=.*[a-zA-Z])(?=.*[0-9])/,
                      message: 'Password must include at least one letter and one number',
                    },
                  })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                />
                <Lock className="w-5 h-5 text-slate-500 absolute left-3 top-2.5" />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-rose-400">{errors.password.message}</p>
              )}

              {/* Password strength checklist */}
              <div className="mt-2 text-xs space-y-1 text-slate-400">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      passwordValue.length >= 8 ? 'text-emerald-400' : 'text-slate-600'
                    }`}
                  />
                  <span>At least 8 characters</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      /(?=.*[a-zA-Z])(?=.*[0-9])/.test(passwordValue)
                        ? 'text-emerald-400'
                        : 'text-slate-600'
                    }`}
                  />
                  <span>Contains both letters and numbers</span>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="reg-confirm" className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="reg-confirm"
                  type="password"
                  placeholder="Repeat your password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (val) => val === passwordValue || 'Passwords do not match',
                  })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                />
                <Lock className="w-5 h-5 text-slate-500 absolute left-3 top-2.5" />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-rose-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-700/60 pt-4">
            Already registered?{' '}
            <Link
              to="/login"
              className="font-bold text-brand-400 hover:text-brand-300 transition-colors ml-1"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
