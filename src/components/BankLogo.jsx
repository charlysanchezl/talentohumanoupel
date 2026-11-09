import React from 'react';
import { Building2 } from 'lucide-react';
import { cleanAccountNumber, BANCOS_PREFIJOS } from '../services/bankTxtExporter';

/**
 * Componente de Logotipos Oficiales de la Banca Venezolana
 * Diseñado para la Unidad de Talento Humano UPEL IPRGR
 */
export const getBankDetails = (accountOrName = '') => {
  const str = String(accountOrName || '').trim();
  const digits = cleanAccountNumber(str);
  
  let code = '';
  if (digits.length >= 4) {
    code = digits.substring(0, 4);
  }

  const lower = str.toLowerCase();

  // 1. Banco de Venezuela (0102)
  if (code === '0102' || lower.includes('venezuela') || lower.includes('bdv')) {
    return {
      code: '0102',
      name: 'Banco de Venezuela',
      shortName: 'BDV',
      primaryColor: '#b91c1c', // Rojo BDV
      accentColor: '#f59e0b', // Amarillo Oro
      textColor: '#ffffff',
      type: 'bdv'
    };
  }

  // 2. Banco Mercantil (0105)
  if (code === '0105' || lower.includes('mercantil')) {
    return {
      code: '0105',
      name: 'Banco Mercantil',
      shortName: 'Mercantil',
      primaryColor: '#002f6c', // Azul Mercantil
      accentColor: '#f58220', // Naranja
      textColor: '#ffffff',
      type: 'mercantil'
    };
  }

  // 3. Banco Provincial BBVA (0108)
  if (code === '0108' || lower.includes('provincial') || lower.includes('bbva')) {
    return {
      code: '0108',
      name: 'BBVA Provincial',
      shortName: 'Provincial',
      primaryColor: '#004481', // Azul BBVA
      accentColor: '#1464a5',
      textColor: '#ffffff',
      type: 'provincial'
    };
  }

  // 4. Banesco (0134)
  if (code === '0134' || lower.includes('banesco')) {
    return {
      code: '0134',
      name: 'Banesco',
      shortName: 'Banesco',
      primaryColor: '#007a33', // Verde Banesco
      accentColor: '#00a843',
      textColor: '#ffffff',
      type: 'banesco'
    };
  }

  // 5. Banco Digital de los Trabajadores (BDT / Bicentenario - 0175)
  if (code === '0175' || lower.includes('bicentenario') || lower.includes('digital de los trabajadores') || lower.includes('bdt') || (lower.includes('digital') && lower.includes('trabajador'))) {
    return {
      code: '0175',
      name: 'Banco Digital de los Trabajadores',
      shortName: 'BDT',
      primaryColor: '#0056b3', // Azul institucional BDT
      accentColor: '#c8102e', // Rojo acento
      textColor: '#ffffff',
      type: 'bicentenario'
    };
  }

  // 6. Banco Nacional de Crédito - BNC (0191)
  if (code === '0191' || lower.includes('bnc') || lower.includes('nacional de credito') || lower.includes('crédito')) {
    return {
      code: '0191',
      name: 'Banco Nacional de Crédito',
      shortName: 'BNC',
      primaryColor: '#00843d', // Verde BNC
      accentColor: '#002d62', // Azul
      textColor: '#ffffff',
      type: 'bnc'
    };
  }

  // 7. Bancamiga (0172)
  if (code === '0172' || lower.includes('bancamiga')) {
    return {
      code: '0172',
      name: 'Bancamiga',
      shortName: 'Bancamiga',
      primaryColor: '#00a3e0', // Cyan
      accentColor: '#002855',
      textColor: '#ffffff',
      type: 'bancamiga'
    };
  }

  // 8. Banco del Tesoro (0163)
  if (code === '0163' || lower.includes('tesoro')) {
    return {
      code: '0163',
      name: 'Banco del Tesoro',
      shortName: 'Tesoro',
      primaryColor: '#881337', // Vinotinto
      accentColor: '#d97706', // Oro
      textColor: '#ffffff',
      type: 'tesoro'
    };
  }

  // 9. Banco Sofitasa (0137 - Muy popular en Táchira)
  if (code === '0137' || lower.includes('sofitasa')) {
    return {
      code: '0137',
      name: 'Banco Sofitasa',
      shortName: 'Sofitasa',
      primaryColor: '#047857', // Verde
      accentColor: '#0284c7', // Azul
      textColor: '#ffffff',
      type: 'sofitasa'
    };
  }

  // 10. Banco Fondo Común BFC (0151)
  if (code === '0151' || lower.includes('fondo comun') || lower.includes('bfc')) {
    return {
      code: '0151',
      name: 'Banco Fondo Común',
      shortName: 'BFC',
      primaryColor: '#0369a1',
      accentColor: '#ea580c',
      textColor: '#ffffff',
      type: 'bfc'
    };
  }

  // 11. Banco Exterior (0115)
  if (code === '0115' || lower.includes('exterior')) {
    return {
      code: '0115',
      name: 'Banco Exterior',
      shortName: 'Exterior',
      primaryColor: '#1e3a8a',
      accentColor: '#3b82f6',
      textColor: '#ffffff',
      type: 'exterior'
    };
  }

  // 12. 100% Banco (0171)
  if (code === '0171' || lower.includes('100%') || lower.includes('cien por ciento')) {
    return {
      code: '0171',
      name: '100% Banco',
      shortName: '100% Banco',
      primaryColor: '#15803d',
      accentColor: '#22c55e',
      textColor: '#ffffff',
      type: '100banco'
    };
  }

  // 13. Banco Plaza (0138)
  if (code === '0138' || lower.includes('plaza')) {
    return {
      code: '0138',
      name: 'Banco Plaza',
      shortName: 'Banco Plaza',
      primaryColor: '#065f46',
      accentColor: '#10b981',
      textColor: '#ffffff',
      type: 'plaza'
    };
  }

  // Fallback genérico
  const registeredName = BANCOS_PREFIJOS[code] || str || 'Banco';
  return {
    code: code || '----',
    name: registeredName,
    shortName: registeredName.replace('Banco', '').trim() || 'Banco',
    primaryColor: '#475569',
    accentColor: '#64748b',
    textColor: '#ffffff',
    type: 'generic'
  };
};

