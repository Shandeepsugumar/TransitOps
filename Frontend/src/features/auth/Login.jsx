import React from 'react';
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
      });
      toast.success('Login successful');
      navigate('/');
    },
    onError: (error) => {
      toast.error(error.backendMessage || 'Invalid credentials');
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F8] flex items-center justify-center p-4">
      <div className="bg-white border border-[#E5E5E7] shadow-sm rounded-lg w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#1C1C1E]">TransitOps</h1>
          <p className="text-[#6B6B70] mt-2">Sign in to your account</p>
        </div>

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

        <div className="mt-6 text-center">
          <Link to="/register" className="text-sm text-[#D97706] hover:underline">
            Don't have an account? Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
