import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const ProtectedRoute = ({ roles, children }) => {
  const { isAuthenticated, role } = useAuthStore();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(role)) {
    const fallbackRoute = role === 'SUPER_ADMIN' ? '/admin/companies' : '/dashboard';
    const fallbackText = role === 'SUPER_ADMIN' ? 'Go to Company Approvals' : 'Go back to Dashboard';

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F8]">
        <div className="max-w-md w-full p-8 bg-white rounded-lg border border-[#E5E5E7] shadow-sm text-center space-y-6">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-600">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-[#1C1C1E]">Not Authorized</h2>
          <p className="text-[#6B6B70]">
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </p>
          <button
            onClick={() => navigate(fallbackRoute)}
            className="w-full py-2.5 px-4 bg-[#D97706] hover:bg-amber-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            {fallbackText}
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
