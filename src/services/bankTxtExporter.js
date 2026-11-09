/**
 * Servicio Especializado de Exportación de Archivos TXT Bancarios para UPEL SIGOA
 * Exclusivo para la Unidad de Talento Humano / Subdirección de Docencia.
 * 
 * Cumple con los estándares bancarios venezolanos:
 * 1. Banco de Venezuela (BDV - Código 0102): Formato Oficial Posicional y Delimitado para BDVenlínea Empresas.
 * 2. Formato Interbancario / Multibanco para acreditación de nómina.
 * 3. Auditoría de coherencia bancaria (20 dígitos exactos, concordancia de prefijo bancario).
 */

// Limpieza de caracteres para validadores bancarios (elimina tildes, eñes, diéresis y caracteres especiales)
export const sanitizeForBank = (text = '') => {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remueve acentos
    .replace(/[ñÑ]/g, 'N')
    .replace(/[^a-zA-Z0-9\s.,-]/g, '')
    .trim()
    .toUpperCase();
};

// Extraer nacionalidad (V/E) y número numérico de cédula
export const parseCedula = (cedulaRaw = '') => {
  const str = String(cedulaRaw || '').trim().toUpperCase();
  let nacionalidad = 'V';
  if (str.startsWith('E') || str.startsWith('EXT')) {
    nacionalidad = 'E';
  } else if (str.startsWith('J')) {
    nacionalidad = 'J';
  } else if (str.startsWith('G')) {
    nacionalidad = 'G';
  }
  const cleanDigits = str.replace(/\D/g, '');
  return {
    nacionalidad,
    numero: cleanDigits,
    formateada: `${nacionalidad}-${cleanDigits}`
  };
};

// Normalizar cuenta bancaria a 20 dígitos numéricos exactos
export const cleanAccountNumber = (cuenta = '') => {
  return String(cuenta || '').replace(/\D/g, '').slice(0, 20);
};

// Asegurar que la cuenta tenga exactamente 20 dígitos completando a la derecha si fue truncada a 16
export const padAccount20 = (cuenta = '') => {
  const clean = cleanAccountNumber(cuenta);
  if (!clean) return '';
  if (clean.length >= 16 && clean.length < 20) {
    return clean.padEnd(20, '0');
  }
  return clean.padStart(20, '0').slice(-20);
};

// Enmascaramiento de seguridad para cuentas bancarias según el rol institucional (Opción 5)
export const formatAccountWithRoleMask = (cuenta = '', userRole = '') => {
  const clean = cleanAccountNumber(cuenta);
  if (!clean || clean.length < 10) return 'Sin Cuenta Registrada';
  const role = String(userRole || '').toUpperCase();
  // Roles de Talento Humano y Auditoría autorizados a ver los 20 dígitos completos
  if (role === 'ADMIN' || role === 'DOCENCIA' || role === 'AUDITOR') {
    return clean.length === 20 
      ? `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${clean.slice(8, 10)} ${clean.slice(10, 20)}`
      : clean;
  }
  // Para Jefes de Departamento y usuarios de consulta: enmascaramiento de seguridad
  return `${clean.slice(0, 4)} •••• •••• •••• ${clean.slice(-4)}`;
};

// Prefijos bancarios oficiales SUDEBAN en Venezuela
export const BANCOS_PREFIJOS = {
  '0102': 'Banco de Venezuela',
  '0105': 'Banco Mercantil',
  '0108': 'Banco Provincial (BBVA)',
  '0134': 'Banesco',
  '0175': 'Banco Digital de los Trabajadores',
  '0191': 'Banco Nacional de Crédito (BNC)',
  '0163': 'Banco del Tesoro',
  '0115': 'Banco Exterior',
  '0172': 'Bancamiga',
  '0166': 'Banco Agrícola de Venezuela',
  '0151': 'Banco Fondo Común (BFC)',
  '0169': 'Mi Banco',
  '0171': '100% Banco',
  '0138': 'Banco Plaza',
  '0177': 'Banco de la Fuerza Armada (BANFANB)',
  '0137': 'Banco Sofitasa',
  '0104': 'Banco Venezolano de Crédito',
  '0168': 'Bancrecer',
  '0128': 'Banco Caroní',
  '0174': 'Banplus',
  '0157': 'DELSUR Banco Universal'
};

