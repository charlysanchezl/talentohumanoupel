import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ToastContainer from './components/ToastContainer';
import MaintenanceLockscreen from './components/MaintenanceLockscreen';
import { getCurrentUser } from './data';
import './index.css';

// Lazy loading para optimización (Code Splitting)
const Dashboard = lazy(() => import('./components/Dashboard'));
const StaffList = lazy(() => import('./components/StaffList'));
const PublicRegistration = lazy(() => import('./components/PublicRegistration'));
const Login = lazy(() => import('./components/Login'));
const UserManagement = lazy(() => import('./components/UserManagement'));
const ConsultarDocentes = lazy(() => import('./components/ConsultarDocentes'));
const ProgramacionAcademica = lazy(() => import('./components/ProgramacionAcademica'));
const AuditLogs = lazy(() => import('./components/AuditLogs'));
const BackupVault = lazy(() => import('./components/BackupVault'));
const MeshP2PControl = lazy(() => import('./components/MeshP2PControl'));

const ProtectedRoute = ({ children, requiredRole }) => {
  const user = getCurrentUser();
  const [maintenanceConfig, setMaintenanceConfig] = useState(() => {
    try {
      const cached = localStorage.getItem('upel_maintenance_mode');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    fetch('/api/backup/maintenance-mode')
      .then(res => {
        if (!res.ok) throw new Error('Status: ' + res.status);
        return res.json();
      })
      .then(data => {
        if (data.success && data.config) {
          setMaintenanceConfig(data.config);
          localStorage.setItem('upel_maintenance_mode', JSON.stringify(data.config));
        }
      })
      .catch(() => {});

    const handleUpdate = (e) => {
      if (e.detail) {
        setMaintenanceConfig(e.detail);
        localStorage.setItem('upel_maintenance_mode', JSON.stringify(e.detail));
      }
    };
    window.addEventListener('upel_maintenance_mode_changed', handleUpdate);
    return () => window.removeEventListener('upel_maintenance_mode_changed', handleUpdate);
  }, []);

  if (!user) return <Navigate to="/login" replace />;

  // BLOQUEO ESTRICTO: Si el modo mantenimiento está activo con bloqueo habilitado y el usuario NO es ADMIN
  if (maintenanceConfig?.enabled && maintenanceConfig?.strictLockout && user.role !== 'ADMIN') {
    return (
      <MaintenanceLockscreen 
        config={maintenanceConfig} 
        onRefresh={async () => {
          try {
            const res = await fetch('/api/backup/maintenance-mode');
            const data = await res.json();
            if (data.success && data.config) {
              setMaintenanceConfig(data.config);
              localStorage.setItem('upel_maintenance_mode', JSON.stringify(data.config));
              if (!data.config.enabled || !data.config.strictLockout) {
                window.location.reload();
              }
            }
          } catch (e) {
            window.location.reload();
          }
        }}
      />
    );
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user.role)) {
      // Si es Jefe y trata de entrar a admin, se redirige a su departamento
      return <Navigate to={`/departamento/${encodeURIComponent(user.department)}`} replace />;
    }
  }
  return children;
};

const PortalDocenteRoute = () => {
  const [maintenanceConfig, setMaintenanceConfig] = useState(() => {
    try {
      const cached = localStorage.getItem('upel_maintenance_mode');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    fetch('/api/backup/maintenance-mode')
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        if (data.success && data.config) {
          setMaintenanceConfig(data.config);
          localStorage.setItem('upel_maintenance_mode', JSON.stringify(data.config));
        }
      })
      .catch(() => {});

    const handleUpdate = (e) => {
      if (e.detail) {
        setMaintenanceConfig(e.detail);
        localStorage.setItem('upel_maintenance_mode', JSON.stringify(e.detail));
      }
    };
    window.addEventListener('upel_maintenance_mode_changed', handleUpdate);
    return () => window.removeEventListener('upel_maintenance_mode_changed', handleUpdate);
  }, []);

  if (maintenanceConfig?.enabled && maintenanceConfig?.strictLockout) {
    return (
      <MaintenanceLockscreen 
        config={maintenanceConfig} 
        onRefresh={async () => {
          try {
            const res = await fetch('/api/backup/maintenance-mode');
            const data = await res.json();
            if (data.success && data.config) {
              setMaintenanceConfig(data.config);
              localStorage.setItem('upel_maintenance_mode', JSON.stringify(data.config));
              if (!data.config.enabled || !data.config.strictLockout) {
                window.location.reload();
              }
            }
          } catch (e) {
            window.location.reload();
          }
        }}
      />
    );
  }

  return <PublicRegistration />;
};

function App() {
  return (
    <>
      <ToastContainer />
      <BrowserRouter>
      <Suspense fallback={
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f8fafc', padding: '1.5rem', gap: '1.5rem', overflow: 'hidden' }}>
          <div className="skeleton-shimmer" style={{ height: '64px', width: '100%', borderRadius: '12px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="skeleton-shimmer" style={{ height: '110px', borderRadius: '12px' }} />
            <div className="skeleton-shimmer" style={{ height: '110px', borderRadius: '12px' }} />
            <div className="skeleton-shimmer" style={{ height: '110px', borderRadius: '12px' }} />
            <div className="skeleton-shimmer" style={{ height: '110px', borderRadius: '12px' }} />
          </div>
          <div className="skeleton-shimmer" style={{ flex: 1, width: '100%', borderRadius: '12px' }} />
        </div>
      }>
        <Routes>
          <Route path="/registro" element={<PortalDocenteRoute />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<ProtectedRoute requiredRole={['ADMIN', 'AUDITOR']}><Dashboard /></ProtectedRoute>} />
            <Route path="consultar" element={<ProtectedRoute requiredRole={['ADMIN', 'AUDITOR', 'JEFE', 'DOCENCIA']}><ConsultarDocentes /></ProtectedRoute>} />
            <Route path="usuarios" element={<ProtectedRoute requiredRole="ADMIN"><UserManagement /></ProtectedRoute>} />
            <Route path="auditoria" element={<ProtectedRoute requiredRole={['ADMIN', 'AUDITOR']}><AuditLogs /></ProtectedRoute>} />
            <Route path="respaldos" element={<ProtectedRoute requiredRole="ADMIN"><BackupVault /></ProtectedRoute>} />
            <Route path="mesh" element={<ProtectedRoute requiredRole={['ADMIN', 'DOCENCIA', 'JEFE', 'AUDITOR']}><MeshP2PControl /></ProtectedRoute>} />
            <Route path="departamento/:deptName" element={<StaffList />} />
            <Route path="docencia" element={<ProtectedRoute requiredRole={['ADMIN', 'DOCENCIA', 'JEFE', 'AUDITOR']}><ProgramacionAcademica /></ProtectedRoute>} />
          </Route>
        </Routes>
      </Suspense>
      </BrowserRouter>
    </>
  );
}

export default App;
