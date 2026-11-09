import React from 'react';
import GeminiDocumentScanner from '../../common/GeminiDocumentScanner';

export const WizardStep3Academic = ({ formData, setFormData, handleInputChange }) => {
  const handleScanAcademic = (data) => {
    if (!setFormData || !data) return;
    setFormData(prev => {
      const updates = { ...prev };
      const titulo = data.tituloObtenido || '';
      const nivel = data.nivelAcademico || '';

      if (nivel === 'Doctorado' || titulo.toLowerCase().includes('doctor')) {
        updates.doctorado = titulo;
      } else if (nivel === 'Maestría' || nivel === 'Especialización' || titulo.toLowerCase().includes('magister') || titulo.toLowerCase().includes('master') || titulo.toLowerCase().includes('especialista')) {
        updates.titulosPostgrado = titulo;
      } else {
        updates.titulosPregrado = titulo || updates.titulosPregrado;
      }

      return updates;
    });
  };

  return (
    <>
      <div style={{ background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', padding: '0.9rem', borderRadius: '10px', textAlign: 'center', fontWeight: 700, fontSize: '15px' }}>
        Paso 3: Perfil Profesional y Títulos Obtenidos
      </div>
      <section style={{ background: '#ffffff', padding: '2rem 2.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 6px 20px rgba(0,0,0,0.06)' }}>
        <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h3 style={{ margin: 0, color: '#0047bb', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 800, fontSize: '18px' }}>
            🎓 PERFIL ACADÉMICO Y DEDICACIÓN
          </h3>
          <GeminiDocumentScanner 
            onApply={handleScanAcademic}
            documentHint="titulo"
            buttonLabel="Escanear Título / Diploma con IA"
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Títulos de Pregrado</label>
            <input required type="text" name="titulosPregrado" value={formData.titulosPregrado} onChange={handleInputChange} className="w11-input w-full" placeholder="Ej. Lcdo. en Educación Mención Matemáticas" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Títulos de Postgrado</label>
            <input type="text" name="titulosPostgrado" value={formData.titulosPostgrado || ''} onChange={handleInputChange} className="w11-input w-full" placeholder="Si no posee, deje en blanco" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Doctorado</label>
            <input type="text" name="doctorado" value={formData.doctorado || ''} onChange={handleInputChange} className="w11-input w-full" placeholder="Si no posee, deje en blanco" />
          </div>
          <div>
            <label className="form-label">Categoría Docente</label>
            <input required type="text" name="categoriaDocente" value={formData.categoriaDocente} onChange={handleInputChange} className="w11-input w-full" placeholder="Ej. INSTRUCTOR" />
          </div>
          <div>
            <label className="form-label">Dedicación</label>
            <input required type="text" name="dedicacion" value={formData.dedicacion} onChange={handleInputChange} className="w11-input w-full" placeholder="Ej. TIEMPO CONVENCIONAL" />
          </div>
        </div>
      </section>
    </>
  );
};

export default WizardStep3Academic;