// Obtener nombre del banco a partir de los 4 primeros dígitos de la cuenta
export const getBankNameFromAccount = (cuenta = '') => {
  const digits = cleanAccountNumber(cuenta);
  if (digits.length >= 4) {
    const code = digits.substring(0, 4);
    return BANCOS_PREFIJOS[code] || `Banco Código ${code}`;
  }
  return 'Cuenta Inválida';
};

// Auditar cuentas bancarias de la lista de docentes
export const auditBankAccounts = (staffList = []) => {
  let totalDocentes = staffList.length;
  let cuentasValidas = 0;
  let cuentasBdv = 0;
  let otrosBancos = 0;
  let sinCuenta = 0;
  let cuentasIncompletas = 0;
  let inconsistenciasPrefijo = 0;

  const docentesConError = [];
  const distribucionBancos = {};

  staffList.forEach(staff => {
    const cuenta = cleanAccountNumber(staff.cuentaBancaria);
    const bancoDeclarado = staff.banco || '';
    const { formateada: cedulaFormat } = parseCedula(staff.cedula);
    const nombreCompleto = `${staff.apellidos || ''} ${staff.nombres || ''}`.trim() || 'Sin Nombre';

    if (!cuenta) {
      sinCuenta++;
      docentesConError.push({
        cedula: cedulaFormat,
        nombre: nombreCompleto,
        banco: bancoDeclarado || 'No registrado',
        cuenta: 'NO REGISTRADA',
        motivo: 'Sin cuenta bancaria registrada',
        tipo: 'CRITICO'
      });
      return;
    }

    if (cuenta.length < 16) {
      cuentasIncompletas++;
      docentesConError.push({
        cedula: cedulaFormat,
        nombre: nombreCompleto,
        banco: bancoDeclarado || 'No registrado',
        cuenta: cuenta,
        motivo: `Longitud inválida (${cuenta.length} de 20 dígitos)`,
        tipo: 'ERROR'
      });
      return;
    }

    // Cuenta tiene formato válido (entre 16 y 20 dígitos)
    cuentasValidas++;
    const prefijo = cuenta.substring(0, 4);
    const bancoReal = BANCOS_PREFIJOS[prefijo] || `Otro (${prefijo})`;
    
    distribucionBancos[bancoReal] = (distribucionBancos[bancoReal] || 0) + 1;

    if (prefijo === '0102') {
      cuentasBdv++;
    } else {
      otrosBancos++;
    }

    // Verificar si el banco declarado no coincide con los primeros 4 dígitos
    const bDeclNorm = bancoDeclarado.toLowerCase();
    const bRealNorm = bancoReal.toLowerCase();
    const isBdtSynonym = 
      (bDeclNorm.includes('digital') || bDeclNorm.includes('bicentenario') || bDeclNorm.includes('bdt') || bDeclNorm.includes('trabajador')) &&
      (bRealNorm.includes('digital') || bRealNorm.includes('bicentenario') || bRealNorm.includes('bdt') || bRealNorm.includes('trabajador') || prefijo === '0175');

    if (!isBdtSynonym && bancoDeclarado && !bDeclNorm.includes(bRealNorm) && !bRealNorm.includes(bDeclNorm)) {
      if (bDeclNorm.includes('venezuela') && prefijo !== '0102') {
        inconsistenciasPrefijo++;
        docentesConError.push({
          cedula: cedulaFormat,
          nombre: nombreCompleto,
          banco: `${bancoDeclarado} ⚠️ (Cuenta es ${bancoReal})`,
          cuenta: cuenta,
          motivo: `Discordancia: Seleccionó ${bancoDeclarado} pero la cuenta inicia con ${prefijo} (${bancoReal})`,
          tipo: 'ADVERTENCIA'
        });
      }
    }
  });

  return {
    totalDocentes,
    cuentasValidas,
    cuentasBdv,
    otrosBancos,
    sinCuenta,
    cuentasIncompletas,
    inconsistenciasPrefijo,
    totalConProblemas: docentesConError.length,
    docentesConError,
    distribucionBancos
  };
};

/**
 * Formatea una línea individual de texto para un docente específico según el formato elegido
 * Exclusivamente con los datos esenciales: Cédula, Nombre, Cuenta (20 dígitos) y Tipo de Cuenta
 */
