import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { companyApi } from '../../api/companyApi';
import { User, Mail, Lock, Building, FileText } from 'lucide-react';

const registerCompanySchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  registrationDetails: z.string().optional(),
  adminFullName: z.string().min(2, 'Admin full name must be at least 2 characters'),
  adminEmail: z.string().email('Invalid email address'),
  adminPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function RegisterCompany() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerCompanySchema),
  });

  const mutation = useMutation({
    mutationFn: companyApi.registerCompany,
    onSuccess: () => {
      setSuccess(true);
    },
    onError: (error) => {
      toast.error(error.backendMessage || 'Company registration failed');
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F7F7F8] flex items-center justify-center p-4">
        <div className="bg-white border border-[#E5E5E7] shadow-sm rounded-lg w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-[#1C1C1E] mb-2">Company Created Successfully!</h2>
          <p className="text-[#6B6B70] mb-6">Your company has been created and you are now the administrator. You can sign in immediately.</p>
          <Link to="/login" className="inline-block px-4 py-2 bg-[#D97706] text-white rounded-lg hover:bg-amber-700 transition-colors">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F8] flex items-center justify-center p-4">
      <div className="bg-white border border-[#E5E5E7] shadow-sm rounded-lg w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#1C1C1E]">TransitOps</h1>
          <p className="text-[#6B6B70] mt-2">Register your company</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Company Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('companyName')}
                type="text"
                className="pl-10 block w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-colors"
                placeholder="Acme Logistics"
              />
            </div>
            {errors.companyName && <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Registration Details</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('registrationDetails')}
                type="text"
                className="pl-10 block w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-colors"
                placeholder="Business Registration Number"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Admin Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('adminFullName')}
                type="text"
                className="pl-10 block w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-colors"
                placeholder="John Doe"
              />
            </div>
            {errors.adminFullName && <p className="mt-1 text-sm text-red-600">{errors.adminFullName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Admin Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('adminEmail')}
                type="email"
                className="pl-10 block w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-colors"
                placeholder="admin@example.com"
              />
            </div>
            {errors.adminEmail && <p className="mt-1 text-sm text-red-600">{errors.adminEmail.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('adminPassword')}
                type="password"
                className="pl-10 block w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-colors"
                placeholder="••••••••"
              />
            </div>
            {errors.adminPassword && <p className="mt-1 text-sm text-red-600">{errors.adminPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-[#D97706] text-white rounded-lg p-2.5 font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 mt-4"
          >
            {mutation.isPending ? 'Registering...' : 'Register Company'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-[#D97706] hover:underline">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
