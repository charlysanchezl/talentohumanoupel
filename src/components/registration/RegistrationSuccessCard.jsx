import React from 'react';
import { CheckCircle } from 'lucide-react';

export const RegistrationSuccessCard = ({ department, onFinish }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'url("/fondo.png") no-repeat center center fixed', backgroundSize: 'cover' }}>
      <div className="surface animate-fade-in" style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px', width: '90%' }}>
        <CheckCircle size={64} style={{ color: 'var(--success)', margin: '0 auto 1.5rem auto' }} />
        <h2 style={{ marginBottom: '1rem' }}>¡Registro Exitoso!</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Tus datos han sido enviados correctamente a la Subdirección de Docencia del departamento de <strong>{department}</strong>.
          El Jefe de Departamento validará tu información y completará tu Oferta Académica.
        </p>
        <button className="w11-btn" onClick={onFinish}>Finalizar</button>
      </div>
    </div>
  );
};

export default RegistrationSuccessCard;
