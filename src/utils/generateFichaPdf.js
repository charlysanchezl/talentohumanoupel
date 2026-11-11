import { getDocenteInstitutionalEmail } from './fichaEmailTemplate';

export const generateFichaPdf = async (staff, options = {}) => {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable')
  ]);
  const { jefeName = 'Jefe de Departamento', periodInfo = null } = options;
  const targetPeriodo = periodInfo?.nombre || staff.periodoAcademico || '2026-I';
  const targetSemanas = periodInfo?.semanas || staff.semanas || 15;
  const targetDesde = periodInfo?.fechaDesde || staff.fechaDesde || '13/04/2026';
  const targetHasta = periodInfo?.fechaHasta || staff.fechaHasta || '02/10/2026';

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter' // 215.9 x 279.4 mm
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // 1. Incrustar Logo UPEL si está disponible
  try {
    const logoResp = await fetch('/logo.jpg');
    if (logoResp.ok) {
      const blob = await logoResp.blob();
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
      doc.addImage(base64, 'JPEG', 14, 8, 20, 20);
    }
  } catch (e) {}

  // 2. Encabezado Institucional
  doc.setFont('times', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(0, 0, 0);
  doc.text('UNIVERSIDAD PEDAGÓGICA EXPERIMENTAL LIBERTADOR', pageWidth / 2, 13, { align: 'center' });
  doc.setFontSize(9.5);
  doc.text('INSTITUTO PEDAGÓGICO RURAL GERVASIO RUBIO', pageWidth / 2, 17.5, { align: 'center' });
  doc.setFontSize(9);
  doc.text('UNIDAD DE TALENTO HUMANO', pageWidth / 2, 21.5, { align: 'center' });
  doc.text('SECCIÓN APOYO TÉCNICO', pageWidth / 2, 25.5, { align: 'center' });
  
  doc.setFontSize(10.5);
  doc.text('FICHA OFERTA ACADÉMICA PREGRADO', pageWidth / 2, 30.5, { align: 'center' });
  doc.text('DOCENTE CONTRATADO', pageWidth / 2, 35, { align: 'center' });

  let currentY = 38;

  // 3. Tabla Lapso y Período
  autoTable(doc, {
    startY: currentY,
    theme: 'plain',
    styles: { font: 'times', fontSize: 8.5, cellPadding: 1.5, lineColor: [0, 0, 0], lineWidth: 0.2 },
    tableLineColor: [0, 0, 0],
    tableLineWidth: 0.2,
    body: [
      [
        { content: 'LAPSO:', styles: { fontStyle: 'bold', fillColor: [245, 245, 245], width: 20 } },
        { content: `Total Semanas: ${targetSemanas}`, styles: { width: 70 } },
        { content: 'PERIODO ACADÉMICO:', styles: { fontStyle: 'bold', fillColor: [245, 245, 245], width: 45 } },
        { content: targetPeriodo, styles: { width: 50 } }
      ],
      [
        { content: 'DEPARTAMENTO:', styles: { fontStyle: 'bold', fillColor: [245, 245, 245] } },
        { content: staff.department || 'General' },
        { content: 'VIGENCIA:', styles: { fontStyle: 'bold', fillColor: [245, 245, 245] } },
        { content: `Desde: ${targetDesde}  Hasta: ${targetHasta}` }
      ]
    ],
    margin: { left: 14, right: 14 }
  });

  currentY = doc.lastAutoTable.finalY + 3;

  // 4. Tabla Datos Personales
  const correoInst = staff.correoInstitucional || getDocenteInstitutionalEmail(staff);
  autoTable(doc, {
    startY: currentY,
    theme: 'plain',
    styles: { font: 'times', fontSize: 8.5, cellPadding: 1.5, lineColor: [0, 0, 0], lineWidth: 0.2 },
    tableLineColor: [0, 0, 0],
    tableLineWidth: 0.2,
    head: [
      [
        { 
          content: 'DATOS PERSONALES  (Información suministrada por el Docente)', 
          colSpan: 4, 
          styles: { fontStyle: 'bold', fillColor: [235, 235, 235] } 
        }
      ]
    ],
    body: [
      [
        { content: 'APELLIDOS:', styles: { fontStyle: 'bold', fillColor: [245, 245, 245], width: 25 } },
        { content: staff.apellidos || '', styles: { width: 65 } },
        { content: 'NOMBRES:', styles: { fontStyle: 'bold', fillColor: [245, 245, 245], width: 30 } },
        { content: staff.nombres || '', styles: { width: 65 } }
      ],
      [
        { content: 'C.I.:', styles: { fontStyle: 'bold', fillColor: [245, 245, 245] } },
        { content: staff.cedula || '' },
        { content: 'FECHA NAC.:', styles: { fontStyle: 'bold', fillColor: [245, 245, 245] } },
        { content: staff.fechaNac || 'N/A' }
      ],
      [
        { content: 'RIF:', styles: { fontStyle: 'bold', fillColor: [245, 245, 245] } },
        { content: staff.rif || 'N/A' },
        { content: 'TELÉFONOS:', styles: { fontStyle: 'bold', fillColor: [245, 245, 245] } },
        { content: staff.telefonos || 'N/A' }
      ],
      [
        { content: 'DIRECCIÓN:', styles: { fontStyle: 'bold', fillColor: [245, 245, 245] } },
        { content: staff.direccion || 'N/A', colSpan: 3 }
      ],
      [
        { content: 'CORREO:', styles: { fontStyle: 'bold', fillColor: [245, 245, 245] } },
        { content: staff.correo || 'N/A', colSpan: 3 }
      ],
      [
        { content: 'CTA. BANCARIA:', styles: { fontStyle: 'bold', fillColor: [245, 245, 245] } },
        { content: staff.cuentaBancaria || 'N/A' },
        { content: 'BANCO / TIPO:', styles: { fontStyle: 'bold', fillColor: [245, 245, 245] } },
        { content: `${staff.banco || 'N/A'} - ${staff.tipoCuenta || 'Ahorro'}` }
      ]
    ],
    margin: { left: 14, right: 14 }
  });

  currentY = doc.lastAutoTable.finalY + 3;

  // 5. Tabla Datos Académicos
  autoTable(doc, {
    startY: currentY,
    theme: 'plain',
    styles: { font: 'times', fontSize: 8.5, cellPadding: 1.5, lineColor: [0, 0, 0], lineWidth: 0.2 },
    tableLineColor: [0, 0, 0],
    tableLineWidth: 0.2,
    head: [
      [
        { 
          content: 'DATOS ACADÉMICOS', 
          colSpan: 4, 
          styles: { fontStyle: 'bold', fillColor: [235, 235, 235] } 
        }
      ]
    ],
    body: [
      [
        { content: 'TÍTULOS PREGRADO:', styles: { fontStyle: 'bold', fillColor: [245, 245, 245], width: 35 } },
        { content: staff.titulosPregrado || 'N/A', colSpan: 3 }
      ],
      [
        { content: 'TÍTULOS POSTGRADO:', styles: { fontStyle: 'bold', fillColor: [245, 245, 245] } },
        { content: staff.titulosPostgrado || 'N/A', colSpan: 3 }
      ],
      [
        { content: 'DOCTORADO:', styles: { fontStyle: 'bold', fillColor: [245, 245, 245] } },
        { content: staff.doctorado || 'N/A', colSpan: 3 }
      ],
      [
        { content: 'CATEGORÍA DOCENTE:', styles: { fontStyle: 'bold', fillColor: [245, 245, 245], width: 35 } },
        { content: staff.categoriaDocente || 'Instructor', styles: { width: 55 } },
        { content: 'DEDICACIÓN:', styles: { fontStyle: 'bold', fillColor: [245, 245, 245], width: 25 } },
        { content: staff.dedicacion || 'Tiempo Convencional', styles: { width: 70 } }
      ]
    ],
    margin: { left: 14, right: 14 }
  });

  currentY = doc.lastAutoTable.finalY + 3;

  // 6. Tabla Oferta Académica (Materias)
  const materias = Array.isArray(staff.materias) ? staff.materias : [];
  const totalHorasSemanal = materias.reduce((acc, m) => acc + (parseInt(m.horasSemanal) || 0), 0);
  const totalHorasLapso = materias.reduce((acc, m) => acc + (parseInt(m.horasLapso) || 0), 0);

  const materiasBody = materias.map((mat, i) => {
    const sec = mat.seccion || mat.secciones || 'U';
    const cup = (mat.cupos !== undefined && mat.cupos !== null && mat.cupos !== '') ? mat.cupos : 0;
    const ins = (mat.inscritos !== undefined && mat.inscritos !== null && mat.inscritos !== '') ? mat.inscritos : 0;
    const rawCoh = (mat.cohorte !== undefined && mat.cohorte !== null && String(mat.cohorte).trim() !== '')
      ? String(mat.cohorte).trim()
      : ((staff.cohorte !== undefined && staff.cohorte !== null && String(staff.cohorte).trim() !== '') ? String(staff.cohorte).trim() : '');
    const coh = rawCoh || '-';
    const extra = `Sec. ${sec} | Cup: ${cup} | Ins: ${ins}`;
    return [
      `0${i + 1}`,
      mat.nombre + ` (${extra})`,
      mat.especialidadDestino || 'General',
      coh,
      String(mat.horasSemanal || 0),
      String(mat.horasLapso || 0)
    ];
  });

  // Completar filas vacías para llenar el formato institucional
  const emptyRowsNeeded = Math.max(0, Math.min(2, 3 - materias.length));
  for (let i = 0; i < emptyRowsNeeded; i++) {
    materiasBody.push([`0${materias.length + i + 1}`, '', '', '', '', '']);
  }

  // Fila de Totales
  materiasBody.push([
    { content: 'TOTAL, HORAS LAPSO:', colSpan: 4, styles: { fontStyle: 'bold', halign: 'right' } },
    { content: String(totalHorasSemanal), styles: { fontStyle: 'bold', halign: 'center' } },
    { content: String(totalHorasLapso), styles: { fontStyle: 'bold', halign: 'center' } }
  ]);

  autoTable(doc, {
    startY: currentY,
    theme: 'plain',
    styles: { font: 'times', fontSize: 8, cellPadding: 1.3, lineColor: [0, 0, 0], lineWidth: 0.2 },
    tableLineColor: [0, 0, 0],
    tableLineWidth: 0.2,
    head: [
      [
        { 
          content: 'DATOS OFERTA ACADÉMICA  (Llenado y validado por la Jefatura de Departamento)', 
          colSpan: 6, 
          styles: { fontStyle: 'bold', fillColor: [235, 235, 235] } 
        }
      ],
      [
        { content: 'NRO', styles: { fontStyle: 'bold', halign: 'center', width: 10, fillColor: [245, 245, 245] } },
        { content: 'MATERIA - UNIDAD CURRICULAR', styles: { fontStyle: 'bold', width: 75, fillColor: [245, 245, 245] } },
        { content: 'ESPECIALIDAD', styles: { fontStyle: 'bold', halign: 'center', width: 36, fillColor: [245, 245, 245] } },
        { content: 'COHORTE', styles: { fontStyle: 'bold', halign: 'center', width: 22, fillColor: [245, 245, 245] } },
        { content: 'HORAS SEMANAL', styles: { fontStyle: 'bold', halign: 'center', width: 22, fillColor: [245, 245, 245] } },
        { content: 'HORAS LAPSO', styles: { fontStyle: 'bold', halign: 'center', width: 20, fillColor: [245, 245, 245] } }
      ]
    ],
    body: materiasBody,
    columnStyles: {
      0: { halign: 'center' },
      1: { halign: 'left' },
      2: { halign: 'center' },
      3: { halign: 'center', fontStyle: 'bold' },
      4: { halign: 'center' },
      5: { halign: 'center' }
    },
    margin: { left: 14, right: 14 }
  });

  // 7. Firmas ajustadas dinámicamente para mantenerse estrictamente en 1 hoja Carta (<= 252mm)
  const finalTableY = doc.lastAutoTable.finalY;
  const sigLineY = Math.min(250, Math.max(finalTableY + 8, Math.min(finalTableY + 14, 244)));

  // Línea Profesor
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.line(25, sigLineY, 85, sigLineY);
  doc.setFont('times', 'bold');
  doc.setFontSize(8.5);
  doc.text(`${staff.nombres} ${staff.apellidos}`, 55, sigLineY + 3.8, { align: 'center' });
  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  doc.text('PROFESOR', 55, sigLineY + 7.2, { align: 'center' });
  doc.setFontSize(7.2);
  doc.text('Nota: Doy fe de los datos suministrados.', 55, sigLineY + 10.2, { align: 'center' });

  // Línea Jefe de Dpto
  doc.line(130, sigLineY, 190, sigLineY);
  doc.setFont('times', 'bold');
  doc.setFontSize(8.5);
  doc.text(jefeName, 160, sigLineY + 3.8, { align: 'center' });
  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  doc.text(`Jefe de Departamento de ${staff.department}`, 160, sigLineY + 7.2, { align: 'center' });
  doc.setFontSize(7.2);
  doc.text('Ficha Validada en Sistema SIGOA', 160, sigLineY + 10.2, { align: 'center' });

  // Coletilla Anexo (después de las firmas, en negrita)
  doc.setFont('times', 'bold');
  doc.setFontSize(8);
  doc.text('ANEXO: CI, COPIA DE TITULOS', 14, Math.min(263, sigLineY + 14.5));

  // 8. Pie de Página y Lema institucional
  doc.setFont('times', 'italic');
  doc.setFontSize(7.5);
  doc.text('Final Avenida Dr Manuel Pulido Mendez Via Bramon Rubio - Estado Tachira', pageWidth / 2, 268, { align: 'center' });
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(9);
  doc.text('"La Universidad de los Maestros"', pageWidth / 2, 272.5, { align: 'center' });

  return {
    doc,
    pdfBase64: doc.output('datauristring')
  };
};
