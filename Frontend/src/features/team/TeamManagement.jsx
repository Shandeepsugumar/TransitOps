import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { Plus, Edit2 } from 'lucide-react';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { teamApi } from '../../api/teamApi';

const teamMemberSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  contactNumber: z.string().optional(),
  role: z.enum(['DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST']),
});

export default function TeamManagement() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(teamMemberSchema),
  });

  const { data: team = [], isLoading } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: teamApi.getTeamMembers,
  });

  const createMutation = useMutation({
    mutationFn: teamApi.addTeamMember,
    onSuccess: () => {
      toast.success('Team member added successfully');
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
      handleCloseModal();
    },
    onError: (error) => {
      toast.error(error.backendMessage || 'Failed to add team member');
    }
  });

  const updateMutation = useMutation({
    mutationFn: teamApi.updateTeamMember,
    onSuccess: () => {
      toast.success('Team member updated successfully');
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
      handleCloseModal();
    },
    onError: (error) => {
      toast.error(error.backendMessage || 'Failed to update team member');
    }
  });

  const handleOpenModal = (member = null) => {
    setEditingMember(member);
    if (member) {
      reset({
        fullName: member.fullName,
        email: member.email,
        contactNumber: member.contactNumber || '',
        role: member.role,
        password: '' // Don't pre-fill password for edit
      });
    } else {
      reset({
        fullName: '',
        email: '',
        password: '',
        contactNumber: '',
        role: 'DRIVER'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMember(null);
    reset();
  };

  const onSubmit = (data) => {
    if (editingMember) {
      const payload = { id: editingMember.id, ...data };
      if (!payload.password) delete payload.password; // Omit if empty on edit
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(data);
    }
  };

  const columns = [
    { header: 'Name', accessor: 'fullName' },
    { header: 'Email', accessor: 'email' },
    { 
      header: 'Role', 
      accessor: 'role',
      render: (role) => (
        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
          {role?.replace('ROLE_', '')}
        </span>
      )
    },
    { header: 'Contact', accessor: 'contactNumber' },
    {
      header: 'Actions',
      accessor: 'id',
      render: (_, row) => (
        <button 
          onClick={() => handleOpenModal(row)}
          className="p-1 text-[#D97706] hover:bg-amber-50 rounded"
          title="Edit"
        >
          <Edit2 size={18} />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1E]">Team Management</h1>
          <p className="text-[#6B6B70] mt-1">Manage your fleet drivers, safety officers, and analysts.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[#D97706] text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-700 transition-colors"
        >
          <Plus size={20} />
          <span>Add Member</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E7] overflow-hidden">
        <DataTable 
          columns={columns} 
          data={team} 
          isLoading={isLoading} 
        />
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingMember ? 'Edit Team Member' : 'Add Team Member'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div>
            <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Full Name</label>
            <input
              {...register('fullName')}
              type="text"
              className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
            />
            {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Email</label>
            <input
              {...register('email')}
              type="email"
              className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1C1C1E] mb-1">
              Password {editingMember && <span className="text-gray-400 font-normal">(Leave empty to keep current)</span>}
            </label>
            <input
              {...register('password')}
              type="password"
              className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Contact Number</label>
            <input
              {...register('contactNumber')}
              type="text"
              className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Role</label>
            <select
              {...register('role')}
              className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
            >
              <option value="DRIVER">Driver</option>
              <option value="SAFETY_OFFICER">Safety Officer</option>
              <option value="FINANCIAL_ANALYST">Financial Analyst</option>
            </select>
            {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 px-4 py-2 bg-white border border-[#E5E5E7] text-[#1C1C1E] rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 bg-[#D97706] text-white rounded-lg p-2 font-medium hover:bg-amber-700 transition-colors disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Member'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
