import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authApi } from '../../api/authApi';
import { useAuthStore } from '../../store/authStore';
import { Lock, Mail } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [warningMessage, setWarningMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      login({
        token: data.token,
        role: data.role,
        fullName: data.fullName,
        email: data.email,
        companyId: data.companyId,
      });
      toast.success('Login successful');
      if (data.role === 'SUPER_ADMIN' || data.role === 'ROLE_SUPER_ADMIN') {
        navigate('/admin/companies');
      } else {
        navigate('/');
      }
    },
    onError: (error) => {
      const msg = error.backendMessage || '';
      if (msg.toLowerCase().includes('pending approval') || error.response?.status === 403) {
        setWarningMessage('Your company registration is pending approval. Please wait for an administrator to approve it.');
      } else {
        setWarningMessage('');
        toast.error(msg || 'Invalid credentials');
      }
    },
  });

  const onSubmit = (data) => {
    setWarningMessage('');
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F8] flex items-center justify-center p-4">
      <div className="bg-white border border-[#E5E5E7] shadow-sm rounded-lg w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#1C1C1E]">TransitOps</h1>
          <p className="text-[#6B6B70] mt-2">Sign in to your account</p>
        </div>

        {warningMessage && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 flex items-start gap-3">
            <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <p className="text-sm">{warningMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#1C1C1E] mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('email')}
                type="email"
                className="pl-10 block w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-colors"
                placeholder="you@example.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1C1C1E] mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('password')}
                type="password"
                className="pl-10 block w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-colors"
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-[#D97706] text-white rounded-lg p-2.5 font-medium hover:bg-amber-700 transition-colors disabled:opacity-50"
          >
            {mutation.isPending ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <Link to="/register-company" className="text-sm text-[#D97706] hover:underline block">
            Registering a new company? Start here
          </Link>
        </div>
      </div>
    </div>
  );
}
