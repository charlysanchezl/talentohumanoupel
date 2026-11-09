import React from 'react';
import { BookOpen, Users, Clock } from 'lucide-react';
import StaffPagination from './StaffPagination';

const StaffOfertaTable = ({
  paginatedOferta,
  ofertaConsolidada,
  currentPageOferta,
  totalPagesOferta,
  setCurrentPageOferta,
  itemsPerPage,
  setItemsPerPage
}) => {
  return (
    <div className="animate-fade-in">
      {/* Resumen Superior para Oferta */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--primary-light)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'white', padding: '0.5rem', borderRadius: '50%', color: 'var(--primary)' }}><BookOpen size={24} /></div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TOTAL SECCIONES</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-dark)' }}>{ofertaConsolidada.length}</div>
          </div>
        </div>
        <div style={{ background: '#fce7f3', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'white', padding: '0.5rem', borderRadius: '50%', color: '#ec4899' }}><Users size={24} /></div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CUPOS VS INSCRITOS</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#831843' }}>
              {ofertaConsolidada.reduce((sum, m) => sum + (parseInt(m.inscritos) || 0), 0)} / {ofertaConsolidada.reduce((sum, m) => sum + (parseInt(m.cupos) || 0), 0)}
            </div>
          </div>
        </div>
        <div style={{ background: '#e0f2fe', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'white', padding: '0.5rem', borderRadius: '50%', color: '#0ea5e9' }}><Clock size={24} /></div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TOTAL H. SEMANALES</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#075985' }}>
              {ofertaConsolidada.reduce((sum, m) => sum + (parseInt(m.horasSemanal) || 0), 0)}h
            </div>
          </div>
        </div>
      </div>

      <div className="table-container table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Unidad Curricular</th>
              <th>Especialidad Destino</th>
              <th>Sección</th>
              <th>Cupos</th>
              <th>Inscritos</th>
              <th>Cohorte</th>
              <th>Profesor Asignado</th>
              <th>Centro de Atención</th>
              <th>H. Semanales</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOferta.length > 0 ? (
              paginatedOferta.map((mat, idx) => (
                <tr key={idx}>
                  <td><strong>{mat.nombre}</strong></td>
                  <td>{mat.especialidadDestino || 'N/A'}</td>
                  <td style={{ textAlign: 'center' }}><span className="badge badge-primary">{mat.seccion || '-'}</span></td>
                  <td style={{ textAlign: 'center' }}>{mat.cupos || '-'}</td>
                  <td style={{ textAlign: 'center' }}>{mat.inscritos || '-'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="badge" style={{ background: '#f8fafc', color: '#1e293b', border: '1px solid #cbd5e1', fontWeight: 600 }}>
                      {mat.cohorte || '-'}
                    </span>
                  </td>
                  <td>
                    <div className="user-cell">
                      <div className="user-cell-info">
                        <span className="user-name">{mat.staff.nombres} {mat.staff.apellidos}</span>
                        <span className="user-email">C.I: {mat.staff.cedula}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="badge" style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1' }}>
                      {mat.staff.sedeCentro || 'Rubio'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{mat.horasSemanal}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No hay materias asignadas en este momento.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <StaffPagination 
          currentPage={currentPageOferta}
          totalPages={totalPagesOferta}
          setCurrentPage={setCurrentPageOferta}
          totalCount={ofertaConsolidada.length}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          label="materias"
        />
      </div>
    </div>
  );
};

export default StaffOfertaTable;
