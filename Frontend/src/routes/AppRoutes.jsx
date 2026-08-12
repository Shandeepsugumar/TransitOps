import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import Login from '../features/auth/Login';
import RegisterCompany from '../features/auth/RegisterCompany';
import Dashboard from '../features/dashboard/Dashboard';
import Vehicles from '../features/vehicles/Vehicles';
import Drivers from '../features/drivers/Drivers';
import Trips from '../features/trips/Trips';
import Maintenance from '../features/maintenance/Maintenance';
import FuelExpenses from '../features/fuel-expenses/FuelExpenses';
import Reports from '../features/reports/Reports';
import CompanyApprovals from '../features/admin/CompanyApprovals';
import TeamManagement from '../features/team/TeamManagement';

const REGULAR_ROLES = ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'];
const LAYOUT_ROLES = [...REGULAR_ROLES, 'SUPER_ADMIN'];

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register-company" element={<RegisterCompany />} />
    <Route path="/" element={<Navigate to="/dashboard" replace />} />

    <Route element={<ProtectedRoute roles={LAYOUT_ROLES}><Layout /></ProtectedRoute>}>
      <Route path="/dashboard" element={
        <ProtectedRoute roles={REGULAR_ROLES}>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/companies" element={
        <ProtectedRoute roles={['SUPER_ADMIN']}>
          <CompanyApprovals />
        </ProtectedRoute>
      } />

      <Route path="/team" element={
        <ProtectedRoute roles={['FLEET_MANAGER']}>
          <TeamManagement />
        </ProtectedRoute>
      } />

      <Route path="/vehicles" element={
        <ProtectedRoute roles={['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST']}>
          <Vehicles />
        </ProtectedRoute>
      } />

      <Route path="/drivers" element={
        <ProtectedRoute roles={['FLEET_MANAGER', 'SAFETY_OFFICER']}>
          <Drivers />
        </ProtectedRoute>
      } />

      <Route path="/trips" element={
        <ProtectedRoute roles={REGULAR_ROLES}>
          <Trips />
        </ProtectedRoute>
      } />

      <Route path="/maintenance" element={
        <ProtectedRoute roles={['FLEET_MANAGER']}>
          <Maintenance />
        </ProtectedRoute>
      } />

      <Route path="/expenses" element={
        <ProtectedRoute roles={['FLEET_MANAGER', 'FINANCIAL_ANALYST']}>
          <FuelExpenses />
        </ProtectedRoute>
      } />

      <Route path="/reports" element={
        <ProtectedRoute roles={['FLEET_MANAGER', 'FINANCIAL_ANALYST']}>
          <Reports />
        </ProtectedRoute>
      } />
    </Route>

    <Route path="*" element={
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F8]">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-[#1C1C1E]">404</h1>
          <p className="text-[#6B6B70] mt-2">Page not found</p>
          <a href="/dashboard" className="inline-block mt-4 px-4 py-2 bg-[#D97706] text-white rounded-lg hover:bg-amber-700 shadow-sm transition-colors">Go to Dashboard</a>
        </div>
      </div>
    } />
  </Routes>
);

export default AppRoutes;
