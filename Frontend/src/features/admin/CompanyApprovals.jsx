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
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, id: null, action: null }); // action: 'approve' | 'reject'

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['pendingCompanies'],
    queryFn: adminApi.getPendingCompanies,
  });

  const approveMutation = useMutation({
    mutationFn: adminApi.approveCompany,
    onSuccess: () => {
      toast.success('Company approved successfully');
      queryClient.invalidateQueries({ queryKey: ['pendingCompanies'] });
    },
    onError: (error) => {
      toast.error(error.backendMessage || 'Failed to approve company');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: adminApi.rejectCompany,
    onSuccess: () => {
      toast.success('Company rejected');
      queryClient.invalidateQueries({ queryKey: ['pendingCompanies'] });
    },
    onError: (error) => {
      toast.error(error.backendMessage || 'Failed to reject company');
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
    { header: 'Company Name', accessor: 'name' },
    { header: 'Registration Details', accessor: 'registrationDetails' },
    { header: 'Admin', accessor: 'adminFullName' },
    { header: 'Email', accessor: 'adminEmail' },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (status) => <StatusBadge status={status || 'PENDING'} />
    },
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
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Company Approvals</h1>
        <p className="text-[#6B6B70] mt-1">Review and approve new company registrations.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E7] overflow-hidden">
        <DataTable 
          columns={columns} 
          data={companies} 
          isLoading={isLoading} 
        />
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, id: null, action: null })}
        onConfirm={confirmAction}
        title={confirmDialog.action === 'approve' ? 'Approve Company' : 'Reject Company'}
        message={`Are you sure you want to ${confirmDialog.action} this company registration?`}
        confirmText={confirmDialog.action === 'approve' ? 'Approve' : 'Reject'}
        isDestructive={confirmDialog.action === 'reject'}
      />
    </div>
  );
}
