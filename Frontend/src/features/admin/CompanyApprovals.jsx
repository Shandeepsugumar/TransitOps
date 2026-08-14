import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Check, X } from 'lucide-react';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import { adminApi } from '../../api/adminApi';

export default function CompanyApprovals() {
  const queryClient = useQueryClient();
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, id: null, action: null });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['pendingApprovals'],
    queryFn: adminApi.getPendingApprovals,
  });

  const approveMutation = useMutation({
    mutationFn: adminApi.approveUser,
    onSuccess: (data) => {
      toast.success(data?.message || 'User approved successfully');
      setConfirmDialog({ isOpen: false, id: null, action: null });
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
    },
    onError: (error) => {
      toast.error(error.backendMessage || 'Failed to approve user');
      setConfirmDialog({ isOpen: false, id: null, action: null });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: adminApi.rejectUser,
    onSuccess: () => {
      toast.success('User rejected');
      setConfirmDialog({ isOpen: false, id: null, action: null });
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
    },
    onError: (error) => {
      toast.error(error.backendMessage || 'Failed to reject user');
    }
  });

  const handleAction = (id, action) => {
    setConfirmDialog({ isOpen: true, id, action });
  };

  const confirmAction = () => {
    if (confirmDialog.action === 'approve') {
      approveMutation.mutate(confirmDialog.id);
    } else if (confirmDialog.action === 'reject') {
      rejectMutation.mutate(confirmDialog.id);
    }
  };

  const columns = [
    { header: 'Name', accessor: 'fullName' },
    { header: 'Email', accessor: 'email' },
    { 
      header: 'Role', 
      accessor: 'role',
      render: (role) => <StatusBadge status={role} />
    },
    { header: 'Contact', accessor: 'contactNumber' },
    {
      header: 'Actions',
      accessor: 'id',
      render: (id) => (
        <div className="flex gap-2">
          <button 
            onClick={() => handleAction(id, 'approve')}
            disabled={approveMutation.isPending || rejectMutation.isPending}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
            title="Approve"
          >
            <Check size={18} />
          </button>
          <button 
            onClick={() => handleAction(id, 'reject')}
            disabled={approveMutation.isPending || rejectMutation.isPending}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Reject"
          >
            <X size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Pending Approvals</h1>
        <p className="text-[#6B6B70] mt-1">Review join requests for your company.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E7] overflow-hidden">
        {users.length === 0 && !isLoading ? (
          <div className="p-8 text-center text-[#6B6B70]">
            No pending join requests.
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={users} 
            isLoading={isLoading} 
          />
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, id: null, action: null })}
        onConfirm={confirmAction}
        title={confirmDialog.action === 'approve' ? 'Approve User' : 'Reject User'}
        message={`Are you sure you want to ${confirmDialog.action} this user?`}
        confirmText={confirmDialog.action === 'approve' ? 'Approve' : 'Reject'}
        isDestructive={confirmDialog.action === 'reject'}
      />
    </div>
  );
}
