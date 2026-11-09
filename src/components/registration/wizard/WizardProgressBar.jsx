import React from 'react';

export const WizardProgressBar = ({ formStep }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', border: '1px solid #e2e8f0', padding: '1.25rem 2rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.06)', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '50%', left: '2.5rem', right: '2.5rem', height: '4px', background: '#e2e8f0', zIndex: 0, transform: 'translateY(-50%)' }}></div>
      <div style={{ position: 'absolute', top: '50%', left: '2.5rem', width: `${((formStep - 1) / 3) * 100}%`, height: '4px', background: '#0047bb', zIndex: 0, transform: 'translateY(-50%)', transition: 'width 0.4s ease' }}></div>
      
      {[1, 2, 3, 4].map(num => (
        <div key={num} style={{ 
          width: '42px', 
          height: '42px', 
          borderRadius: '50%', 
          background: formStep >= num ? '#0047bb' : '#f8fafc', 
          color: formStep >= num ? '#ffffff' : '#64748b', 
          border: `2.5px solid ${formStep >= num ? '#0047bb' : '#cbd5e1'}`, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontWeight: 800, 
          fontSize: '15px',
          zIndex: 1, 
          transition: 'all 0.3s',
          boxShadow: formStep >= num ? '0 2px 8px rgba(0, 71, 187, 0.35)' : 'none'
        }}>
          {num}
        </div>
      ))}
    </div>
  );
};

export default WizardProgressBar;
