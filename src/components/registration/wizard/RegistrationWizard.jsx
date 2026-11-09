import React from 'react';
import WizardProgressBar from './WizardProgressBar';
import WizardStep1Personal from './WizardStep1Personal';
import WizardStep2Bank from './WizardStep2Bank';
import WizardStep3Academic from './WizardStep3Academic';
import WizardStep4Summary from './WizardStep4Summary';

export const RegistrationWizard = ({
  formStep,
  setFormStep,
  formData,
  setFormData,
  handleInputChange,
  handleSubmit,
  registeredStaff,
  setStep,
  setCedulaInput
}) => {
  return (
    <form onSubmit={handleSubmit} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '950px', width: '100%', margin: '0 auto' }}>
      {/* Barra de Progreso del Asistente */}
      <WizardProgressBar formStep={formStep} />

      {/* Pasos del Formulario */}
      {formStep === 1 && (
        <WizardStep1Personal formData={formData} setFormData={setFormData} handleInputChange={handleInputChange} />
      )}

      {formStep === 2 && (
        <WizardStep2Bank formData={formData} handleInputChange={handleInputChange} />
      )}

      {formStep === 3 && (
        <WizardStep3Academic formData={formData} setFormData={setFormData} handleInputChange={handleInputChange} />
      )}

      {formStep === 4 && (
        <WizardStep4Summary formData={formData} />
      )}

      {/* Controles de Navegación del Asistente */}
      <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'space-between', padding: '1.25rem 2rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
        {formStep > 1 ? (
          <button 
            type="button" 
            className="w11-btn-outline" 
            onClick={() => { setFormStep(formStep - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
            style={{ padding: '0.85rem 2rem', fontSize: '1rem', borderRadius: '8px' }}
          >
            Atrás
          </button>
        ) : (
          <button 
            type="button" 
            className="w11-btn-outline" 
            onClick={() => { setStep(1); setCedulaInput(''); }} 
            style={{ padding: '0.85rem 2rem', fontSize: '1rem', borderRadius: '8px' }}
          >
            Cancelar
          </button>
        )}
        
        <button 
          type="submit" 
          className="w11-btn" 
          style={{ padding: '0.85rem 2.5rem', fontSize: '1rem', borderRadius: '8px' }}
        >
          {formStep < 4 ? 'Siguiente Paso' : (registeredStaff ? 'Finalizar y Actualizar' : 'Enviar Registro Final')}
        </button>
      </div>
    </form>
  );
};

export default RegistrationWizard;
