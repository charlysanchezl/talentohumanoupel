import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import StaffList from './components/StaffList';
import PublicRegistration from './components/PublicRegistration';
import Login from './components/Login';
import UserManagement from './components/UserManagement';
import ConsultarDocentes from './components/ConsultarDocentes';
import { getCurrentUser } from './data';
import './index.css';

const ProtectedRoute = ({ children, requiredRole }) => {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user.role)) {
      // Si es Jefe y trata de entrar a admin, se redirige a su departamento
      return <Navigate to={`/departamento/${encodeURIComponent(user.department)}`} replace />;
    }
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/registro" element={<PublicRegistration />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<ProtectedRoute requiredRole={['ADMIN', 'AUDITOR']}><Dashboard /></ProtectedRoute>} />
          <Route path="consultar" element={<ProtectedRoute requiredRole={['ADMIN', 'AUDITOR', 'JEFE']}><ConsultarDocentes /></ProtectedRoute>} />
          <Route path="usuarios" element={<ProtectedRoute requiredRole="ADMIN"><UserManagement /></ProtectedRoute>} />
          <Route path="departamento/:deptName" element={<StaffList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
