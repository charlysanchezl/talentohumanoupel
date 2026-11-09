import React from 'react';
import { CheckCircle } from 'lucide-react';

export const WizardStep4Summary = ({ formData }) => {
  return (
    <section style={{ background: '#ffffff', padding: '2.5rem 2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', textAlign: 'center' }}>
      <CheckCircle size={64} style={{ color: '#008744', margin: '0 auto 1.5rem auto' }} />
      <h3 style={{ color: '#0f172a', marginBottom: '1rem', fontWeight: 800, fontSize: '22px' }}>Resumen de su Ficha</h3>
      <p style={{ fontSize: '1.1rem', color: '#334155', marginBottom: '1rem' }}>
        <strong style={{ color: '#0047bb' }}>{formData.nombres} {formData.apellidos}</strong><br/>
        C.I: <span style={{ fontWeight: 700 }}>{formData.cedula}</span>
      </p>
      <div style={{ padding: '1.5rem', background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '10px', textAlign: 'center', marginBottom: '1.5rem' }}>
        <p style={{ margin: 0, color: '#1e40af', fontWeight: 500, fontSize: '14px', lineHeight: '1.5' }}>
          <em>Nota: Asegúrese de que todos los datos son correctos. La asignación de materias será validada por el Jefe de Departamento. Podrá imprimir su ficha luego de dicha validación.</em>
        </p>
      </div>
    </section>
  );
};

export default WizardStep4Summary;
