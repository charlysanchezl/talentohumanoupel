import React from 'react';

const StaffPagination = ({
  currentPage,
  totalPages,
  setCurrentPage,
  totalCount,
  itemsPerPage,
  setItemsPerPage,
  label
}) => {
  const size = itemsPerPage === 'Todos' ? totalCount : (parseInt(itemsPerPage) || 25);
  const startIdx = totalCount === 0 ? 0 : (currentPage - 1) * size + 1;
  const endIdx = itemsPerPage === 'Todos' ? totalCount : Math.min(totalCount, currentPage * size);

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'white', borderTop: '1px solid #e2e8f0', borderBottomLeftRadius: 'var(--radius-lg)', borderBottomRightRadius: 'var(--radius-lg)', flexWrap: 'wrap', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Mostrando <strong>{totalCount === 0 ? 0 : `${startIdx} - ${endIdx}`}</strong> de <strong>{totalCount}</strong> {label}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>
          <span>Mostrar:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(e.target.value === 'Todos' ? 'Todos' : parseInt(e.target.value))}
            className="filter-select"
            style={{ padding: '0.2rem 0.5rem', fontSize: '0.82rem', borderRadius: '6px', cursor: 'pointer' }}
          >
            <option value={15}>15 por pág.</option>
            <option value={25}>25 por pág.</option>
            <option value={50}>50 por pág.</option>
            <option value={100}>100 por pág.</option>
            <option value="Todos">Todos ({totalCount})</option>
          </select>
        </div>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
          <button className="btn btn-outline" disabled={currentPage === 1} onClick={() => setCurrentPage(1)} style={{ padding: '0.35rem 0.65rem', fontSize: '0.82rem', cursor: 'pointer' }}>«</button>
          <button className="btn btn-outline" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} style={{ padding: '0.35rem 0.65rem', fontSize: '0.82rem', cursor: 'pointer' }}>‹ Anterior</button>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0 0.5rem', color: '#003366' }}>Pág. {currentPage} / {totalPages}</span>
          <button className="btn btn-outline" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} style={{ padding: '0.35rem 0.65rem', fontSize: '0.82rem', cursor: 'pointer' }}>Siguiente ›</button>
          <button className="btn btn-outline" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(totalPages)} style={{ padding: '0.35rem 0.65rem', fontSize: '0.82rem', cursor: 'pointer' }}>»</button>
        </div>
      )}
    </div>
  );
};

export default StaffPagination;