export const formatTeacherTxtLine = (staff, format = 'bdv-pos', delimiter = '\t') => {
  const { nacionalidad, numero } = parseCedula(staff.cedula);
  const rawCuenta = cleanAccountNumber(staff.cuentaBancaria);
  const cuenta = padAccount20(rawCuenta);
  const tipoCtaTexto = (staff.tipoCuenta || '').toLowerCase().includes('corriente') ? 'CORRIENTE' : 'AHORRO';
  const cedulaReal = staff.cedula ? String(staff.cedula).trim() : `${nacionalidad}-${numero}`;
  const nombre = sanitizeForBank(`${staff.apellidos || ''} ${staff.nombres || ''}`);

  if (format === 'bdv-pos') {
    const ciPadded = cedulaReal.padEnd(12, ' ').slice(0, 12);
    const nombrePadded = nombre.padEnd(40, ' ').slice(0, 40);
    const cuentaPadded = cuenta.padStart(20, '0').slice(-20);
    const tipoPadded = tipoCtaTexto.padEnd(10, ' ').slice(0, 10);
    return `${ciPadded} ${nombrePadded} ${cuentaPadded} ${tipoPadded}`;
  }

  // Por defecto (delimitado por tabulador): Cédula, Nombre, Cuenta (20 dígitos), Tipo de Cuenta
  return [cedulaReal, nombre, cuenta, tipoCtaTexto].join(delimiter);
};

/**
 * 1. Generador Oficial Banco de Venezuela (BDV) - Formato Posicional de Longitud Fija
 * Estructura estándar bancaria para nómina y acreditación en cuenta BDV
 * - Tipo Doc (1 car: V/E)
 * - Cédula (9 car: numérico con ceros a la izquierda)
 * - Nombre (40 car: texto alfanumérico en mayúsculas sin caracteres especiales)
 * - Cuenta (20 car: numérico)
 * - Tipo Cuenta (2 car: 01=Corriente, 02=Ahorro)
 * - Código Banco (4 car: 0102)
 */
export const generateBdvPositionalTxt = (staffList = [], options = {}) => {
  const { 
    soloBdv = true, 
    soloActivosConCarga = false, 
    periodo = 'ACTUAL' 
  } = options;

  let filtered = staffList.filter(s => {
    const cuenta = cleanAccountNumber(s.cuentaBancaria);
    if (cuenta.length < 16) return false;
    if (soloBdv && !cuenta.startsWith('0102')) return false;
    if (soloActivosConCarga) {
      const horas = (s.materias || []).reduce((acc, m) => acc + (parseInt(m.horasSemanal) || 0), 0);
      if (horas <= 0) return false;
    }
    return true;
  });

  filtered.sort((a, b) => {
    if (options.sortBy === 'cedula') {
      const ciA = parseInt(String(a.cedula || '').replace(/\D/g, '')) || 0;
      const ciB = parseInt(String(b.cedula || '').replace(/\D/g, '')) || 0;
      if (ciA !== ciB) return ciA - ciB;
      const nameA = `${a.apellidos || ''} ${a.nombres || ''}`.trim();
      const nameB = `${b.apellidos || ''} ${b.nombres || ''}`.trim();
      return nameA.localeCompare(nameB, 'es', { sensitivity: 'base' });
    }
    // Por defecto: Opción 3 Alfabético (A-Z) y luego por Cédula Numérica
    const nameA = `${a.apellidos || ''} ${a.nombres || ''}`.trim();
    const nameB = `${b.apellidos || ''} ${b.nombres || ''}`.trim();
    const cmp = nameA.localeCompare(nameB, 'es', { sensitivity: 'base' });
    if (cmp !== 0) return cmp;
    const ciA = parseInt(String(a.cedula || '').replace(/\D/g, '')) || 0;
    const ciB = parseInt(String(b.cedula || '').replace(/\D/g, '')) || 0;
    return ciA - ciB;
  });

  const lines = [];

  filtered.forEach(s => {
    const cedulaReal = s.cedula ? String(s.cedula).trim() : 'V-0';
    const apellidosNombres = sanitizeForBank(`${s.apellidos || ''} ${s.nombres || ''}`);
    const nombrePadded = apellidosNombres.padEnd(40, ' ').slice(0, 40);
    const cuenta = padAccount20(s.cuentaBancaria);
    const tipoCta = (s.tipoCuenta || '').toLowerCase().includes('corriente') ? 'CORRIENTE' : 'AHORRO';
    const ciPadded = cedulaReal.padEnd(12, ' ').slice(0, 12);
    const tipoPadded = tipoCta.padEnd(10, ' ').slice(0, 10);

    // Registro posicional con cédula real del sistema, nombre, cuenta de 20 dígitos y tipo de cuenta
    const line = `${ciPadded} ${nombrePadded} ${cuenta} ${tipoPadded}`;
    lines.push(line);
  });

  return {
    content: lines.join('\r\n'),
    totalRecords: lines.length,
    filename: `UPEL_BDV_NOMINA_POSICIONAL_${sanitizeForBank(periodo).replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.txt`
  };
};

