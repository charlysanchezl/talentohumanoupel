import ExcelJS from 'exceljs';
import { matchDepartment, normalizeDepartmentName } from '../data';
import { formatFechaEspanol } from '../utils/staffExcelExportHelper';

/**
 * Exportador Institucional de Excel Multipestaña para UPEL SIGOA
 * Genera un archivo .xlsx de nivel corporativo con 5 pestañas:
 * 1. Resumen y KPIs
 * 2. Sede Rubio
 * 3. Sede Sabana de Mendoza
 * 4. Sede Encontrados
 * 5. Catálogo de Asignaturas y Demanda
 */
export const exportInstitutionalExcel = async ({ staffList = [], materiasCatalogo = [], user = null, periodName = 'Todos' }) => {
  // Filtrar estrictamente:
  // 1. Descartar docentes sin materias asignadas.
  // 2. Descartar docentes con estatus 'Por Revisar' (carga promovida pendiente de validación en lapso activo).
  // 3. En lapso activo: solo incluir docentes formalmente validados (status 'Validado' o 'Activo').
  // 4. En lapso cerrado/culminado: incluir los docentes con carga académica histórica de ese lapso culminado.
  const validStaffList = staffList.filter(d => {
    if (d.status === 'Por Revisar') return false;
    const hasMaterias = Array.isArray(d.materias) && d.materias.length > 0;
    if (!hasMaterias) return false;

    // Si es un lapso cerrado o registro histórico culminado
    if (d.status === 'Cerrado') return true;
    if (periodName && periodName !== 'Todos' && periodName !== '2026-II') {
      return true;
    }

    // En lapso activo: solo docentes con carga formalmente validada o activa
    const isValidado = d.status === 'Validado' || d.status === 'Activo';
    return isValidado;
  });
  staffList = validStaffList;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'UPEL SIGOA - Subdirección de Docencia';
  workbook.lastModifiedBy = user?.name || 'Administrador SIGOA';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Cargar logotipo institucional para las cabeceras
  let logoImageId = null;
  try {
    const res = await fetch('/logo.png');
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      logoImageId = workbook.addImage({
        buffer,
        extension: 'png',
      });
    } else {
      const resJpg = await fetch('/logo.jpg');
      if (resJpg.ok) {
        const buffer = await resJpg.arrayBuffer();
        logoImageId = workbook.addImage({
          buffer,
          extension: 'jpeg',
        });
      }
    }
  } catch (err) {
    console.warn('No se pudo cargar el logo para Excel:', err);
  }

  // Colores Institucionales
  const COLOR_NAVY = 'FF003366'; // Azul UPEL
  const COLOR_GOLD = 'FFD97706'; // Oro Institucional
  const COLOR_ROW_ALT = 'FFF1F5F9';
  const COLOR_TEXT_DARK = 'FF1E293B';
  const COLOR_BORDER = 'FFE2E8F0';

  const styleHeaderCell = (cell, isGold = false) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: isGold ? COLOR_GOLD : COLOR_NAVY }
    };
    cell.font = {
      name: 'Calibri',
      size: 11,
      bold: true,
      color: { argb: 'FFFFFFFF' }
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: COLOR_BORDER } },
      left: { style: 'thin', color: { argb: COLOR_BORDER } },
      bottom: { style: 'medium', color: { argb: isGold ? 'FFB45309' : 'FF001F3F' } },
      right: { style: 'thin', color: { argb: COLOR_BORDER } }
    };
  };

  const styleDataCell = (cell, isAlt = false, align = 'left', isBold = false) => {
    if (isAlt) {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: COLOR_ROW_ALT }
      };
    }
    cell.font = {
      name: 'Calibri',
      size: 10,
      bold: isBold,
      color: { argb: COLOR_TEXT_DARK }
    };
    cell.alignment = { vertical: 'middle', horizontal: align, wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: COLOR_BORDER } },
      left: { style: 'thin', color: { argb: COLOR_BORDER } },
      bottom: { style: 'thin', color: { argb: COLOR_BORDER } },
      right: { style: 'thin', color: { argb: COLOR_BORDER } }
    };
  };

  // -------------------------------------------------------------
  // HOJA 1: RESUMEN Y KPIS
  // -------------------------------------------------------------
  const wsSummary = workbook.addWorksheet('📊 Resumen y KPIs', {
    views: [{ showGridLines: true }]
  });

  wsSummary.columns = [
    { width: 14 }, // Espacio para Logo Institucional
    { width: 32 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 22 },
    { width: 16 }
  ];

  if (logoImageId !== null) {
    wsSummary.addImage(logoImageId, {
      tl: { col: 0.1, row: 0.2 },
      ext: { width: 70, height: 70 }
    });
  }

  // Banner Superior / Membrete Institucional
  wsSummary.mergeCells('B1:G1');
  const bannerCountry = wsSummary.getCell('B1');
  bannerCountry.value = 'REPÚBLICA BOLIVARIANA DE VENEZUELA';
  bannerCountry.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF008744' } };
  bannerCountry.alignment = { horizontal: 'center', vertical: 'middle' };

  wsSummary.mergeCells('B2:G2');
  const title1 = wsSummary.getCell('B2');
  title1.value = 'UNIVERSIDAD PEDAGÓGICA EXPERIMENTAL LIBERTADOR';
  title1.font = { name: 'Calibri', size: 13, bold: true, color: { argb: COLOR_NAVY } };
  title1.alignment = { horizontal: 'center', vertical: 'middle' };

  wsSummary.mergeCells('B3:G3');
  const title2 = wsSummary.getCell('B3');
  title2.value = 'INSTITUTO PEDAGÓGICO RURAL GERVASIO RUBIO - SUBDIRECCIÓN DE DOCENCIA';
  title2.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLOR_GOLD } };
  title2.alignment = { horizontal: 'center', vertical: 'middle' };

  wsSummary.mergeCells('B4:G4');
  const title3 = wsSummary.getCell('B4');
  title3.value = `MATRIZ DISTRIBUTIVA DE TALENTO HUMANO Y CARGA ACADÉMICA • LAPSO ${periodName}`;
  title3.font = { name: 'Calibri', size: 11, bold: true, color: { argb: COLOR_TEXT_DARK } };
  title3.alignment = { horizontal: 'center', vertical: 'middle' };

  // Metadatos
  wsSummary.getCell('B6').value = 'Período Académico:';
  wsSummary.getCell('B6').font = { bold: true, size: 10, color: { argb: COLOR_NAVY } };
  wsSummary.getCell('C6').value = periodName;

  wsSummary.getCell('D6').value = 'Fecha de Emisión:';
  wsSummary.getCell('D6').font = { bold: true, size: 10 };
  wsSummary.getCell('E6').value = new Date().toLocaleString('es-VE');

  wsSummary.getCell('F6').value = 'Generado Por:';
  wsSummary.getCell('F6').font = { bold: true, size: 10 };
  wsSummary.getCell('G6').value = `${user?.name || 'Administrador'} (${user?.role || 'DOCENCIA'})`;

  // Cálculos Globales
  const totalDocentes = staffList.length;
  const totalHoras = staffList.reduce((acc, d) => acc + (d.materias || []).reduce((sum, m) => sum + (parseInt(m.horasSemanal) || 0), 0), 0);
  const promedioHoras = totalDocentes > 0 ? (totalHoras / totalDocentes).toFixed(1) : '0';
  const activos = staffList.filter(d => (d.status || '').toLowerCase().includes('activo') || (d.status || '').toLowerCase().includes('revisar')).length;
  const porVencer = staffList.filter(d => (d.status || '').toLowerCase().includes('vencer')).length;
  const inactivos = staffList.filter(d => (d.status || '').toLowerCase().includes('inactivo')).length;

  // KPIs Cards
  wsSummary.getCell('B8').value = 'INDICADORES CLAVE DE GESTIÓN (KPIS)';
  wsSummary.getCell('B8').font = { bold: true, size: 11, color: { argb: COLOR_NAVY } };

  const kpis = [
    { label: 'Total Docentes', val: totalDocentes, col: 'B' },
    { label: 'Horas Semanales Totales', val: totalHoras, col: 'C' },
    { label: 'Promedio Horas/Docente', val: `${promedioHoras} hrs/sem`, col: 'D' },
    { label: 'Docentes Activos', val: activos, col: 'E' },
    { label: 'Contratos Por Vencer', val: porVencer, col: 'F' },
    { label: 'Docentes Inactivos', val: inactivos, col: 'G' },
  ];

  kpis.forEach(k => {
    const lblCell = wsSummary.getCell(`${k.col}9`);
    lblCell.value = k.label;
    lblCell.font = { size: 9, bold: true, color: { argb: 'FFFFFFFF' } };
    lblCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_NAVY } };
    lblCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

    const valCell = wsSummary.getCell(`${k.col}10`);
    valCell.value = k.val;
    valCell.font = { size: 14, bold: true, color: { argb: COLOR_GOLD } };
    valCell.alignment = { horizontal: 'center', vertical: 'middle' };
    valCell.border = {
      bottom: { style: 'medium', color: { argb: COLOR_GOLD } },
      left: { style: 'thin', color: { argb: COLOR_BORDER } },
      right: { style: 'thin', color: { argb: COLOR_BORDER } }
    };
  });

  // Tabla 1: Distribución por Sedes
  wsSummary.getCell('B12').value = 'DISTRIBUCIÓN INSTITUCIONAL POR SEDE';
  wsSummary.getCell('B12').font = { bold: true, size: 11, color: { argb: COLOR_NAVY } };

  const headersSedes = ['Sede / Extensión', 'Docentes', '% Nómina', 'Horas Semanales', '% Carga Horaria', 'Estatus'];
  headersSedes.forEach((h, idx) => {
    const colLetter = String.fromCharCode(66 + idx);
    const cell = wsSummary.getCell(`${colLetter}13`);
    cell.value = h;
    styleHeaderCell(cell, false);
  });

  const sedesList = [
    { key: 'Rubio', name: 'Sede Rubio (Central)' },
    { key: 'Sabana de Mendoza', name: 'Extensión Sabana de Mendoza' },
    { key: 'Encontrados', name: 'Extensión Encontrados' }
  ];

  let curRow = 14;
  sedesList.forEach((sede, sIdx) => {
    const docsSede = staffList.filter(d => (d.sedeCentro || 'Rubio').toLowerCase().includes(sede.key.toLowerCase()));
    const horasSede = docsSede.reduce((acc, d) => acc + (d.materias || []).reduce((sum, m) => sum + (parseInt(m.horasSemanal) || 0), 0), 0);
    const pctDocs = totalDocentes > 0 ? ((docsSede.length / totalDocentes) * 100).toFixed(1) + '%' : '0%';
    const pctHoras = totalHoras > 0 ? ((horasSede / totalHoras) * 100).toFixed(1) + '%' : '0%';

    const isAlt = sIdx % 2 === 1;
    const r = curRow;

    wsSummary.getCell(`B${r}`).value = sede.name;
    styleDataCell(wsSummary.getCell(`B${r}`), isAlt, 'left', true);

    wsSummary.getCell(`C${r}`).value = docsSede.length;
    styleDataCell(wsSummary.getCell(`C${r}`), isAlt, 'center');

    wsSummary.getCell(`D${r}`).value = pctDocs;
    styleDataCell(wsSummary.getCell(`D${r}`), isAlt, 'center');

    wsSummary.getCell(`E${r}`).value = horasSede;
    styleDataCell(wsSummary.getCell(`E${r}`), isAlt, 'center');

    wsSummary.getCell(`F${r}`).value = pctHoras;
    styleDataCell(wsSummary.getCell(`F${r}`), isAlt, 'center');

    wsSummary.getCell(`G${r}`).value = docsSede.length > 0 ? 'Operativa' : 'Sin Carga';
    styleDataCell(wsSummary.getCell(`G${r}`), isAlt, 'center');

    curRow++;
  });

  // Fila Total Sedes
  wsSummary.getCell(`B${curRow}`).value = 'TOTAL CONSOLIDADO';
  styleDataCell(wsSummary.getCell(`B${curRow}`), false, 'left', true);
  wsSummary.getCell(`C${curRow}`).value = totalDocentes;
  styleDataCell(wsSummary.getCell(`C${curRow}`), false, 'center', true);
  wsSummary.getCell(`D${curRow}`).value = '100.0%';
  styleDataCell(wsSummary.getCell(`D${curRow}`), false, 'center', true);
  wsSummary.getCell(`E${curRow}`).value = totalHoras;
  styleDataCell(wsSummary.getCell(`E${curRow}`), false, 'center', true);
  wsSummary.getCell(`F${curRow}`).value = '100.0%';
  styleDataCell(wsSummary.getCell(`F${curRow}`), false, 'center', true);
  wsSummary.getCell(`G${curRow}`).value = 'Activo';
  styleDataCell(wsSummary.getCell(`G${curRow}`), false, 'center', true);

  // -------------------------------------------------------------
  // HOJA 2: TABLAS DINÁMICAS Y CRUCES MULTIDIMENSIONALES
  // -------------------------------------------------------------
  const wsPivot = workbook.addWorksheet('📈 Tablas Dinámicas', {
    views: [{ showGridLines: true }]
  });

  wsPivot.columns = [
    { width: 5 },  // A (Margen / Logo)
    { width: 28 }, // B (Dimensión / Departamento)
    { width: 16 }, // C (Rubio)
    { width: 18 }, // D (Sabana de Mendoza)
    { width: 18 }, // E (Encontrados)
    { width: 18 }, // F (Total Docentes / Valor)
    { width: 16 }, // G (% Nómina)
    { width: 18 }  // H (Horas Semanales)
  ];

  if (logoImageId !== null) {
    wsPivot.addImage(logoImageId, {
      tl: { col: 0.1, row: 0.2 },
      ext: { width: 68, height: 68 }
    });
  }

  // Banner
  wsPivot.mergeCells('B1:H1');
  const pivC = wsPivot.getCell('B1');
  pivC.value = 'REPÚBLICA BOLIVARIANA DE VENEZUELA';
  pivC.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF008744' } };
  pivC.alignment = { horizontal: 'center', vertical: 'middle' };

  wsPivot.mergeCells('B2:H2');
  const pivU = wsPivot.getCell('B2');
  pivU.value = 'UNIVERSIDAD PEDAGÓGICA EXPERIMENTAL LIBERTADOR';
  pivU.font = { name: 'Calibri', size: 13, bold: true, color: { argb: COLOR_NAVY } };
  pivU.alignment = { horizontal: 'center', vertical: 'middle' };

  wsPivot.mergeCells('B3:H3');
  const pivI = wsPivot.getCell('B3');
  pivI.value = 'INSTITUTO PEDAGÓGICO RURAL "GERVASIO RUBIO" - SUBDIRECCIÓN DE DOCENCIA';
  pivI.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLOR_GOLD } };
  pivI.alignment = { horizontal: 'center', vertical: 'middle' };

  wsPivot.mergeCells('B4:H4');
  const pivT = wsPivot.getCell('B4');
  pivT.value = 'MATRICES DINÁMICAS Y CONSOLIDACIÓN MULTIDIMENSIONAL DE TALENTO HUMANO';
  pivT.font = { name: 'Calibri', size: 11, bold: true, color: { argb: COLOR_TEXT_DARK } };
  pivT.alignment = { horizontal: 'center', vertical: 'middle' };

  wsPivot.getCell('B5').value = 'Fecha de Emisión: ' + new Date().toLocaleString('es-VE') + ' | Generado por: ' + (user?.name || 'Administrador');
  wsPivot.getCell('B5').font = { size: 9, italic: true, color: { argb: 'FF64748B' } };

  // Departamentos institucionales canónicos de la UPEL (evita duplicados mayúsculas/minúsculas)
  const deptsArray = ['Matemática', 'Pedagogía', 'Ciencias Sociales', 'Agroindustrial'];

  // ==========================================
  // MATRIZ 1: DOCENTES POR DEPARTAMENTO VS SEDE
  // ==========================================
  let pRow = 7;
  wsPivot.getCell(`B${pRow}`).value = '1. MATRIZ DINÁMICA: DOCENTES POR DEPARTAMENTO VS SEDE TERRITORIAL';
  wsPivot.getCell(`B${pRow}`).font = { bold: true, size: 11, color: { argb: COLOR_NAVY } };
  pRow++;

  const headersMat1 = ['Departamento Académico', 'Sede Rubio', 'Ext. Sabana de Mendoza', 'Ext. Encontrados', 'Total Docentes', '% Nómina', 'Carga Horaria Sem.'];
  headersMat1.forEach((h, idx) => {
    const colLetter = String.fromCharCode(66 + idx);
    const cell = wsPivot.getCell(`${colLetter}${pRow}`);
    cell.value = h;
    styleHeaderCell(cell, false);
  });
  pRow++;

  deptsArray.forEach((dept, idx) => {
    const isAlt = idx % 2 === 1;
    const docsDept = staffList.filter(d => matchDepartment(d.department, dept));
    const rubioCount = docsDept.filter(d => (d.sedeCentro || 'Rubio').toLowerCase().includes('rubio')).length;
    const smCount = docsDept.filter(d => (d.sedeCentro || '').toLowerCase().includes('mendoza')).length;
    const encCount = docsDept.filter(d => (d.sedeCentro || '').toLowerCase().includes('encontrados')).length;
    const totDocDept = docsDept.length;
    const pctDoc = totalDocentes > 0 ? ((totDocDept / totalDocentes) * 100).toFixed(1) + '%' : '0%';
    const totHorasDept = docsDept.reduce((acc, d) => acc + (d.materias || []).reduce((sum, m) => sum + (parseInt(m.horasSemanal) || 0), 0), 0);

    wsPivot.getCell(`B${pRow}`).value = dept;
    styleDataCell(wsPivot.getCell(`B${pRow}`), isAlt, 'left', true);

    wsPivot.getCell(`C${pRow}`).value = rubioCount;
    styleDataCell(wsPivot.getCell(`C${pRow}`), isAlt, 'center');

    wsPivot.getCell(`D${pRow}`).value = smCount;
    styleDataCell(wsPivot.getCell(`D${pRow}`), isAlt, 'center');

    wsPivot.getCell(`E${pRow}`).value = encCount;
    styleDataCell(wsPivot.getCell(`E${pRow}`), isAlt, 'center');

    wsPivot.getCell(`F${pRow}`).value = totDocDept;
    styleDataCell(wsPivot.getCell(`F${pRow}`), isAlt, 'center', true);

    wsPivot.getCell(`G${pRow}`).value = pctDoc;
    styleDataCell(wsPivot.getCell(`G${pRow}`), isAlt, 'center');

    wsPivot.getCell(`H${pRow}`).value = totHorasDept;
    styleDataCell(wsPivot.getCell(`H${pRow}`), isAlt, 'center', true);

    pRow++;
  });

  // Total Matriz 1
  wsPivot.getCell(`B${pRow}`).value = 'TOTAL DOCENTES CONSOLIDADO';
  styleDataCell(wsPivot.getCell(`B${pRow}`), false, 'left', true);

  const totRubio = staffList.filter(d => (d.sedeCentro || 'Rubio').toLowerCase().includes('rubio')).length;
  const totSM = staffList.filter(d => (d.sedeCentro || '').toLowerCase().includes('mendoza')).length;
  const totEnc = staffList.filter(d => (d.sedeCentro || '').toLowerCase().includes('encontrados')).length;

  wsPivot.getCell(`C${pRow}`).value = totRubio;
  styleDataCell(wsPivot.getCell(`C${pRow}`), false, 'center', true);

  wsPivot.getCell(`D${pRow}`).value = totSM;
  styleDataCell(wsPivot.getCell(`D${pRow}`), false, 'center', true);

  wsPivot.getCell(`E${pRow}`).value = totEnc;
  styleDataCell(wsPivot.getCell(`E${pRow}`), false, 'center', true);

  wsPivot.getCell(`F${pRow}`).value = totalDocentes;
  styleDataCell(wsPivot.getCell(`F${pRow}`), false, 'center', true);

  wsPivot.getCell(`G${pRow}`).value = '100.0%';
  styleDataCell(wsPivot.getCell(`G${pRow}`), false, 'center', true);

  wsPivot.getCell(`H${pRow}`).value = totalHoras;
  styleDataCell(wsPivot.getCell(`H${pRow}`), false, 'center', true);

  pRow += 3;

  // ==========================================
  // MATRIZ 2: CARGA HORARIA POR DEPARTAMENTO VS SEDE
  // ==========================================
  wsPivot.getCell(`B${pRow}`).value = '2. MATRIZ DINÁMICA: CARGA HORARIA SEMANAL POR DEPARTAMENTO VS SEDE';
  wsPivot.getCell(`B${pRow}`).font = { bold: true, size: 11, color: { argb: COLOR_NAVY } };
  pRow++;

  const headersMat2 = ['Departamento Académico', 'Hrs Rubio', 'Hrs Sabana de Mendoza', 'Hrs Encontrados', 'Total Horas Semanales', 'Promedio Hrs/Docente', 'Estatus'];
  headersMat2.forEach((h, idx) => {
    const colLetter = String.fromCharCode(66 + idx);
    const cell = wsPivot.getCell(`${colLetter}${pRow}`);
    cell.value = h;
    styleHeaderCell(cell, false);
  });
  pRow++;

  deptsArray.forEach((dept, idx) => {
    const isAlt = idx % 2 === 1;
    const docsDept = staffList.filter(d => matchDepartment(d.department, dept));
    
    const hrsRubio = docsDept
      .filter(d => (d.sedeCentro || 'Rubio').toLowerCase().includes('rubio'))
      .reduce((acc, d) => acc + (d.materias || []).reduce((sum, m) => sum + (parseInt(m.horasSemanal) || 0), 0), 0);
    
    const hrsSM = docsDept
      .filter(d => (d.sedeCentro || '').toLowerCase().includes('mendoza'))
      .reduce((acc, d) => acc + (d.materias || []).reduce((sum, m) => sum + (parseInt(m.horasSemanal) || 0), 0), 0);

    const hrsEnc = docsDept
      .filter(d => (d.sedeCentro || '').toLowerCase().includes('encontrados'))
      .reduce((acc, d) => acc + (d.materias || []).reduce((sum, m) => sum + (parseInt(m.horasSemanal) || 0), 0), 0);

    const totHrsDept = hrsRubio + hrsSM + hrsEnc;
    const promHrsDept = docsDept.length > 0 ? (totHrsDept / docsDept.length).toFixed(1) : '0';

    wsPivot.getCell(`B${pRow}`).value = dept;
    styleDataCell(wsPivot.getCell(`B${pRow}`), isAlt, 'left', true);

    wsPivot.getCell(`C${pRow}`).value = hrsRubio;
    styleDataCell(wsPivot.getCell(`C${pRow}`), isAlt, 'center');

    wsPivot.getCell(`D${pRow}`).value = hrsSM;
    styleDataCell(wsPivot.getCell(`D${pRow}`), isAlt, 'center');

    wsPivot.getCell(`E${pRow}`).value = hrsEnc;
    styleDataCell(wsPivot.getCell(`E${pRow}`), isAlt, 'center');

    wsPivot.getCell(`F${pRow}`).value = totHrsDept;
    styleDataCell(wsPivot.getCell(`F${pRow}`), isAlt, 'center', true);

    wsPivot.getCell(`G${pRow}`).value = `${promHrsDept} h/doc`;
    styleDataCell(wsPivot.getCell(`G${pRow}`), isAlt, 'center');

    wsPivot.getCell(`H${pRow}`).value = totHrsDept > 0 ? 'Activa' : 'Sin Horas';
    styleDataCell(wsPivot.getCell(`H${pRow}`), isAlt, 'center');

    pRow++;
  });

  // Total Matriz 2
  wsPivot.getCell(`B${pRow}`).value = 'TOTAL HORAS SEMANALES';
  styleDataCell(wsPivot.getCell(`B${pRow}`), false, 'left', true);

  const totHrsRubio = staffList.filter(d => (d.sedeCentro || 'Rubio').toLowerCase().includes('rubio'))
    .reduce((acc, d) => acc + (d.materias || []).reduce((s, m) => s + (parseInt(m.horasSemanal) || 0), 0), 0);
  const totHrsSM = staffList.filter(d => (d.sedeCentro || '').toLowerCase().includes('mendoza'))
    .reduce((acc, d) => acc + (d.materias || []).reduce((s, m) => s + (parseInt(m.horasSemanal) || 0), 0), 0);
  const totHrsEnc = staffList.filter(d => (d.sedeCentro || '').toLowerCase().includes('encontrados'))
    .reduce((acc, d) => acc + (d.materias || []).reduce((s, m) => s + (parseInt(m.horasSemanal) || 0), 0), 0);

  wsPivot.getCell(`C${pRow}`).value = totHrsRubio;
  styleDataCell(wsPivot.getCell(`C${pRow}`), false, 'center', true);

  wsPivot.getCell(`D${pRow}`).value = totHrsSM;
  styleDataCell(wsPivot.getCell(`D${pRow}`), false, 'center', true);

  wsPivot.getCell(`E${pRow}`).value = totHrsEnc;
  styleDataCell(wsPivot.getCell(`E${pRow}`), false, 'center', true);

  wsPivot.getCell(`F${pRow}`).value = totalHoras;
  styleDataCell(wsPivot.getCell(`F${pRow}`), false, 'center', true);

  wsPivot.getCell(`G${pRow}`).value = `${promedioHoras} h/doc`;
  styleDataCell(wsPivot.getCell(`G${pRow}`), false, 'center', true);

  wsPivot.getCell(`H${pRow}`).value = 'Operativo';
  styleDataCell(wsPivot.getCell(`H${pRow}`), false, 'center', true);

  pRow += 3;

  // ==========================================
  // MATRIZ 3: CATEGORÍA DOCENTE VS DEDICACIÓN
  // ==========================================
  wsPivot.getCell(`B${pRow}`).value = '3. MATRIZ DINÁMICA: CATEGORÍA ACADÉMICA VS DEDICACIÓN LABORAL';
  wsPivot.getCell(`B${pRow}`).font = { bold: true, size: 11, color: { argb: COLOR_NAVY } };
  pRow++;

  const headersMat3 = ['Categoría Docente', 'Convencional', 'Medio Tiempo', 'Tiempo Completo', 'Exclusiva', 'Total Personal', '% Nómina'];
  headersMat3.forEach((h, idx) => {
    const colLetter = String.fromCharCode(66 + idx);
    const cell = wsPivot.getCell(`${colLetter}${pRow}`);
    cell.value = h;
    styleHeaderCell(cell, false);
  });
  pRow++;

  const categoriasList = ['Instructor', 'Asistente', 'Agregado', 'Asociado', 'Titular'];
  categoriasList.forEach((cat, idx) => {
    const isAlt = idx % 2 === 1;
    const docsCat = staffList.filter(d => (d.categoriaDocente || 'Instructor').toLowerCase() === cat.toLowerCase());
    const conv = docsCat.filter(d => (d.dedicacion || 'Tiempo Convencional').toLowerCase().includes('convencional')).length;
    const mt = docsCat.filter(d => (d.dedicacion || '').toLowerCase().includes('medio')).length;
    const tc = docsCat.filter(d => (d.dedicacion || '').toLowerCase().includes('completo')).length;
    const de = docsCat.filter(d => (d.dedicacion || '').toLowerCase().includes('exclusiv')).length;
    const totCat = docsCat.length;
    const pctCat = totalDocentes > 0 ? ((totCat / totalDocentes) * 100).toFixed(1) + '%' : '0%';

    wsPivot.getCell(`B${pRow}`).value = cat;
    styleDataCell(wsPivot.getCell(`B${pRow}`), isAlt, 'left', true);

    wsPivot.getCell(`C${pRow}`).value = conv;
    styleDataCell(wsPivot.getCell(`C${pRow}`), isAlt, 'center');

    wsPivot.getCell(`D${pRow}`).value = mt;
    styleDataCell(wsPivot.getCell(`D${pRow}`), isAlt, 'center');

    wsPivot.getCell(`E${pRow}`).value = tc;
    styleDataCell(wsPivot.getCell(`E${pRow}`), isAlt, 'center');

    wsPivot.getCell(`F${pRow}`).value = de;
    styleDataCell(wsPivot.getCell(`F${pRow}`), isAlt, 'center');

    wsPivot.getCell(`G${pRow}`).value = totCat;
    styleDataCell(wsPivot.getCell(`G${pRow}`), isAlt, 'center', true);

    wsPivot.getCell(`H${pRow}`).value = pctCat;
    styleDataCell(wsPivot.getCell(`H${pRow}`), isAlt, 'center');

    pRow++;
  });

  // Total Matriz 3
  wsPivot.getCell(`B${pRow}`).value = 'TOTAL CATEGORÍAS';
  styleDataCell(wsPivot.getCell(`B${pRow}`), false, 'left', true);

  const totConv = staffList.filter(d => (d.dedicacion || 'Tiempo Convencional').toLowerCase().includes('convencional')).length;
  const totMT = staffList.filter(d => (d.dedicacion || '').toLowerCase().includes('medio')).length;
  const totTC = staffList.filter(d => (d.dedicacion || '').toLowerCase().includes('completo')).length;
  const totDE = staffList.filter(d => (d.dedicacion || '').toLowerCase().includes('exclusiv')).length;

  wsPivot.getCell(`C${pRow}`).value = totConv;
  styleDataCell(wsPivot.getCell(`C${pRow}`), false, 'center', true);

  wsPivot.getCell(`D${pRow}`).value = totMT;
  styleDataCell(wsPivot.getCell(`D${pRow}`), false, 'center', true);

  wsPivot.getCell(`E${pRow}`).value = totTC;
  styleDataCell(wsPivot.getCell(`E${pRow}`), false, 'center', true);

  wsPivot.getCell(`F${pRow}`).value = totDE;
  styleDataCell(wsPivot.getCell(`F${pRow}`), false, 'center', true);

  wsPivot.getCell(`G${pRow}`).value = totalDocentes;
  styleDataCell(wsPivot.getCell(`G${pRow}`), false, 'center', true);

  wsPivot.getCell(`H${pRow}`).value = '100.0%';
  styleDataCell(wsPivot.getCell(`H${pRow}`), false, 'center', true);

  // -------------------------------------------------------------
  // FUNCIÓN AUXILIAR: GENERAR HOJA POR SEDE
  // -------------------------------------------------------------
  const generateSedeSheet = (sheetName, filterKey, displayTitle) => {
    const ws = workbook.addWorksheet(sheetName, { views: [{ showGridLines: true }] });
    ws.columns = [
      { width: 14 }, // Cédula
      { width: 28 }, // Docente
      { width: 26 }, // Departamento
      { width: 16 }, // Categoría
      { width: 20 }, // Dedicación
      { width: 14 }, // Estatus
      { width: 14 }, // Teléfonos
      { width: 24 }, // Correo
      { width: 35 }, // Asignaturas
      { width: 12 }, // Hrs Sem
      { width: 12 }  // Hrs Lapso
    ];

    // Membrete Institucional Protocolar y Logo
    if (logoImageId !== null) {
      ws.addImage(logoImageId, {
        tl: { col: 0.1, row: 0.2 },
        ext: { width: 68, height: 68 }
      });
    }

    ws.mergeCells('B1:K1');
    const hCountry = ws.getCell('B1');
    hCountry.value = 'REPÚBLICA BOLIVARIANA DE VENEZUELA';
    hCountry.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF008744' } };
    hCountry.alignment = { horizontal: 'center', vertical: 'middle' };

    ws.mergeCells('B2:K2');
    const hUniv = ws.getCell('B2');
    hUniv.value = 'UNIVERSIDAD PEDAGÓGICA EXPERIMENTAL LIBERTADOR';
    hUniv.font = { name: 'Calibri', size: 12, bold: true, color: { argb: COLOR_NAVY } };
    hUniv.alignment = { horizontal: 'center', vertical: 'middle' };

    ws.mergeCells('B3:K3');
    const hInst = ws.getCell('B3');
    hInst.value = 'INSTITUTO PEDAGÓGICO RURAL "GERVASIO RUBIO" - SUBDIRECCIÓN DE DOCENCIA';
    hInst.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLOR_GOLD } };
    hInst.alignment = { horizontal: 'center', vertical: 'middle' };

    ws.mergeCells('B4:K4');
    const headerTitle = ws.getCell('B4');
    headerTitle.value = `MATRIZ DE DISTRIBUCIÓN DE TALENTO HUMANO - ${displayTitle.toUpperCase()} • LAPSO: ${periodName}`;
    headerTitle.font = { name: 'Calibri', size: 11, bold: true, color: { argb: COLOR_TEXT_DARK } };
    headerTitle.alignment = { horizontal: 'center', vertical: 'middle' };

    // Fila 5: Metadatos
    ws.getCell('B5').value = 'Fecha de Emisión:';
    ws.getCell('B5').font = { bold: true, size: 9, color: { argb: 'FF64748B' } };
    ws.getCell('C5').value = new Date().toLocaleString('es-VE');
    ws.getCell('C5').font = { size: 9 };

    ws.getCell('F5').value = 'Generado Por:';
    ws.getCell('F5').font = { bold: true, size: 9, color: { argb: 'FF64748B' } };
    ws.getCell('G5').value = `${user?.name || 'Administrador'} (${user?.role || 'DOCENCIA'})`;
    ws.getCell('G5').font = { size: 9 };

    // Fila 7: Cabeceras de la tabla
    const headers = [
      'Cédula', 'Docente (Apellidos y Nombres)', 'Departamento', 'Categoría', 
      'Dedicación', 'Estatus', 'Teléfono', 'Correo Institucional', 
      'Asignaturas Impartidas', 'Hrs Sem', 'Hrs Lapso'
    ];

    headers.forEach((h, idx) => {
      const colLetter = String.fromCharCode(65 + idx);
      const cell = ws.getCell(`${colLetter}7`);
      cell.value = h;
      styleHeaderCell(cell, false);
    });

    const docs = staffList.filter(d => {
      const sede = (d.sedeCentro || 'Rubio').toLowerCase();
      return sede.includes(filterKey.toLowerCase());
    });

    // Ordenamiento por Cédula Numérica
    docs.sort((a, b) => {
      const ciA = parseInt(String(a.cedula || '').replace(/\D/g, '')) || 0;
      const ciB = parseInt(String(b.cedula || '').replace(/\D/g, '')) || 0;
      if (ciA !== ciB) return ciA - ciB;
      const nameA = `${a.apellidos || ''} ${a.nombres || ''}`.trim();
      const nameB = `${b.apellidos || ''} ${b.nombres || ''}`.trim();
      return nameA.localeCompare(nameB, 'es', { sensitivity: 'base' });
    });

    let rowNum = 8;
    docs.forEach((doc, idx) => {
      const isAlt = idx % 2 === 1;
      const materiasNames = (doc.materias || []).map(m => {
        const sec = m.seccion || m.secciones || '';
        const cup = (m.cupos !== undefined && m.cupos !== null && m.cupos !== '') ? m.cupos : '';
        const ins = (m.inscritos !== undefined && m.inscritos !== null && m.inscritos !== '') ? m.inscritos : '';
        const details = [
          sec ? `Sec: ${sec}` : '',
          (cup !== '' || ins !== '') ? `Cup/Ins: ${cup || '-'}/${ins || '-'}` : ''
        ].filter(Boolean).join(' | ');
        return `${m.nombre}${details ? ` [${details}]` : ''} (${m.horasSemanal || 0}h)`;
      }).join(', ') || 'Sin materias';
      const totSem = (doc.materias || []).reduce((sum, m) => sum + (parseInt(m.horasSemanal) || 0), 0);
      const totLap = (doc.materias || []).reduce((sum, m) => sum + (parseInt(m.horasLapso) || 0), 0);

      ws.getCell(`A${rowNum}`).value = doc.cedula;
      styleDataCell(ws.getCell(`A${rowNum}`), isAlt, 'center');

      ws.getCell(`B${rowNum}`).value = `${doc.apellidos || ''}, ${doc.nombres || ''}`.trim();
      styleDataCell(ws.getCell(`B${rowNum}`), isAlt, 'left', true);

      ws.getCell(`C${rowNum}`).value = normalizeDepartmentName(doc.department) || 'N/A';
      styleDataCell(ws.getCell(`C${rowNum}`), isAlt, 'left');

      ws.getCell(`D${rowNum}`).value = doc.categoriaDocente || 'Instructor';
      styleDataCell(ws.getCell(`D${rowNum}`), isAlt, 'center');

      ws.getCell(`E${rowNum}`).value = doc.dedicacion || 'Tiempo Convencional';
      styleDataCell(ws.getCell(`E${rowNum}`), isAlt, 'center');

      ws.getCell(`F${rowNum}`).value = doc.status || 'Activo';
      styleDataCell(ws.getCell(`F${rowNum}`), isAlt, 'center');

      ws.getCell(`G${rowNum}`).value = doc.telefonos || 'N/A';
      styleDataCell(ws.getCell(`G${rowNum}`), isAlt, 'center');

      ws.getCell(`H${rowNum}`).value = doc.correo || 'N/A';
      styleDataCell(ws.getCell(`H${rowNum}`), isAlt, 'left');

      ws.getCell(`I${rowNum}`).value = materiasNames;
      styleDataCell(ws.getCell(`I${rowNum}`), isAlt, 'left');

      ws.getCell(`J${rowNum}`).value = totSem;
      styleDataCell(ws.getCell(`J${rowNum}`), isAlt, 'center', true);

      ws.getCell(`K${rowNum}`).value = totLap;
      styleDataCell(ws.getCell(`K${rowNum}`), isAlt, 'center');

      rowNum++;
    });

    if (docs.length === 0) {
      ws.mergeCells(`A8:K8`);
      ws.getCell('A8').value = 'No hay docentes registrados para esta sede.';
      ws.getCell('A8').alignment = { horizontal: 'center' };
    } else {
      // Subtotal de la Sede
      const totSedeSem = docs.reduce((acc, d) => acc + (d.materias || []).reduce((s, m) => s + (parseInt(m.horasSemanal) || 0), 0), 0);
      const totSedeLap = docs.reduce((acc, d) => acc + (d.materias || []).reduce((s, m) => s + (parseInt(m.horasLapso) || 0), 0), 0);

      ws.getCell(`A${rowNum}`).value = `TOTAL ${displayTitle.toUpperCase()}`;
      ws.mergeCells(`A${rowNum}:I${rowNum}`);
      styleDataCell(ws.getCell(`A${rowNum}`), false, 'right', true);

      ws.getCell(`J${rowNum}`).value = totSedeSem;
      styleDataCell(ws.getCell(`J${rowNum}`), false, 'center', true);

      ws.getCell(`K${rowNum}`).value = totSedeLap;
      styleDataCell(ws.getCell(`K${rowNum}`), false, 'center', true);
    }
  };

  // Generamos las 3 hojas de sedes
  generateSedeSheet('🏛️ Sede Rubio', 'Rubio', 'Sede Rubio (Central)');
  generateSedeSheet('🌿 Sede Sabana de Mendoza', 'Sabana de Mendoza', 'Extensión Sabana de Mendoza');
  generateSedeSheet('🌊 Sede Encontrados', 'Encontrados', 'Extensión Encontrados');

  // -------------------------------------------------------------
  // HOJA 5: CATÁLOGO DE ASIGNATURAS Y DEMANDA
  // -------------------------------------------------------------
  const wsMaterias = workbook.addWorksheet('📚 Catálogo y Demanda', { views: [{ showGridLines: true }] });
  wsMaterias.columns = [
    { width: 8 },  // #
    { width: 38 }, // Asignatura
    { width: 28 }, // Especialidad Destino
    { width: 14 }, // Total Horas
    { width: 14 }, // Docentes
    { width: 40 }, // Docentes Asignados
    { width: 30 }  // Sedes Donde se Imparte
  ];

  if (logoImageId !== null) {
    wsMaterias.addImage(logoImageId, {
      tl: { col: 0.1, row: 0.2 },
      ext: { width: 55, height: 55 }
    });
  }

  wsMaterias.mergeCells('B1:G1');
  const mcCountry = wsMaterias.getCell('B1');
  mcCountry.value = 'REPÚBLICA BOLIVARIANA DE VENEZUELA';
  mcCountry.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF008744' } };
  mcCountry.alignment = { horizontal: 'center', vertical: 'middle' };

  wsMaterias.mergeCells('B2:G2');
  const mcUniv = wsMaterias.getCell('B2');
  mcUniv.value = 'UNIVERSIDAD PEDAGÓGICA EXPERIMENTAL LIBERTADOR';
  mcUniv.font = { name: 'Calibri', size: 12, bold: true, color: { argb: COLOR_NAVY } };
  mcUniv.alignment = { horizontal: 'center', vertical: 'middle' };

  wsMaterias.mergeCells('B3:G3');
  const mcInst = wsMaterias.getCell('B3');
  mcInst.value = 'INSTITUTO PEDAGÓGICO RURAL "GERVASIO RUBIO" - SUBDIRECCIÓN DE DOCENCIA';
  mcInst.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLOR_GOLD } };
  mcInst.alignment = { horizontal: 'center', vertical: 'middle' };

  wsMaterias.mergeCells('B4:G4');
  const catTitle = wsMaterias.getCell('B4');
  catTitle.value = 'CATÁLOGO GENERAL DE ASIGNATURAS, DEMANDA Y DISTRIBUCIÓN TERRITORIAL';
  catTitle.font = { name: 'Calibri', size: 11, bold: true, color: { argb: COLOR_TEXT_DARK } };
  catTitle.alignment = { horizontal: 'center', vertical: 'middle' };

  const matHeaders = ['#', 'Nombre de la Asignatura', 'Especialidad Destino', 'Total Horas Sem', 'Docentes Asig.', 'Docentes que la Imparten', 'Sedes'];
  matHeaders.forEach((h, idx) => {
    const colLetter = String.fromCharCode(65 + idx);
    const cell = wsMaterias.getCell(`${colLetter}6`);
    cell.value = h;
    styleHeaderCell(cell, false);
  });

  // Mapear materias activas
  const matMap = {};
  staffList.forEach(d => {
    const sede = d.sedeCentro || 'Rubio';
    (d.materias || []).forEach(m => {
      const nombre = (m.nombre || '').trim();
      if (!nombre) return;
      if (!matMap[nombre]) {
        matMap[nombre] = {
          nombre,
          especialidad: m.especialidadDestino || 'General',
          totalHoras: 0,
          docentes: new Set(),
          sedes: new Set()
        };
      }
      matMap[nombre].totalHoras += (parseInt(m.horasSemanal) || 0);
      matMap[nombre].docentes.add(`${d.apellidos || ''} ${d.nombres || ''}`.trim());
      matMap[nombre].sedes.add(sede);
    });
  });

  // Incluir materias del catálogo no asignadas
  materiasCatalogo.forEach(m => {
    const nombre = typeof m === 'string' ? m.trim() : (m.nombre || '').trim();
    if (nombre && !matMap[nombre]) {
      matMap[nombre] = {
        nombre,
        especialidad: 'Sin Carga Asignada',
        totalHoras: 0,
        docentes: new Set(),
        sedes: new Set(['Sin Asignar'])
      };
    }
  });

  const sortedMaterias = Object.values(matMap).sort((a, b) => b.totalHoras - a.totalHoras);
  let matRow = 7;
  sortedMaterias.forEach((m, idx) => {
    const isAlt = idx % 2 === 1;

    wsMaterias.getCell(`A${matRow}`).value = idx + 1;
    styleDataCell(wsMaterias.getCell(`A${matRow}`), isAlt, 'center');

    wsMaterias.getCell(`B${matRow}`).value = m.nombre;
    styleDataCell(wsMaterias.getCell(`B${matRow}`), isAlt, 'left', true);

    wsMaterias.getCell(`C${matRow}`).value = m.especialidad;
    styleDataCell(wsMaterias.getCell(`C${matRow}`), isAlt, 'left');

    wsMaterias.getCell(`D${matRow}`).value = m.totalHoras;
    styleDataCell(wsMaterias.getCell(`D${matRow}`), isAlt, 'center', true);

    wsMaterias.getCell(`E${matRow}`).value = m.docentes.size;
    styleDataCell(wsMaterias.getCell(`E${matRow}`), isAlt, 'center');

    wsMaterias.getCell(`F${matRow}`).value = Array.from(m.docentes).join(', ') || 'Ninguno';
    styleDataCell(wsMaterias.getCell(`F${matRow}`), isAlt, 'left');

    wsMaterias.getCell(`G${matRow}`).value = Array.from(m.sedes).join(', ');
    styleDataCell(wsMaterias.getCell(`G${matRow}`), isAlt, 'center');

    matRow++;
  });

  // -------------------------------------------------------------
  // HOJA 7: BASE DE DATOS MAESTRA CON TABLA OFICIAL EXCEL
  // -------------------------------------------------------------
  const wsMaster = workbook.addWorksheet('📋 Base de Datos Maestra', {
    views: [{ showGridLines: true }]
  });

  wsMaster.columns = [
    { width: 14 }, // Cédula
    { width: 32 }, // Apellidos y Nombres
    { width: 25 }, // Departamento
    { width: 22 }, // Sede / Centro
    { width: 16 }, // Categoría
    { width: 22 }, // Dedicación
    { width: 14 }, // Estatus
    { width: 14 }, // Cant. Materias
    { width: 16 }, // Horas Semanales
    { width: 16 }, // Horas Lapso
    { width: 28 }, // Correo Institucional
    { width: 16 }  // Teléfono
  ];

  if (logoImageId !== null) {
    wsMaster.addImage(logoImageId, {
      tl: { col: 0.1, row: 0.2 },
      ext: { width: 55, height: 55 }
    });
  }

  wsMaster.mergeCells('B1:L1');
  const mastC = wsMaster.getCell('B1');
  mastC.value = 'REPÚBLICA BOLIVARIANA DE VENEZUELA';
  mastC.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF008744' } };
  mastC.alignment = { horizontal: 'center', vertical: 'middle' };

  wsMaster.mergeCells('B2:L2');
  const mastU = wsMaster.getCell('B2');
  mastU.value = 'UNIVERSIDAD PEDAGÓGICA EXPERIMENTAL LIBERTADOR - SUBDIRECCIÓN DE DOCENCIA';
  mastU.font = { name: 'Calibri', size: 12, bold: true, color: { argb: COLOR_NAVY } };
  mastU.alignment = { horizontal: 'center', vertical: 'middle' };

  wsMaster.mergeCells('B3:L3');
  const mastT = wsMaster.getCell('B3');
  mastT.value = 'MATRIZ MAESTRA OFICIAL DE TALENTO HUMANO (TABLA ESTRUCTURADA PARA TABLAS DINÁMICAS)';
  mastT.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLOR_TEXT_DARK } };
  mastT.alignment = { horizontal: 'center', vertical: 'middle' };

  wsMaster.mergeCells('A5:L5');
  const tipCell = wsMaster.getCell('A5');
  tipCell.value = '💡 TABLA ESTRUCTURADA OFICIAL DE EXCEL: Esta tabla "TablaDocentesUPEL" posee filtros automáticos en cada columna. En Microsoft Excel puedes usar los botones de filtro o pulsar en el menú superior: Insertar > Tabla Dinámica para generar tus propios cruces personalizados.';
  tipCell.font = { name: 'Calibri', size: 9, italic: true, bold: true, color: { argb: COLOR_NAVY } };
  tipCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } };
  tipCell.alignment = { horizontal: 'left', vertical: 'middle' };

  // Ordenar lista maestra por Cédula Numérica
  const sortedMaster = [...staffList].sort((a, b) => {
    const ciA = parseInt(String(a.cedula || '').replace(/\D/g, '')) || 0;
    const ciB = parseInt(String(b.cedula || '').replace(/\D/g, '')) || 0;
    if (ciA !== ciB) return ciA - ciB;
    const nameA = `${a.apellidos || ''} ${a.nombres || ''}`.trim();
    const nameB = `${b.apellidos || ''} ${b.nombres || ''}`.trim();
    return nameA.localeCompare(nameB, 'es', { sensitivity: 'base' });
  });

  const masterRows = sortedMaster.map(d => {
    const totSem = (d.materias || []).reduce((sum, m) => sum + (parseInt(m.horasSemanal) || 0), 0);
    const totLap = (d.materias || []).reduce((sum, m) => sum + (parseInt(m.horasLapso) || 0), 0);
    const matCount = (d.materias || []).length;
    return [
      d.cedula || 'S/C',
      `${d.apellidos || ''}, ${d.nombres || ''}`.trim(),
      d.rif || 'N/A',
      d.banco || 'N/A',
      d.tipoCuenta || 'Ahorro',
      d.cuentaBancaria ? String(d.cuentaBancaria) : 'N/A',
      normalizeDepartmentName(d.department) || 'N/A',
      d.sedeCentro || 'Rubio',
      d.especialidad || 'N/A',
      d.categoriaDocente || 'Instructor',
      d.dedicacion || 'Tiempo Convencional',
      d.status || 'Activo',
      matCount,
      totSem,
      totLap,
      d.correo || 'N/A',
      d.correoInstitucional || 'N/A',
      d.telefonos || 'N/A'
    ];
  });

  const finalMasterRows = masterRows.length > 0 ? masterRows : [
    ['V-00000000', 'Sin docentes registrados', 'N/A', 'N/A', 'Ahorro', 'N/A', 'General', 'Rubio', 'N/A', 'Instructor', 'Tiempo Convencional', 'Activo', 0, 0, 0, 'N/A', 'N/A', 'N/A']
  ];

  wsMaster.addTable({
    name: 'TablaDocentesUPEL',
    ref: 'A7',
    headerRow: true,
    totalsRow: true,
    style: {
      theme: 'TableStyleMedium9',
      showRowStripes: true,
    },
    columns: [
      { name: 'Cédula', filterButton: true },
      { name: 'Apellidos y Nombres', filterButton: true },
      { name: 'RIF', filterButton: true },
      { name: 'Banco', filterButton: true },
      { name: 'Tipo Cuenta', filterButton: true },
      { name: 'Nº Cuenta Bancaria', filterButton: true },
      { name: 'Departamento', filterButton: true },
      { name: 'Sede / Centro', filterButton: true },
      { name: 'Especialidad', filterButton: true },
      { name: 'Categoría', filterButton: true },
      { name: 'Dedicación', filterButton: true },
      { name: 'Estatus', filterButton: true },
      { name: 'Cant. Materias', filterButton: true, totalsRowFunction: 'sum' },
      { name: 'Horas Semanales', filterButton: true, totalsRowFunction: 'sum' },
      { name: 'Horas Lapso', filterButton: true, totalsRowFunction: 'sum' },
      { name: 'Correo Personal', filterButton: true },
      { name: 'Correo Institucional', filterButton: true },
      { name: 'Teléfono', filterButton: true }
    ],
    rows: finalMasterRows
  });

  // Asegurar formato de texto para cuenta bancaria en la columna F
  wsMaster.getColumn('F').numFmt = '@';

  // Generar Buffer y Disparar Descarga en el Navegador
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toISOString().slice(0, 10);
  const safePeriodo = String(periodName || 'General').replace(/[^a-zA-Z0-9_-]/g, '_');
  a.download = `UPEL_SIGOA_Matriz_Distributiva_${safePeriodo}_${dateStr}.xlsx`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);

  return true;
};