const BankLogo = ({ 
  accountOrName = '', 
  size = 24, 
  showBadge = false, 
  showName = true,
  style = {} 
}) => {
  const bank = getBankDetails(accountOrName);

  const renderSvgLogo = () => {
    switch (bank.type) {
      case 'bdv':
        // Logotipo Banco de Venezuela: Rectángulo rojo redondeado con las barras de colores amarillo y azul y monograma BDV
        return (
          <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, borderRadius: '6px' }}>
            <rect width="36" height="36" rx="8" fill="#B91C1C" />
            {/* Franjas diagonales icónicas del BDV */}
            <path d="M6 10H30L26 15H6V10Z" fill="#F59E0B" />
            <path d="M6 18H24L20 23H6V18Z" fill="#FFFFFF" />
            <path d="M6 26H18L14 31H6V26Z" fill="#0284C7" />
          </svg>
        );

      case 'mercantil':
        // Logotipo Mercantil: Monograma M con arcos azul y naranja
        return (
          <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, borderRadius: '6px' }}>
            <rect width="36" height="36" rx="8" fill="#002F6C" />
            <path d="M8 26V11L14 20L20 11V26" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 26V11L28 20" stroke="#F58220" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'banesco':
        // Logotipo Banesco: Cuadrado verde con la curva blanca oficial
        return (
          <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, borderRadius: '6px' }}>
            <rect width="36" height="36" rx="8" fill="#007A33" />
            <path d="M8 25C13 15 23 15 28 25" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" />
            <circle cx="18" cy="12" r="3.2" fill="#FFFFFF" />
          </svg>
        );

      case 'provincial':
        // Logotipo BBVA Provincial: Azul marino con monograma blanco
        return (
          <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, borderRadius: '6px' }}>
            <rect width="36" height="36" rx="8" fill="#004481" />
            <text x="18" y="24" fill="#FFFFFF" fontSize="13" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="-0.5">BBVA</text>
          </svg>
        );

      case 'bnc':
        // Logotipo BNC: Verde oscuro y hexágono
        return (
          <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, borderRadius: '6px' }}>
            <rect width="36" height="36" rx="8" fill="#00843D" />
            <text x="18" y="24" fill="#FFFFFF" fontSize="13" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">BNC</text>
          </svg>
        );

      case 'bicentenario':
        // Logotipo Banco Digital de los Trabajadores (BDT / Bicentenario)
        return (
          <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, borderRadius: '6px' }}>
            <rect width="36" height="36" rx="8" fill="#0056B3" />
            <circle cx="18" cy="18" r="11" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="3 2" />
            <text x="18" y="23" fill="#FFFFFF" fontSize="11" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">BDT</text>
          </svg>
        );

      case 'bancamiga':
        // Logotipo Bancamiga: Cyan y Azul
        return (
          <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, borderRadius: '6px' }}>
            <rect width="36" height="36" rx="8" fill="#00A3E0" />
            <path d="M10 26V10H19C22.3 10 25 12.7 25 16C25 18.5 23.5 20.6 21.3 21.5L26 26H20.5L16.5 22H14.5V26H10Z" fill="#FFFFFF" />
          </svg>
        );

      case 'tesoro':
        // Logotipo Banco del Tesoro: Vinotinto y Dorado
        return (
          <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, borderRadius: '6px' }}>
            <rect width="36" height="36" rx="8" fill="#881337" />
            <text x="18" y="25" fill="#F59E0B" fontSize="18" fontWeight="900" fontFamily="serif" textAnchor="middle">T</text>
          </svg>
        );

      case 'sofitasa':
        // Logotipo Sofitasa (Táchira): Verde Esmeralda
        return (
          <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, borderRadius: '6px' }}>
            <rect width="36" height="36" rx="8" fill="#047857" />
            <text x="18" y="24" fill="#FFFFFF" fontSize="14" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">BS</text>
          </svg>
        );

      default:
        // Logotipo Genérico Institucional
        return (
          <div style={{
            width: size,
            height: size,
            borderRadius: '6px',
            backgroundColor: bank.primaryColor,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `${Math.max(size * 0.45, 10)}px`,
            fontWeight: 800,
            flexShrink: 0
          }}>
            {bank.code !== '----' ? bank.code.substring(2) : <Building2 size={size * 0.6} />}
          </div>
        );
    }
  };

  if (!showName && !showBadge) {
    return <span style={{ display: 'inline-flex', verticalAlign: 'middle', ...style }}>{renderSvgLogo()}</span>;
  }

  if (showBadge) {
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '2px 8px 2px 4px',
        borderRadius: '999px',
        backgroundColor: `${bank.primaryColor}14`,
        border: `1px solid ${bank.primaryColor}30`,
        color: bank.primaryColor,
        fontWeight: 700,
        fontSize: '0.78rem',
        whiteSpace: 'nowrap',
        ...style
      }}>
        {renderSvgLogo()}
        <span>{bank.shortName}</span>
        {bank.code !== '----' && (
          <span style={{ fontSize: '0.68rem', opacity: 0.75, fontFamily: 'monospace' }}>[{bank.code}]</span>
        )}
      </span>
    );
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', ...style }}>
      {renderSvgLogo()}
      <div style={{ lineHeight: 1.2 }}>
        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.82rem' }}>
          {bank.name}
        </div>
        {bank.code !== '----' && (
          <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace' }}>
            Prefijo: {bank.code}
          </div>
        )}
      </div>
    </div>
  );
};

export default BankLogo;