/**
 * 2. Generador Oficial Banco de Venezuela (BDV) - Formato Delimitado (Tabulador por defecto)
 * Datos esenciales: Cédula real, Nombre del docente, Cuenta (20 dígitos), Tipo de Cuenta
 */
export const generateBdvDelimitedTxt = (staffList = [], options = {}) => {
  const { 
    delimiter = '\t', // Tabulador
    soloBdv = true, 
    soloActivosConCarga = false, 
    periodo = 'ACTUAL' 
  } = options;

  let filtered = staffList.filter(s => {
    const cuenta = cleanAccountNumber(s.cuentaBancaria);
    if (cuenta.length < 16) return false;
    if (soloBdv && !cuenta.startsWith('0102')) return false;
    if (soloActivosConCarga) {
      const horas = (s.materias || []).reduce((acc, m) => acc + (parseInt(m.horasSemanal) || 0), 0);
      if (horas <= 0) return false;
    }
    return true;
  });

  filtered.sort((a, b) => {
    if (options.sortBy === 'cedula') {
      const ciA = parseInt(String(a.cedula || '').replace(/\D/g, '')) || 0;
      const ciB = parseInt(String(b.cedula || '').replace(/\D/g, '')) || 0;
      if (ciA !== ciB) return ciA - ciB;
      const nameA = `${a.apellidos || ''} ${a.nombres || ''}`.trim();
      const nameB = `${b.apellidos || ''} ${b.nombres || ''}`.trim();
      return nameA.localeCompare(nameB, 'es', { sensitivity: 'base' });
    }
    // Por defecto: Opción 3 Alfabético (A-Z) y luego por Cédula Numérica
    const nameA = `${a.apellidos || ''} ${a.nombres || ''}`.trim();
    const nameB = `${b.apellidos || ''} ${b.nombres || ''}`.trim();
    const cmp = nameA.localeCompare(nameB, 'es', { sensitivity: 'base' });
    if (cmp !== 0) return cmp;
    const ciA = parseInt(String(a.cedula || '').replace(/\D/g, '')) || 0;
    const ciB = parseInt(String(b.cedula || '').replace(/\D/g, '')) || 0;
    return ciA - ciB;
  });

  const lines = [];

  // Registros delimitados exclusivamente con datos esenciales
  filtered.forEach(s => {
    const cedulaReal = s.cedula ? String(s.cedula).trim() : 'V-0';
    const nombre = sanitizeForBank(`${s.apellidos || ''} ${s.nombres || ''}`);
    const cuenta = padAccount20(s.cuentaBancaria);
    const tipoCta = (s.tipoCuenta || '').toLowerCase().includes('corriente') ? 'CORRIENTE' : 'AHORRO';

    const row = [
      cedulaReal,
      nombre,
      cuenta,
      tipoCta
    ];

    lines.push(row.join(delimiter));
  });

  return {
    content: lines.join('\r\n'),
    totalRecords: lines.length,
    filename: `UPEL_BDV_ACREDITACION_${sanitizeForBank(periodo).replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.txt`
  };
};

/**
 * 3. Generador Multibanco Interbancario (Todos los Bancos Nacionales)
 * Datos esenciales: Cédula real, Nombre del docente, Cuenta (20 dígitos), Tipo de Cuenta
 */