/**
 * Exportador Individual de la Ficha del Docente para Excel
 * Genera un archivo Excel profesional de la ficha completa del docente con membrete,
 * datos personales, fiscales (RIF), bancarios (Banco, Tipo, Cuenta 20 dígitos), 
 * académicos y tabla detallada de oferta académica.
 */
export const exportSingleDocenteFichaExcel = async (docente, user = null) => {
  if (!docente) return false;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'UPEL SIGOA - Unidad de Talento Humano';
  workbook.lastModifiedBy = user?.name || 'Auditor Talento Humano';
  workbook.created = new Date();
  workbook.modified = new Date();

  let logoImageId = null;
  try {
    const res = await fetch('/logo.png');
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      logoImageId = workbook.addImage({ buffer, extension: 'png' });
    } else {
      const resJpg = await fetch('/logo.jpg');
      if (resJpg.ok) {
        const buffer = await resJpg.arrayBuffer();
        logoImageId = workbook.addImage({ buffer, extension: 'jpeg' });
      }
    }
  } catch (e) {}

  const COLOR_NAVY = 'FF003366';
  const COLOR_GOLD = 'FFD97706';
  const COLOR_ROW_ALT = 'FFF8FAFC';
  const COLOR_BORDER = 'FFCBD5E1';

  const ws = workbook.addWorksheet('Ficha_Docente', { views: [{ showGridLines: true }] });

  ws.columns = [
    { width: 4 },  // A Margen
    { width: 22 }, // B Clave 1
    { width: 28 }, // C Valor 1
    { width: 22 }, // D Clave 2
    { width: 28 }, // E Valor 2
    { width: 14 }, // F
    { width: 14 }  // G
  ];

  if (logoImageId !== null) {
    ws.addImage(logoImageId, {
      tl: { col: 0.1, row: 0.2 },
      ext: { width: 65, height: 65 }
    });
  }

  // Membrete
  ws.mergeCells('B1:G1');
  const c1 = ws.getCell('B1');
  c1.value = 'REPÚBLICA BOLIVARIANA DE VENEZUELA';
  c1.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF008744' } };
  c1.alignment = { horizontal: 'center', vertical: 'middle' };

  ws.mergeCells('B2:G2');
  const c2 = ws.getCell('B2');
  c2.value = 'UNIVERSIDAD PEDAGÓGICA EXPERIMENTAL LIBERTADOR';
  c2.font = { name: 'Calibri', size: 12, bold: true, color: { argb: COLOR_NAVY } };
  c2.alignment = { horizontal: 'center', vertical: 'middle' };

  ws.mergeCells('B3:G3');
  const c3 = ws.getCell('B3');
  c3.value = 'INSTITUTO PEDAGÓGICO RURAL "GERVASIO RUBIO" • UNIDAD DE TALENTO HUMANO';
  c3.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLOR_GOLD } };
  c3.alignment = { horizontal: 'center', vertical: 'middle' };

  ws.mergeCells('B4:G4');
  const c4 = ws.getCell('B4');
  c4.value = 'FICHA OFERTA ACADÉMICA Y DATOS CONTRACTUALES - DOCENTE CONTRATADO';
  c4.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF1E293B' } };
  c4.alignment = { horizontal: 'center', vertical: 'middle' };

  let r = 6;

  const styleSecHeader = (title) => {
    ws.mergeCells(`B${r}:G${r}`);
    const cell = ws.getCell(`B${r}`);
    cell.value = title;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_NAVY } };
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
    r++;
  };

  const addKeyValueRow = (k1, v1, k2, v2, isBank = false) => {
    ws.getCell(`B${r}`).value = k1;
    ws.getCell(`B${r}`).font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF334155' } };
    ws.getCell(`B${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    ws.getCell(`B${r}`).border = { top: { style: 'thin', color: { argb: COLOR_BORDER } }, bottom: { style: 'thin', color: { argb: COLOR_BORDER } }, left: { style: 'thin', color: { argb: COLOR_BORDER } }, right: { style: 'thin', color: { argb: COLOR_BORDER } } };

    const cellV1 = ws.getCell(`C${r}`);
    cellV1.value = v1 || 'N/A';
    cellV1.font = { name: 'Calibri', size: 9, color: { argb: 'FF0F172A' } };
    cellV1.border = { top: { style: 'thin', color: { argb: COLOR_BORDER } }, bottom: { style: 'thin', color: { argb: COLOR_BORDER } }, left: { style: 'thin', color: { argb: COLOR_BORDER } }, right: { style: 'thin', color: { argb: COLOR_BORDER } } };

    ws.getCell(`D${r}`).value = k2;
    ws.getCell(`D${r}`).font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF334155' } };
    ws.getCell(`D${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    ws.getCell(`D${r}`).border = { top: { style: 'thin', color: { argb: COLOR_BORDER } }, bottom: { style: 'thin', color: { argb: COLOR_BORDER } }, left: { style: 'thin', color: { argb: COLOR_BORDER } }, right: { style: 'thin', color: { argb: COLOR_BORDER } } };

    ws.mergeCells(`E${r}:G${r}`);
    const cellV2 = ws.getCell(`E${r}`);
    if (isBank) {
      cellV2.numFmt = '@';
      cellV2.value = String(v2 || 'N/A');
    } else {
      cellV2.value = v2 || 'N/A';
    }
    cellV2.font = { name: 'Calibri', size: 9, color: { argb: 'FF0F172A' }, bold: isBank };
    cellV2.border = { top: { style: 'thin', color: { argb: COLOR_BORDER } }, bottom: { style: 'thin', color: { argb: COLOR_BORDER } }, left: { style: 'thin', color: { argb: COLOR_BORDER } }, right: { style: 'thin', color: { argb: COLOR_BORDER } } };

    r++;
  };

  // 1. Datos Institucionales y Período
  styleSecHeader('1. PERÍODO ACADÉMICO Y ADSCRIPCIÓN INSTITUCIONAL');
  addKeyValueRow('Período Académico:', `${docente.periodoAcademico || '2026-I'} (${docente.semanas || 15} semanas)`, 'Estatus Contrato:', docente.status || 'Activo');
  addKeyValueRow('Vigencia Lapso:', `Desde: ${docente.fechaDesde || '13/04/2026'} Hasta: ${docente.fechaHasta || '02/10/2026'}`, 'Departamento(s):', docente.department || 'N/A');
  addKeyValueRow('Centro de Atención / Sede:', docente.sedeCentro || 'Rubio', 'Especialidad:', docente.especialidad || 'N/A');
  r++;

  // 2. Información Personal y Fiscal
  styleSecHeader('2. INFORMACIÓN PERSONAL Y FISCAL');
  addKeyValueRow('Cédula de Identidad:', docente.cedula || 'N/A', 'RIF Personal:', docente.rif || 'No registrado');
  addKeyValueRow('Apellidos y Nombres:', `${docente.apellidos || ''}, ${docente.nombres || ''}`.trim(), 'Fecha de Nacimiento:', docente.fechaNac || 'No registrada');
  addKeyValueRow('Teléfono(s):', docente.telefonos || 'No registrado', 'Correo Personal:', docente.correo || 'No registrado');
  addKeyValueRow('Correo Institucional:', docente.correoInstitucional || 'No asignado', 'Dirección de Habitación:', docente.direccion || 'No registrada');
  r++;

  // 3. Datos Bancarios
  styleSecHeader('3. DATOS BANCARIOS (ACREDITACIÓN DE HONORARIOS / NÓMINA)');
  const estatusBanco = (docente.banco && docente.cuentaBancaria) ? 'Completo y Validado' : 'Incompleto (Requiere Registro)';
  addKeyValueRow('Entidad Bancaria:', docente.banco || 'Sin Banco Registrado', 'Tipo de Cuenta:', docente.tipoCuenta || 'Ahorro');
  addKeyValueRow('Estatus Bancario:', estatusBanco, 'Nº Cuenta Bancaria (20 Dig):', docente.cuentaBancaria ? String(docente.cuentaBancaria) : 'Sin Cuenta Registrada', true);
  r++;

  // 4. Perfil Académico y Escalafón
  styleSecHeader('4. PERFIL ACADÉMICO Y ESCALAFÓN');
  addKeyValueRow('Título de Pregrado:', docente.titulosPregrado || 'No registrado', 'Título de Postgrado:', docente.titulosPostgrado || 'N/A');
  addKeyValueRow('Doctorado / Ph.D.:', docente.doctorado || 'N/A', 'Categoría Docente:', docente.categoriaDocente || 'Instructor');
  addKeyValueRow('Dedicación Laboral:', docente.dedicacion || 'Tiempo Convencional', 'Horas Semanales Asignadas:', (docente.materias || []).reduce((s, m) => s + (parseInt(m.horasSemanal) || 0), 0) + ' hrs/sem');
  r++;

  // 5. Asignaturas y Carga Académica
  styleSecHeader('5. ASIGNACIÓN ACADÉMICA DETALLADA');
  
  const subCols = [
    { label: 'N°', col: 'B' },
    { label: 'Asignatura / Unidad Curricular', col: 'C' },
    { label: 'Especialidad', col: 'D' },
    { label: 'Sec / Cohorte', col: 'E' },
    { label: 'Cupos/Insc', col: 'F' },
    { label: 'H. Sem', col: 'G' }
  ];
  subCols.forEach(sc => {
    const c = ws.getCell(`${sc.col}${r}`);
    c.value = sc.label;
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } };
    c.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FFFFFFFF' } };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
    c.border = { top: { style: 'thin', color: { argb: COLOR_BORDER } }, bottom: { style: 'thin', color: { argb: COLOR_BORDER } }, left: { style: 'thin', color: { argb: COLOR_BORDER } }, right: { style: 'thin', color: { argb: COLOR_BORDER } } };
  });
  r++;

  const mats = docente.materias || [];
  let totSem = 0;
  let totLap = 0;

  if (mats.length === 0) {
    ws.mergeCells(`B${r}:G${r}`);
    const noMatCell = ws.getCell(`B${r}`);
    noMatCell.value = 'Sin materias asignadas para este lapso.';
    noMatCell.font = { italic: true, size: 9, color: { argb: 'FF64748B' } };
    noMatCell.alignment = { horizontal: 'center', vertical: 'middle' };
    r++;
  } else {
    mats.forEach((m, idx) => {
      const isAlt = idx % 2 === 1;
      const sem = parseInt(m.horasSemanal) || 0;
      const lap = parseInt(m.horasLapso) || 0;
      totSem += sem;
      totLap += lap;

      const fillObj = isAlt ? { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_ROW_ALT } } : undefined;

      const setMatCell = (col, val, align = 'left', bold = false) => {
        const cell = ws.getCell(`${col}${r}`);
        cell.value = val;
        if (fillObj) cell.fill = fillObj;
        cell.font = { name: 'Calibri', size: 9, bold, color: { argb: 'FF0F172A' } };
        cell.alignment = { horizontal: align, vertical: 'middle' };
        cell.border = { top: { style: 'thin', color: { argb: COLOR_BORDER } }, bottom: { style: 'thin', color: { argb: COLOR_BORDER } }, left: { style: 'thin', color: { argb: COLOR_BORDER } }, right: { style: 'thin', color: { argb: COLOR_BORDER } } };
      };

      setMatCell('B', idx + 1, 'center');
      setMatCell('C', m.nombre || 'N/A', 'left', true);
      setMatCell('D', m.especialidadDestino || docente.especialidad || 'General', 'center');
      const baseSec = m.seccion || m.secciones || '';
      const secVal = [baseSec, m.cohorte ? `(Coh: ${m.cohorte})` : ''].filter(Boolean).join(' ') || '-';
      const cupVal = (m.cupos !== undefined && m.cupos !== null && m.cupos !== '') ? m.cupos : '-';
      const insVal = (m.inscritos !== undefined && m.inscritos !== null && m.inscritos !== '') ? m.inscritos : '-';
      setMatCell('E', secVal, 'center');
      setMatCell('F', `${cupVal}/${insVal}`, 'center');
      setMatCell('G', sem, 'center', true);
      r++;
    });

    // Fila Total Materias
    ws.getCell(`B${r}`).value = '';
    ws.mergeCells(`C${r}:F${r}`);
    const totLbl = ws.getCell(`C${r}`);
    totLbl.value = 'TOTAL HORAS SEMANALES ASIGNADAS:';
    totLbl.font = { name: 'Calibri', size: 9, bold: true, color: { argb: COLOR_NAVY } };
    totLbl.alignment = { horizontal: 'right', vertical: 'middle' };

    const totVal = ws.getCell(`G${r}`);
    totVal.value = totSem;
    totVal.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLOR_GOLD } };
    totVal.alignment = { horizontal: 'center', vertical: 'middle' };
    totVal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF3C7' } };
    totVal.border = { top: { style: 'medium', color: { argb: COLOR_GOLD } }, bottom: { style: 'medium', color: { argb: COLOR_GOLD } }, left: { style: 'thin', color: { argb: COLOR_BORDER } }, right: { style: 'thin', color: { argb: COLOR_BORDER } } };
    r += 2;
  }

  // Pie de Página / Metadatos de Auditoría
  ws.mergeCells(`B${r}:G${r}`);
  const foot = ws.getCell(`B${r}`);
  foot.value = `Documento emitido para fines de Auditoría y Talento Humano UPEL • Generado por: ${user?.name || 'Auditor'} (${user?.role || 'AUDITOR'}) • Fecha: ${new Date().toLocaleString('es-VE')}`;
  foot.font = { name: 'Calibri', size: 8, italic: true, color: { argb: 'FF64748B' } };
  foot.alignment = { horizontal: 'center', vertical: 'middle' };

  // Guardar archivo
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeCedula = String(docente.cedula || 'docente').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeNombre = String(docente.nombres || '').replace(/[^a-zA-Z0-9_-]/g, '_');
  a.download = `UPEL_Ficha_Docente_${safeCedula}_${safeNombre}.xlsx`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);

  return true;
};

