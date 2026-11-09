/**
 * Sistema Institucional de Notificaciones Toast
 * UPEL SIGOA - Reemplazo moderno y elegante para alerts nativos
 */

// Evento customizado para comunicar eventos de notificación en toda la aplicación
const TOAST_EVENT = 'upel_sigoa_toast_event';

/**
 * Dispara una notificación Toast en la interfaz
 * @param {string} message - Mensaje a mostrar
 * @param {'success'|'error'|'warning'|'info'} type - Tipo de notificación
 * @param {number} duration - Duración en milisegundos (por defecto 4000ms)
 */
export function showToast(message, type = 'info', duration = 4000) {
  if (typeof window === 'undefined') return;
  const event = new CustomEvent(TOAST_EVENT, {
    detail: {
      id: Date.now() + Math.random().toString(36).substring(2, 9),
      message,
      type,
      duration
    }
  });
  window.dispatchEvent(event);
}

export const toastSuccess = (msg, duration) => showToast(msg, 'success', duration);
export const toastError = (msg, duration) => showToast(msg, 'error', duration);
export const toastWarning = (msg, duration) => showToast(msg, 'warning', duration);
export const toastInfo = (msg, duration) => showToast(msg, 'info', duration);

// Registrar helper global para compatibilidad
if (typeof window !== 'undefined') {
  window.showUpelToast = showToast;
}

export { TOAST_EVENT };