export const generateMultibancoTxt = (staffList = [], options = {}) => {
  const { 
    bancoFiltro = 'Todos', 
    soloActivosConCarga = false, 
    periodo = 'ACTUAL',
    delimiter = '\t'
  } = options;

  let filtered = staffList.filter(s => {
    const cuenta = cleanAccountNumber(s.cuentaBancaria);
    if (cuenta.length < 16) return false;

    if (bancoFiltro !== 'Todos') {
      const nombreBanco = getBankNameFromAccount(cuenta);
      const bDecl = String(s.banco || '').toLowerCase();
      const bFiltro = bancoFiltro.toLowerCase();

      const isBdtMatch = 
        (bFiltro.includes('digital') || bFiltro.includes('bicentenario') || bFiltro.includes('bdt') || bFiltro.includes('trabajador')) &&
        (cuenta.startsWith('0175') || bDecl.includes('digital') || bDecl.includes('bicentenario') || bDecl.includes('trabajador'));

      if (!isBdtMatch && 
          !nombreBanco.toLowerCase().includes(bFiltro) && 
          !bDecl.includes(bFiltro)) {
        return false;
      }
    }

    if (soloActivosConCarga) {
      const horas = (s.materias || []).reduce((acc, m) => acc + (parseInt(m.horasSemanal) || 0), 0);
      if (horas <= 0) return false;
    }
    return true;
  });

  filtered.sort((a, b) => {
    if (options.sortBy === 'cedula') {
      const ciA = parseInt(String(a.cedula || '').replace(/\D/g, '')) || 0;
      const ciB = parseInt(String(b.cedula || '').replace(/\D/g, '')) || 0;
      if (ciA !== ciB) return ciA - ciB;
      const nameA = `${a.apellidos || ''} ${a.nombres || ''}`.trim();
      const nameB = `${b.apellidos || ''} ${b.nombres || ''}`.trim();
      return nameA.localeCompare(nameB, 'es', { sensitivity: 'base' });
    }
    // Por defecto: Opción 3 Alfabético (A-Z) y luego por Cédula Numérica
    const nameA = `${a.apellidos || ''} ${a.nombres || ''}`.trim();
    const nameB = `${b.apellidos || ''} ${b.nombres || ''}`.trim();
    const cmp = nameA.localeCompare(nameB, 'es', { sensitivity: 'base' });
    if (cmp !== 0) return cmp;
    const ciA = parseInt(String(a.cedula || '').replace(/\D/g, '')) || 0;
    const ciB = parseInt(String(b.cedula || '').replace(/\D/g, '')) || 0;
    return ciA - ciB;
  });

  const lines = [];

  filtered.forEach(s => {
    const cedulaReal = s.cedula ? String(s.cedula).trim() : 'V-0';
    const nombre = sanitizeForBank(`${s.apellidos || ''} ${s.nombres || ''}`);
    const cuenta = padAccount20(s.cuentaBancaria);
    const tipoCta = (s.tipoCuenta || '').toLowerCase().includes('corriente') ? 'CORRIENTE' : 'AHORRO';

    lines.push([
      cedulaReal,
      nombre,
      cuenta,
      tipoCta
    ].join(delimiter));
  });

  return {
    content: lines.join('\r\n'),
    totalRecords: lines.length,
    filename: `UPEL_MULTIBANCO_CUENTAS_${sanitizeForBank(periodo).replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.txt`
  };
};

// Descargar archivo de texto plano en el navegador del usuario
export const downloadBankTxtFile = (filename, content) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * 4. Analizador e Importador de Archivo de Respuesta Bancaria / Rechazos
 * Procesa el archivo devuelto por el banco (Banco de Venezuela u otros bancos).
 * Cruza los datos con la base de datos de docentes de UPEL para identificar:
 * - Docentes con abono exitoso
 * - Docentes con cuenta rechazada / devuelta y el motivo del banco
 */
