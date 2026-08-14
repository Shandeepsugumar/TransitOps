import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { companyApi } from '../../api/companyApi';
import { Building, User, Mail, Lock, Phone, Briefcase, Search } from 'lucide-react';

const joinCompanySchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  contactNumber: z.string().optional(),
  role: z.enum(['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST']),
});

export default function JoinCompany() {
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      companyApi.searchCompanies(debouncedQuery).then(data => setSearchResults(data)).catch(() => setSearchResults([]));
    } else {
      setSearchResults([]);
    }
  }, [debouncedQuery]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(joinCompanySchema),
  });

  const mutation = useMutation({
    mutationFn: companyApi.joinCompany,
    onSuccess: () => {
      setSuccess(true);
    },
    onError: (error) => {
      toast.error(error.backendMessage || 'Failed to join company');
    },
  });

  const onSubmit = (data) => {
    if (!selectedCompany) return;
    mutation.mutate({ ...data, companyId: selectedCompany.id });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F7F7F8] flex items-center justify-center p-4">
        <div className="bg-white border border-[#E5E5E7] shadow-sm rounded-lg w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#1C1C1E] mb-2">Request Submitted</h2>
          <p className="text-[#6B6B70] mb-6">
            Your request to join {selectedCompany?.name} has been submitted. The company administrator will review your application.
          </p>
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
          <p className="text-[#6B6B70] mt-2">Join an existing company</p>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Search Company</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 block w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-colors"
                  placeholder="Type company name..."
                />
              </div>
            </div>
            
            {searchResults.length > 0 && (
              <div className="border border-[#E5E5E7] rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                {searchResults.map((company) => (
                  <button
                    key={company.id}
                    onClick={() => {
                      setSelectedCompany(company);
                      setStep(2);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-[#E5E5E7] last:border-0 flex items-center gap-3"
                  >
                    <Building className="h-5 w-5 text-[#6B6B70]" />
                    <div>
                      <div className="font-medium text-[#1C1C1E]">{company.name}</div>
                      <div className="text-xs text-[#6B6B70]">Select to join</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <form method="post" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="p-4 bg-gray-50 border border-[#E5E5E7] rounded-lg flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-[#D97706]" />
                <span className="font-medium text-[#1C1C1E]">{selectedCompany?.name}</span>
              </div>
              <button type="button" onClick={() => setStep(1)} className="text-sm text-[#D97706] hover:underline">
                Change
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('fullName')}
                  type="text"
                  className="pl-10 block w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-colors"
                  placeholder="John Doe"
                />
              </div>
              {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  className="pl-10 block w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-colors"
                  placeholder="john@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Password</label>
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
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Contact Number (Optional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('contactNumber')}
                  type="text"
                  className="pl-10 block w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-colors"
                  placeholder="+1 234 567 890"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Role</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  {...register('role')}
                  className="pl-10 block w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-colors appearance-none"
                >
                  <option value="FLEET_MANAGER">Fleet Manager</option>
                  <option value="DRIVER">Driver</option>
                  <option value="SAFETY_OFFICER">Safety Officer</option>
                  <option value="FINANCIAL_ANALYST">Financial Analyst</option>
                </select>
              </div>
              {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-[#D97706] text-white rounded-lg p-2.5 font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 mt-4"
            >
              {mutation.isPending ? 'Submitting...' : 'Join Company'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center space-y-2">
          <Link to="/register-company" className="text-sm text-[#D97706] hover:underline block">
            Register a new company instead
          </Link>
          <Link to="/login" className="text-sm text-[#D97706] hover:underline block">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
