import React from 'react';
import { createPortal } from 'react-dom';
import { Eye, Printer, Mail, MessageCircle, History, Edit, Trash2 } from 'lucide-react';

const StaffActionMenuPortal = ({
  activeActionMenu,
  setActiveActionMenu,
  setStaffToView,
  setStaffToPrint,
  setStaffToEdit,
  setStaffToSendFicha,
  setStaffToNotify,
  setStaffHistoryToView,
  handleDelete,
  user,
  isExpedienteCompleto,
  getMissingExpedienteFields
}) => {
  if (!activeActionMenu || typeof document === 'undefined') return null;

  const targetStaff = activeActionMenu.staff;
  if (!targetStaff) return null;

  const hasMaterias = targetStaff.materias && targetStaff.materias.length > 0;
  const isValidated = targetStaff.status === 'Validado' || targetStaff.status === 'Activo';
  const expedienteCompleto = isExpedienteCompleto ? isExpedienteCompleto(targetStaff) : true;

  return createPortal(
    <div 
      className="row-actions-menu row-actions-portal-menu"
      style={{
        position: 'fixed',
        top: activeActionMenu.openUpwards ? 'auto' : `${activeActionMenu.top}px`,
        bottom: activeActionMenu.openUpwards ? `${activeActionMenu.bottom}px` : 'auto',
        right: `${activeActionMenu.right}px`,
        zIndex: 9999999,
        background: '#ffffff',
        borderRadius: '10px',
        boxShadow: '0 12px 32px rgba(0,0,0,0.22), 0 2px 10px rgba(0,0,0,0.1)',
        border: '1px solid #cbd5e1',
        padding: '0.45rem',
        minWidth: '220px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.2rem',
        animation: 'fadeInDropdown 0.15s ease-out'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Grupo 1: Ficha y Documentos */}
      {(isValidated || hasMaterias) && (
        <>
          <div className="row-actions-header">
            Ficha y Notificaciones
          </div>
          <button
            type="button"
            onClick={() => { setActiveActionMenu(null); setStaffToView(targetStaff); }}
            className="row-actions-item"
          >
            <Eye size={14} color="#002f6c" />
            <span>Ver Ficha Completa</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveActionMenu(null);
              if (!expedienteCompleto) {
                const faltantes = getMissingExpedienteFields ? getMissingExpedienteFields(targetStaff) : [];
                alert(`Expediente Incompleto: El docente ${targetStaff.nombres} ${targetStaff.apellidos} no ha completado sus datos obligatorios (${faltantes.join(', ')}). No se puede emitir la ficha.`);
                setStaffToEdit(targetStaff);
                return;
              }
              setStaffToPrint(targetStaff);
            }}
            className="row-actions-item"
          >
            <Printer size={14} color="#059669" />
            <span>Imprimir Ficha PDF</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveActionMenu(null);
              if (!expedienteCompleto) {
                const faltantes = getMissingExpedienteFields ? getMissingExpedienteFields(targetStaff) : [];
                alert(`Expediente Incompleto: El docente ${targetStaff.nombres} ${targetStaff.apellidos} no ha completado sus datos obligatorios (${faltantes.join(', ')}). Debe actualizar el expediente antes de enviar.`);
                setStaffToEdit(targetStaff);
                return;
              }
              setStaffToSendFicha(targetStaff);
            }}
            className="row-actions-item"
          >
            <Mail size={14} color="#2563eb" />
            <span>Enviar por Correo</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveActionMenu(null); setStaffToNotify(targetStaff); }}
            className="row-actions-item"
          >
            <MessageCircle size={14} color="#16a34a" />
            <span>Notificar WhatsApp</span>
          </button>
          <div style={{ height: '1px', background: '#e2e8f0', margin: '0.2rem 0' }} />
        </>
      )}

      {/* Grupo 2: Gestión y Kardex */}
      <div className="row-actions-header">
        Gestión del Docente
      </div>
      <button
        type="button"
        onClick={() => { setActiveActionMenu(null); setStaffHistoryToView(targetStaff); }}
        className="row-actions-item"
      >
        <History size={14} color="#2563eb" />
        <span>Ver Historial / Kardex</span>
      </button>
      {(user?.role === 'JEFE' || user?.role === 'ADMIN') && (
        <>
          <button
            type="button"
            onClick={() => { setActiveActionMenu(null); setStaffToEdit(targetStaff); }}
            className="row-actions-item"
          >
            <Edit size={14} color="#002f6c" />
            <span>Editar Datos Básicos</span>
          </button>
          <div style={{ height: '1px', background: '#fee2e2', margin: '0.2rem 0' }} />
          <button
            type="button"
            onClick={() => { setActiveActionMenu(null); handleDelete(targetStaff); }}
            className="row-actions-item danger"
            style={{ color: '#dc2626', fontWeight: 600 }}
          >
            <Trash2 size={14} color="#dc2626" />
            <span>Eliminar Docente</span>
          </button>
        </>
      )}
    </div>,
    document.body
  );
};

export default StaffActionMenuPortal;