export const parseBankResponseTxt = (fileContent = '', staffList = []) => {
  if (!fileContent) return { total: 0, totalProcesados: 0, exitosos: [], rechazados: [], desconocidos: [] };

  const rawLines = fileContent.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const exitosos = [];
  const rechazados = [];
  const desconocidos = [];

  // Mapa rápido de docentes por cédula limpia
  const staffMap = {};
  (staffList || []).forEach(s => {
    const cleanCi = String(s.cedula || '').replace(/\D/g, '');
    if (cleanCi) staffMap[cleanCi] = s;
  });

  rawLines.forEach((line, lineIdx) => {
    // Si la línea es cabecera conocida, ignorar
    const lower = line.toLowerCase();
    if (lower.includes('nacionalidad') || lower.includes('beneficiario') || lower.includes('cabecera') || lower.startsWith('00000000')) {
      return;
    }

    // Extraer cuenta de 20 dígitos si existe
    const accountMatch = line.match(/\b\d{20}\b/);
    const cuentaEncontrada = accountMatch ? accountMatch[0] : '';

    // Extraer cédula: patrón V-12345678 o sólo dígitos (6 a 9 dígitos)
    const cedulaMatch = line.match(/\b[VEve]-?(\d{6,9})\b/) || line.match(/\b(\d{6,9})\b/);
    const cedulaDigits = cedulaMatch ? cedulaMatch[1] : '';

    const staff = staffMap[cedulaDigits] || null;

    // Detectar si la línea indica rechazo o error
    const isError = lower.includes('rechaz') || 
                    lower.includes('devuel') || 
                    lower.includes('error') || 
                    lower.includes('inval') || 
                    lower.includes('bloque') || 
                    lower.includes('inactiv') || 
                    lower.includes('cerrad') || 
                    lower.includes('no coincide') ||
                    lower.includes('fallecid') ||
                    lower.includes('no existe') ||
                    /\b(01|02|03|51|76|83|99)\b/.test(line);

    // Extraer posible motivo textual
    let motivo = 'Abono procesado exitosamente';
    if (isError) {
      if (lower.includes('bloque')) motivo = 'Cuenta Bloqueada por el Banco';
      else if (lower.includes('inactiv') || lower.includes('cerrad')) motivo = 'Cuenta Inactiva o Cancelada';
      else if (lower.includes('no coincide')) motivo = 'Cédula no coincide con el titular';
      else if (lower.includes('no existe')) motivo = 'Cuenta no existe en la entidad';
      else if (lower.includes('fallecid')) motivo = 'Titular reportado fallecido';
      else if (lower.includes('fondos') || lower.includes('51')) motivo = 'Fondos o saldo deudor';
      else if (lower.includes('inval') || lower.includes('digito')) motivo = 'Dígito verificador de cuenta inválido';
      else motivo = 'Rechazado por el banco (Verificar en plataforma)';
    }

    const item = {
      linea: lineIdx + 1,
      cedula: staff ? staff.cedula : (cedulaDigits ? `V-${cedulaDigits}` : 'N/D'),
      nombre: staff ? `${staff.nombres} ${staff.apellidos}` : 'No encontrado en sistema UPEL',
      departamento: staff ? staff.department : 'N/A',
      sede: staff ? (staff.sedeCentro || 'Rubio') : 'N/A',
      telefono: staff ? (staff.telefonos || staff.telefono || '') : '',
      correo: staff ? (staff.correoInstitucional || staff.correo || '') : '',
      cuenta: cuentaEncontrada || (staff ? staff.cuentaBancaria : 'N/D'),
      motivo,
      lineaOriginal: line,
      estado: isError ? 'RECHAZADO' : 'EXITOSO'
    };

    if (!staff && !cedulaDigits) {
      desconocidos.push(item);
    } else if (isError) {
      rechazados.push(item);
    } else {
      exitosos.push(item);
    }
  });

  return {
    total: rawLines.length,
    totalProcesados: exitosos.length + rechazados.length,
    exitosos,
    rechazados,
    desconocidos
  };
};

// Generar enlace directo de WhatsApp para notificar al docente con rechazo bancario
export const generateRechazoWhatsAppUrl = (docente) => {
  const phone = String(docente.telefono || '').replace(/\D/g, '');
  if (!phone) return null;
  const intlPhone = phone.startsWith('58') ? phone : (phone.startsWith('0') ? '58' + phone.substring(1) : '58' + phone);
  const text = `Estimado(a) Prof. ${docente.nombre}: Le informamos de la Unidad de Talento Humano UPEL IPRGR que su cuenta bancaria (${docente.cuenta}) presentó un rechazo bancario en el procesamiento de nómina: "${docente.motivo}". Por favor acérquese o ingrese al portal de Talento Humano para verificar y actualizar su número de cuenta. Gracias.`;
  return `https://wa.me/${intlPhone}?text=${encodeURIComponent(text)}`;
};

