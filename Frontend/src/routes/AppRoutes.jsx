import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import Login from '../features/auth/Login';
import Dashboard from '../features/dashboard/Dashboard';
import Vehicles from '../features/vehicles/Vehicles';
import Drivers from '../features/drivers/Drivers';
import Trips from '../features/trips/Trips';
import Maintenance from '../features/maintenance/Maintenance';
import FuelExpenses from '../features/fuel-expenses/FuelExpenses';
import Reports from '../features/reports/Reports';

const ALL_ROLES = ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'];

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/" element={<Navigate to="/dashboard" replace />} />

    <Route element={<ProtectedRoute roles={ALL_ROLES}><Layout /></ProtectedRoute>}>
      <Route path="/dashboard" element={<Dashboard />} />

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
        <ProtectedRoute roles={ALL_ROLES}>
          <Trips />
        </ProtectedRoute>
      } />

      <Route path="/maintenance" element={
        <ProtectedRoute roles={['FLEET_MANAGER']}>
          <Maintenance />
        </ProtectedRoute>
      } />

      <Route path="/fuel-expenses" element={
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-slate-300">404</h1>
          <p className="text-slate-500 mt-2">Page not found</p>
          <a href="/dashboard" className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg">Go to Dashboard</a>
        </div>
      </div>
    } />
  </Routes>
);

export default AppRoutes;