/**
 * Exportador Integral para Auditoría y Talento Humano UPEL
 * Genera un archivo Excel multipestaña con la totalidad de los datos de la ficha
 * de los docentes (personales, RIF, bancarios con número de cuenta a 20 dígitos en formato texto,
 * académicos, dedicación, horas y detalle de asignaturas).
 */
export const exportAuditorFichasCompletasExcel = async ({ staffList = [], user = null, periodName = 'Todos', departmentName = 'Todos', sedeName = 'Todas' }) => {
  // Filtrar estrictamente:
  // 1. Descartar docentes sin materias asignadas.
  // 2. Descartar docentes con estatus 'Por Revisar' (carga promovida pendiente de validación en lapso activo).
  // 3. En lapso activo: solo incluir docentes formalmente validados (status 'Validado' o 'Activo').
  // 4. En lapso cerrado/culminado: incluir los docentes con carga académica histórica de ese lapso culminado.
  const validStaffList = staffList.filter(d => {
    if (d.status === 'Por Revisar') return false;
    const hasMaterias = Array.isArray(d.materias) && d.materias.length > 0;
    if (!hasMaterias) return false;

    // Si es un lapso cerrado o registro histórico culminado
    if (d.status === 'Cerrado') return true;
    if (periodName && periodName !== 'Todos' && periodName !== '2026-II') {
      return true;
    }

    // En lapso activo: solo docentes con carga formalmente validada o activa
    const isValidado = d.status === 'Validado' || d.status === 'Activo';
    return isValidado;
  });
  staffList = validStaffList;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'UPEL SIGOA - Auditoría y Talento Humano';
  workbook.lastModifiedBy = user?.name || 'Auditor';
  workbook.created = new Date();
  workbook.modified = new Date();

  let logoImageId = null;
  try {
    const res = await fetch('/logo.png');
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      logoImageId = workbook.addImage({ buffer, extension: 'png' });
    } else {
      const resJpg = await fetch('/logo.jpg');
      if (resJpg.ok) {
        const buffer = await resJpg.arrayBuffer();
        logoImageId = workbook.addImage({ buffer, extension: 'jpeg' });
      }
    }
  } catch (e) {}

  const COLOR_NAVY = 'FF003366';
  const COLOR_GOLD = 'FFD97706';

  // -------------------------------------------------------------
  // HOJA 1: MATRIZ COMPLETA DE FICHAS DOCENTES
  // -------------------------------------------------------------
  const wsFull = workbook.addWorksheet('📋 Fichas Completas Docentes', { views: [{ showGridLines: true }] });
  
  wsFull.columns = [
    { width: 6 },  // N°
    { width: 14 }, // Cédula
    { width: 22 }, // Apellidos
    { width: 22 }, // Nombres
    { width: 15 }, // RIF
    { width: 26 }, // Banco
    { width: 14 }, // Tipo Cuenta
    { width: 24 }, // Cuenta Bancaria
    { width: 14 }, // Estatus Bancario
    { width: 15 }, // Teléfono
    { width: 26 }, // Correo Personal
    { width: 28 }, // Correo Institucional
    { width: 32 }, // Dirección
    { width: 14 }, // Fecha Nac
    { width: 26 }, // Pregrado
    { width: 26 }, // Postgrado
    { width: 22 }, // Doctorado
    { width: 16 }, // Categoría
    { width: 20 }, // Dedicación
    { width: 24 }, // Departamento
    { width: 16 }, // Sede
    { width: 20 }, // Especialidad
    { width: 15 }, // Período
    { width: 10 }, // Semanas
    { width: 25 }, // Vigencia Lapso
    { width: 14 }, // Estatus
    { width: 10 }, // Cant Materias
    { width: 12 }, // Hrs Sem
    { width: 12 }, // Hrs Lapso
    { width: 45 }  // Materias Resumen
  ];

  if (logoImageId !== null) {
    wsFull.addImage(logoImageId, {
      tl: { col: 0.1, row: 0.2 },
      ext: { width: 55, height: 55 }
    });
  }

  wsFull.mergeCells('B1:M1');
  const t1 = wsFull.getCell('B1');
  t1.value = 'UNIVERSIDAD PEDAGÓGICA EXPERIMENTAL LIBERTADOR • INSTITUTO PEDAGÓGICO RURAL GERVASIO RUBIO';
  t1.font = { name: 'Calibri', size: 12, bold: true, color: { argb: COLOR_NAVY } };
  t1.alignment = { horizontal: 'left', vertical: 'middle' };

  wsFull.mergeCells('B2:M2');
  const t2 = wsFull.getCell('B2');
  t2.value = `INFORME INTEGRAL DE TALENTO HUMANO Y AUDITORÍA CONTRACTUAL • PERÍODO: ${periodName} • SEDE: ${sedeName} • DPTO: ${departmentName}`;
  t2.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLOR_GOLD } };
  t2.alignment = { horizontal: 'left', vertical: 'middle' };

  wsFull.mergeCells('B3:M3');
  const t3 = wsFull.getCell('B3');
  t3.value = `Generado por: ${user?.name || 'Auditor'} (${user?.role || 'AUDITOR'}) • Emisión: ${new Date().toLocaleString('es-VE')} • Total Docentes: ${staffList.length}`;
  t3.font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF64748B' } };
  t3.alignment = { horizontal: 'left', vertical: 'middle' };

  // Ordenar docentes estrictamente por cédula numérica (de menor a mayor)
  const sortedDocentes = [...staffList].sort((a, b) => {
    const ciA = parseInt(String(a.cedula || '').replace(/\D/g, '')) || 0;
    const ciB = parseInt(String(b.cedula || '').replace(/\D/g, '')) || 0;
    if (ciA !== ciB) return ciA - ciB;
    const nameA = `${a.apellidos || ''} ${a.nombres || ''}`.trim();
    const nameB = `${b.apellidos || ''} ${b.nombres || ''}`.trim();
    return nameA.localeCompare(nameB, 'es', { sensitivity: 'base' });
  });

  // Construir filas
  const fullRows = sortedDocentes.map((d, idx) => {
    const totSem = (d.materias || []).reduce((sum, m) => sum + (parseInt(m.horasSemanal) || 0), 0);
    const totLap = (d.materias || []).reduce((sum, m) => sum + (parseInt(m.horasLapso) || 0), 0);
    const matCount = (d.materias || []).length;
    const matSummary = (d.materias || []).map(m => {
      const sec = m.seccion || m.secciones || '';
      const cup = (m.cupos !== undefined && m.cupos !== null && m.cupos !== '') ? m.cupos : '';
      const ins = (m.inscritos !== undefined && m.inscritos !== null && m.inscritos !== '') ? m.inscritos : '';
      const coh = m.cohorte || '';
      const extra = [sec ? `Sec: ${sec}` : '', (cup !== '' || ins !== '') ? `Cup/Ins: ${cup || '-'}/${ins || '-'}` : '', coh ? `Coh: ${coh}` : ''].filter(Boolean).join(' | ');
      return `${m.nombre}${extra ? ` [${extra}]` : ''} (${m.horasSemanal || 0}h)`;
    }).join('; ');
    const tieneBanco = Boolean(d.banco && d.cuentaBancaria);

    return [
      idx + 1,
      d.cedula || 'S/C',
      d.apellidos || '',
      d.nombres || '',
      d.rif || 'N/A',
      d.banco || '⚠️ Sin Banco',
      d.tipoCuenta || 'Ahorro',
      d.cuentaBancaria ? String(d.cuentaBancaria) : '⚠️ Sin Cuenta',
      tieneBanco ? 'Completo' : 'Incompleto',
      d.telefonos || 'N/A',
      d.correo || 'N/A',
      d.correoInstitucional || 'N/A',
      d.direccion || 'N/A',
      d.fechaNac || 'N/A',
      d.titulosPregrado || 'N/A',
      d.titulosPostgrado || 'N/A',
      d.doctorado || 'N/A',
      d.categoriaDocente || 'Instructor',
      d.dedicacion || 'Tiempo Convencional',
      normalizeDepartmentName(d.department) || 'N/A',
      d.sedeCentro || 'Rubio',
      d.especialidad || 'N/A',
      d.periodoAcademico || (periodName !== 'Todos' ? periodName : '2026-II'),
      d.semanas || 15,
      (d.fechaDesde && d.fechaHasta) 
        ? `${formatFechaEspanol(d.fechaDesde)} al ${formatFechaEspanol(d.fechaHasta)}` 
        : (d.status === 'Cerrado' ? 'Lapso Culminado' : `${d.fechaDesde || '03/11/2026'} al ${d.fechaHasta || '20/02/2027'}`),
      d.status === 'Cerrado' 
        ? 'Culminado (Cerrado)' 
        : ((d.status === 'Validado' || d.status === 'Activo') ? 'Validado' : (d.status || 'Por Revisar')),
      matCount,
      totSem,
      totLap,
      matSummary || 'Sin asignaciones'
    ];
  });

  const finalFullRows = fullRows.length > 0 ? fullRows : [
    [1, 'V-00000000', 'Sin docentes', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 15, '', '', 0, 0, 0, '']
  ];

  wsFull.addTable({
    name: 'TablaFichasCompletasUPEL',
    ref: 'A5',
    headerRow: true,
    totalsRow: true,
    style: { theme: 'TableStyleMedium9', showRowStripes: true },
    columns: [
      { name: 'N°', filterButton: true },
      { name: 'Cédula', filterButton: true },
      { name: 'Apellidos', filterButton: true },
      { name: 'Nombres', filterButton: true },
      { name: 'RIF', filterButton: true },
      { name: 'Banco', filterButton: true },
      { name: 'Tipo Cuenta', filterButton: true },
      { name: 'Nº Cuenta Bancaria', filterButton: true },
      { name: 'Estatus Banco', filterButton: true },
      { name: 'Teléfono', filterButton: true },
      { name: 'Correo Personal', filterButton: true },
      { name: 'Correo Institucional', filterButton: true },
      { name: 'Dirección', filterButton: true },
      { name: 'Fecha Nacimiento', filterButton: true },
      { name: 'Pregrado', filterButton: true },
      { name: 'Postgrado', filterButton: true },
      { name: 'Doctorado', filterButton: true },
      { name: 'Categoría', filterButton: true },
      { name: 'Dedicación', filterButton: true },
      { name: 'Departamento', filterButton: true },
      { name: 'Sede / Centro', filterButton: true },
      { name: 'Especialidad', filterButton: true },
      { name: 'Período', filterButton: true },
      { name: 'Semanas', filterButton: true },
      { name: 'Vigencia Lapso', filterButton: true },
      { name: 'Estatus Contrato', filterButton: true },
      { name: 'Cant. Materias', filterButton: true, totalsRowFunction: 'sum' },
      { name: 'Horas Semanales', filterButton: true, totalsRowFunction: 'sum' },
      { name: 'Horas Lapso', filterButton: true, totalsRowFunction: 'sum' },
      { name: 'Materias Asignadas', filterButton: true }
    ],
    rows: finalFullRows
  });

  // Asegurar formato de texto en la columna de cuenta bancaria (columna H)
  wsFull.getColumn('H').numFmt = '@';

  // -------------------------------------------------------------
  // HOJA 2: RELACIÓN BANCARIA Y NÓMINA DE TALENTO HUMANO
  // -------------------------------------------------------------
  const wsBank = workbook.addWorksheet('💳 Relación Bancaria Nómina', { views: [{ showGridLines: true }] });
  wsBank.columns = [
    { width: 6 },  // N°
    { width: 14 }, // Cédula
    { width: 32 }, // Docente
    { width: 15 }, // RIF
    { width: 28 }, // Banco
    { width: 15 }, // Tipo Cuenta
    { width: 26 }, // Nº Cuenta Bancaria (20 Dig)
    { width: 24 }, // Departamento
    { width: 16 }, // Sede
    { width: 20 }, // Dedicación
    { width: 12 }, // Horas Sem
    { width: 16 }, // Teléfono
    { width: 15 }  // Estatus Cuenta
  ];

  wsBank.mergeCells('B1:J1');
  const b1 = wsBank.getCell('B1');
  b1.value = 'REPÚBLICA BOLIVARIANA DE VENEZUELA • UPEL IPR GERVASIO RUBIO';
  b1.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLOR_NAVY } };

  wsBank.mergeCells('B2:J2');
  const b2 = wsBank.getCell('B2');
  b2.value = 'RELACIÓN BANCARIA PARA ACREDITACIÓN DE HONORARIOS Y PAGOS DE NÓMINA';
  b2.font = { name: 'Calibri', size: 12, bold: true, color: { argb: COLOR_GOLD } };

  const bankRows = staffList.map((d, idx) => {
    const totSem = (d.materias || []).reduce((sum, m) => sum + (parseInt(m.horasSemanal) || 0), 0);
    const tieneBanco = Boolean(d.banco && d.cuentaBancaria);
    return [
      idx + 1,
      d.cedula || 'S/C',
      `${d.apellidos || ''}, ${d.nombres || ''}`.trim(),
      d.rif || 'N/A',
      d.banco || '⚠️ Sin Banco Asignado',
      d.tipoCuenta || 'Ahorro',
      d.cuentaBancaria ? String(d.cuentaBancaria) : '⚠️ Sin Cuenta Registrada',
      d.department || 'N/A',
      d.sedeCentro || 'Rubio',
      d.dedicacion || 'Tiempo Convencional',
      totSem,
      d.telefonos || 'N/A',
      tieneBanco ? 'Validado' : 'Pendiente'
    ];
  });

  wsBank.addTable({
    name: 'TablaRelacionBancariaUPEL',
    ref: 'A4',
    headerRow: true,
    totalsRow: true,
    style: { theme: 'TableStyleMedium2', showRowStripes: true },
    columns: [
      { name: 'N°', filterButton: true },
      { name: 'Cédula', filterButton: true },
      { name: 'Docente (Apellidos y Nombres)', filterButton: true },
      { name: 'RIF', filterButton: true },
      { name: 'Entidad Bancaria', filterButton: true },
      { name: 'Tipo Cuenta', filterButton: true },
      { name: 'Nº Cuenta Bancaria (20 Dígitos)', filterButton: true },
      { name: 'Departamento', filterButton: true },
      { name: 'Sede / Centro', filterButton: true },
      { name: 'Dedicación', filterButton: true },
      { name: 'Horas Semanales', filterButton: true, totalsRowFunction: 'sum' },
      { name: 'Teléfono', filterButton: true },
      { name: 'Estatus Cuenta', filterButton: true }
    ],
    rows: bankRows.length > 0 ? bankRows : [
      [1, 'V-00000000', 'Sin docentes', '', '', '', '', '', '', '', 0, '', '']
    ]
  });

  // Asegurar formato de texto en la columna de cuenta bancaria (columna G)
  wsBank.getColumn('G').numFmt = '@';

  // -------------------------------------------------------------
  // HOJA 3: CARGA ACADÉMICA Y ASIGNATURAS DETALLADAS
  // -------------------------------------------------------------
  const wsMats = workbook.addWorksheet('📚 Asignaturas y Cargas', { views: [{ showGridLines: true }] });
  wsMats.columns = [
    { width: 6 },  // N°
    { width: 14 }, // Cédula
    { width: 30 }, // Docente
    { width: 24 }, // Departamento
    { width: 16 }, // Sede
    { width: 35 }, // Asignatura
    { width: 22 }, // Especialidad Destino
    { width: 12 }, // Sección
    { width: 10 }, // Cupos
    { width: 10 }, // Inscritos
    { width: 12 }, // Cohorte
    { width: 12 }, // Horas Sem
    { width: 12 }  // Horas Lapso
  ];

  wsMats.mergeCells('B1:I1');
  const m1 = wsMats.getCell('B1');
  m1.value = 'UPEL IPR GERVASIO RUBIO • SUBDIRECCIÓN DE DOCENCIA Y TALENTO HUMANO';
  m1.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLOR_NAVY } };

  wsMats.mergeCells('B2:I2');
  const m2 = wsMats.getCell('B2');
  m2.value = 'DESGLOSE INDIVIDUAL DE UNIDADES CURRICULARES POR DOCENTE';
  m2.font = { name: 'Calibri', size: 12, bold: true, color: { argb: COLOR_GOLD } };

  const matDetailRows = [];
  let matIndex = 1;
  staffList.forEach(d => {
    (d.materias || []).forEach(m => {
      matDetailRows.push([
        matIndex++,
        d.cedula || 'S/C',
        `${d.apellidos || ''}, ${d.nombres || ''}`.trim(),
        d.department || 'N/A',
        d.sedeCentro || 'Rubio',
        m.nombre || 'N/A',
        m.especialidadDestino || d.especialidad || 'General',
        m.seccion || m.secciones || '-',
        (m.cupos !== undefined && m.cupos !== null && m.cupos !== '') ? m.cupos : '-',
        (m.inscritos !== undefined && m.inscritos !== null && m.inscritos !== '') ? m.inscritos : '-',
        (m.cohorte && m.cohorte !== d.periodoAcademico && m.cohorte !== '2026-I' && m.cohorte !== '2026-II') ? m.cohorte : '-',
        parseInt(m.horasSemanal) || 0,
        parseInt(m.horasLapso) || 0
      ]);
    });
  });

  wsMats.addTable({
    name: 'TablaDetalleMateriasUPEL',
    ref: 'A4',
    headerRow: true,
    totalsRow: true,
    style: { theme: 'TableStyleMedium4', showRowStripes: true },
    columns: [
      { name: 'N°', filterButton: true },
      { name: 'Cédula Docente', filterButton: true },
      { name: 'Docente (Apellidos y Nombres)', filterButton: true },
      { name: 'Departamento', filterButton: true },
      { name: 'Sede / Centro', filterButton: true },
      { name: 'Asignatura / Unidad Curricular', filterButton: true },
      { name: 'Especialidad Destino', filterButton: true },
      { name: 'Sección', filterButton: true },
      { name: 'Cupos', filterButton: true },
      { name: 'Inscritos', filterButton: true },
      { name: 'Cohorte', filterButton: true },
      { name: 'Horas Semanales', filterButton: true, totalsRowFunction: 'sum' },
      { name: 'Horas Lapso', filterButton: true, totalsRowFunction: 'sum' }
    ],
    rows: matDetailRows.length > 0 ? matDetailRows : [
      [1, 'V-00000000', 'Sin asignaciones', '', '', '', '', '', '', '', '', 0, 0]
    ]
  });

  // Disparar Descarga en el Navegador
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toISOString().slice(0, 10);
  const safePeriodo = String(periodName || 'General').replace(/[^a-zA-Z0-9_-]/g, '_');
  a.download = `UPEL_Auditoria_TalentoHumano_FichasDocentes_${safePeriodo}_${dateStr}.xlsx`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);

  return true;
};
