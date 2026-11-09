import React from 'react';

export const WizardStep2Bank = ({ formData, handleInputChange }) => {
  return (
    <>
      <div style={{ background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', padding: '0.9rem', borderRadius: '10px', textAlign: 'center', fontWeight: 700, fontSize: '15px' }}>
        Paso 2: Información Bancaria y Pago de Nómina
      </div>
      <section style={{ background: '#ffffff', padding: '2rem 2.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 6px 20px rgba(0,0,0,0.06)' }}>
        <h3 style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '1.75rem', color: '#0047bb', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 800, fontSize: '18px' }}>
          💳 INFORMACIÓN BANCARIA
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', background: '#f8fafc', padding: '1.75rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div>
            <label className="form-label">Banco</label>
            <select name="banco" value={formData.banco} onChange={handleInputChange} className="w11-select w-full" required>
              <option value="">Seleccione un banco...</option>
              <option value="Banco de Venezuela">Banco de Venezuela</option>
              <option value="Banesco">Banesco</option>
              <option value="Banco Mercantil">Banco Mercantil</option>
              <option value="BBVA Provincial">BBVA Provincial</option>
              <option value="Banco Nacional de Crédito (BNC)">Banco Nacional de Crédito (BNC)</option>
              <option value="Bancaribe">Bancaribe</option>
              <option value="Banco Exterior">Banco Exterior</option>
              <option value="Banco del Tesoro">Banco del Tesoro</option>
              <option value="Bancamiga">Bancamiga</option>
              <option value="Banplus">Banplus</option>
              <option value="Banco Plaza">Banco Plaza</option>
              <option value="100% Banco">100% Banco</option>
              <option value="Banco Fondo Común (BFC)">Banco Fondo Común (BFC)</option>
              <option value="Banco Activo">Banco Activo</option>
              <option value="Banco Caroní">Banco Caroní</option>
              <option value="Banco Sofitasa">Banco Sofitasa</option>
              <option value="Banco Digital de los Trabajadores">Banco Digital de los Trabajadores</option>
            </select>
          </div>
          <div>
            <label className="form-label">Tipo Cuenta</label>
            <select name="tipoCuenta" value={formData.tipoCuenta} onChange={handleInputChange} className="w11-select w-full">
              <option value="Ahorro">Ahorro</option>
              <option value="Corriente">Corriente</option>
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Nro. de Cuenta Bancaria (20 dígitos)</label>
            <input required type="text" name="cuentaBancaria" value={formData.cuentaBancaria} onChange={handleInputChange} className="w11-input w-full" maxLength="20" placeholder="Ej. 01020000000000000000" style={{ letterSpacing: '2px', fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 600 }} />
          </div>
        </div>
      </section>
    </>
  );
};

export default WizardStep2Bank;
