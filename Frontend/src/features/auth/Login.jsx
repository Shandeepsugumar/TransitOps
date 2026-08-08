import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/authApi';
import { Truck, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);
      login(response);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.backendMessage || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-900 via-brand-800 to-brand-900 p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        <div className="p-8">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="bg-brand-500 p-3 rounded-2xl shadow-lg mb-4">
              <Truck className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">TransitOps</h1>
            <p className="text-brand-100 mt-2 text-sm font-medium">Fleet Management System</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-brand-50 mb-1">Email</label>
              <input
                type="email"
                {...register('email')}
                className={`w-full px-4 py-3 bg-white/5 border ${
                  errors.email ? 'border-red-400' : 'border-white/10'
                } rounded-xl text-white placeholder-brand-200/50 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all`}
                placeholder="admin@transitops.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-50 mb-1">Password</label>
              <input
                type="password"
                {...register('password')}
                className={`w-full px-4 py-3 bg-white/5 border ${
                  errors.password ? 'border-red-400' : 'border-white/10'
                } rounded-xl text-white placeholder-brand-200/50 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-brand-900 bg-white hover:bg-brand-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-900 focus:ring-white transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
