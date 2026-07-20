import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { getStaffData } from '../data';

const Dashboard = () => {
  const [staffList, setStaffList] = useState([]);

  useEffect(() => {
    const fetchStaff = async () => {
      const data = await getStaffData();
      setStaffList(data);
    };
    fetchStaff();
  }, []);

  const totalStaff = staffList.length;
  const activeStaff = staffList.filter(s => s.status === 'Activo').length;
  const warningStaff = staffList.filter(s => s.status === 'Por Vencer').length;
  const inactiveStaff = staffList.filter(s => s.status === 'Inactivo').length;

  const handleMigrate = async () => {
    if (!window.confirm('¿Está seguro de migrar los datos locales a la base de datos MySQL? Esto sobreescribirá los datos existentes en la base de datos para estos docentes.')) return;
    
    try {
      const localData = JSON.parse(localStorage.getItem('upel_staff_v5') || '[]');
      if (localData.length === 0) {
        alert('No hay datos locales para migrar.');
        return;
      }
      
      const response = await fetch('http://localhost:3001/api/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docentes: localData })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`¡Migración exitosa! Se han migrado ${data.count} docentes a la base de datos.`);
      } else {
        alert('Error en la migración: ' + data.error);
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión con el servidor Node.js.');
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Panel de Control</h1>
          <p className="subtitle">Resumen general del personal académico contratado</p>
        </div>
        <button onClick={handleMigrate} className="btn btn-primary" style={{ background: 'var(--warning)', borderColor: 'var(--warning)', color: 'black' }}>
          <AlertTriangle size={18} /> Migrar Datos Locales a MySQL
        </button>
      </div>

      <div className="stats-grid">
        <div className="surface stat-card">
          <div className="stat-info">
            <h3>Total Contratados</h3>
            <div className="stat-value">{totalStaff}</div>
          </div>
          <div className="stat-icon blue">
            <Users size={24} />
          </div>
        </div>

        <div className="surface stat-card">
          <div className="stat-info">
            <h3>Contratos Activos</h3>
            <div className="stat-value">{activeStaff}</div>
          </div>
          <div className="stat-icon green">
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="surface stat-card">
          <div className="stat-info">
            <h3>Por Vencer</h3>
            <div className="stat-value">{warningStaff}</div>
          </div>
          <div className="stat-icon orange">
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="surface stat-card">
          <div className="stat-info">
            <h3>Inactivos</h3>
            <div className="stat-value">{inactiveStaff}</div>
          </div>
          <div className="stat-icon red">
            <Clock size={24} />
          </div>
        </div>
      </div>

      <div className="surface" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Contratos Próximos a Vencer</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Docente</th>
                <th>Departamento</th>
                <th>Fecha Fin</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {staffList
                .filter(s => s.status === 'Por Vencer' || s.fechaHasta < '2026-12-31')
                .sort((a, b) => new Date(a.fechaHasta) - new Date(b.fechaHasta))
                .slice(0, 5)
                .map(staff => (
                  <tr key={staff.id}>
                    <td>
                      <div className="user-name">{staff.apellidos}, {staff.nombres}</div>
                      <div className="user-email">C.I: {staff.cedula}</div>
                    </td>
                    <td>{staff.department}</td>
                    <td>{staff.fechaHasta}</td>
                    <td>
                      <span className={`badge ${staff.status === 'Por Vencer' ? 'badge-warning' : staff.status === 'Inactivo' ? 'badge-danger' : 'badge-success'}`}>
                        {staff.status}
                      </span>
                    </td>
                  </tr>
                ))}
              {staffList.filter(s => s.status === 'Por Vencer' || s.fechaHasta < '2026-12-31').length === 0 && (
                 <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No hay contratos próximos a vencer</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
