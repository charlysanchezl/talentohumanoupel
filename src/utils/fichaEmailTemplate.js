/**
 * Generador de plantilla oficial de correo institucional para la Ficha de Oferta Académica
 * Universidad Pedagógica Experimental Libertador - Instituto Pedagógico Rural Gervasio Rubio
 */

export const getDocenteInstitutionalEmail = (staff) => {
  if (!staff) return '';
  if (staff.correoInstitucional && staff.correoInstitucional.trim()) {
    return staff.correoInstitucional.trim();
  }
  // Si el campo correo ya tiene dominio institucional @upel.edu.ve
  if (staff.correo && staff.correo.toLowerCase().includes('@upel.edu.ve')) {
    return staff.correo.trim();
  }
  // Si no, sugerir formato institucional estándar: v{cedula}@upel.edu.ve
  const cleanCi = staff.cedula ? String(staff.cedula).replace(/\D/g, '') : '';
  if (cleanCi) {
    return `v${cleanCi}@upel.edu.ve`;
  }
  return (staff.correo || '').trim();
};

export const generateFichaEmailHtml = (staff, options = {}) => {
  if (!staff) return '';

  const {
    jefeName = 'Jefe de Departamento',
    notaAdicional = '',
    baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'
  } = options;

  const materias = Array.isArray(staff.materias) ? staff.materias : [];
  const totalHorasSemanal = materias.reduce((acc, m) => acc + (parseInt(m.horasSemanal) || 0), 0);
  const totalHorasLapso = materias.reduce((acc, m) => acc + (parseInt(m.horasLapso) || 0), 0);
  const correoInst = staff.correoInstitucional || getDocenteInstitutionalEmail(staff);

  const materiasRowsHtml = materias.length > 0
    ? materias.map((mat, idx) => `
        <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
          <td style="border: 1px solid #cbd5e1; padding: 8px 10px; text-align: center; font-size: 13px; font-weight: bold; color: #475569;">0${idx + 1}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px 10px; font-size: 13px; font-weight: 600; color: #1e293b;">
            ${mat.nombre}
            ${mat.seccion ? `<span style="display: inline-block; background-color: #e0f2fe; color: #0369a1; font-size: 11px; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">Sec. ${mat.seccion}</span>` : ''}
            ${(() => {
              const c = mat.cohorte || staff.cohorte || '';
              return (c && c !== staff.periodoAcademico && c !== '2026-I' && c !== '2026-II') ? `<span style="display: inline-block; background-color: #fef3c7; color: #b45309; font-size: 11px; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">Cohorte: ${c}</span>` : '';
            })()}
          </td>
          <td style="border: 1px solid #cbd5e1; padding: 8px 10px; font-size: 12px; color: #475569; text-align: center;">${mat.especialidadDestino || 'General'}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px 10px; text-align: center; font-size: 13px; font-weight: bold; color: #003366;">${mat.horasSemanal || 0}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px 10px; text-align: center; font-size: 13px; font-weight: bold; color: #003366;">${mat.horasLapso || 0}</td>
        </tr>
      `).join('')
    : `
        <tr>
          <td colspan="5" style="border: 1px solid #cbd5e1; padding: 16px; text-align: center; color: #64748b; font-style: italic;">
            No se registran asignaturas asignadas para este período académico.
          </td>
        </tr>
      `;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ficha de Oferta Académica UPEL</title>
</head>
<body style="margin: 0; padding: 20px 0; background-color: #f1f5f9; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9;">
    <tr>
      <td align="center" style="padding: 10px;">
        
        <!-- Contenedor Principal de la Ficha -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 720px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 51, 102, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Cabecera Institucional UPEL -->
          <tr>
            <td style="background: linear-gradient(135deg, #002244 0%, #003366 50%, #004d80 100%); padding: 26px 20px; text-align: center; color: #ffffff;">
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #93c5fd; margin-bottom: 4px;">
                República Bolivariana de Venezuela
              </div>
              <div style="font-size: 17px; font-weight: 800; letter-spacing: 0.5px; margin-bottom: 2px;">
                UNIVERSIDAD PEDAGÓGICA EXPERIMENTAL LIBERTADOR
              </div>
              <div style="font-size: 14px; font-weight: 600; color: #e2e8f0; margin-bottom: 6px;">
                Instituto Pedagógico Rural "Gervasio Rubio"
              </div>
              <div style="font-size: 12px; color: #cbd5e1; font-weight: 500;">
                Subdirección de Docencia &bull; Unidad de Talento Humano
              </div>
              
              <div style="margin-top: 14px; display: inline-block; background-color: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 20px; padding: 6px 18px;">
                <span style="font-size: 13px; font-weight: 800; letter-spacing: 0.8px; color: #ffffff;">
                  FICHA OFICIAL DE OFERTA ACADÉMICA
                </span>
              </div>
            </td>
          </tr>

          <!-- Mensaje de Notificación al Docente -->
          <tr>
            <td style="padding: 24px 28px 12px 28px;">
              <p style="font-size: 15px; margin: 0 0 10px 0; color: #003366; font-weight: 700;">
                Estimado(a) Profesor(a) ${staff.nombres} ${staff.apellidos}:
              </p>
              <p style="font-size: 13px; line-height: 1.6; margin: 0 0 16px 0; color: #475569;">
                Le hacemos entrega de su <strong>Ficha de Oferta Académica</strong> correspondiente al período académico ordinario <strong>${staff.periodoAcademico || 'Vigente'}</strong> adscrito al Departamento de <strong>${staff.department}</strong>. A continuación encontrará el detalle completo validado por su Jefatura de Departamento.
              </p>

              ${notaAdicional ? `
                <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 10px 14px; border-radius: 4px; margin-bottom: 16px; font-size: 13px; color: #92400e;">
                  <strong>Observación de Jefatura:</strong> ${notaAdicional}
                </div>
              ` : ''}
            </td>
          </tr>

          <!-- Bloque de Período y Lapso -->
          <tr>
            <td style="padding: 0 28px 16px 28px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; font-size: 12px;">
                <tr>
                  <td style="padding: 8px 12px; width: 25%; font-weight: bold; color: #003366; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">PERÍODO:</td>
                  <td style="padding: 8px 12px; width: 25%; color: #1e293b; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${staff.periodoAcademico || '2026-I'}</td>
                  <td style="padding: 8px 12px; width: 25%; font-weight: bold; color: #003366; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">SEMANAS:</td>
                  <td style="padding: 8px 12px; width: 25%; color: #1e293b; border-bottom: 1px solid #e2e8f0;">${staff.semanas || 15} semanas</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; font-weight: bold; color: #003366; border-right: 1px solid #e2e8f0;">DEPARTAMENTO:</td>
                  <td style="padding: 8px 12px; color: #1e293b; border-right: 1px solid #e2e8f0; font-weight: 600;">${staff.department}</td>
                  <td style="padding: 8px 12px; font-weight: bold; color: #003366; border-right: 1px solid #e2e8f0;">VIGENCIA:</td>
                  <td style="padding: 8px 12px; color: #1e293b;">${staff.fechaDesde || '13/04/2026'} al ${staff.fechaHasta || '02/10/2026'}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Sección 1: Datos Personales -->
          <tr>
            <td style="padding: 0 28px 16px 28px;">
              <div style="background-color: #003366; color: #ffffff; padding: 6px 12px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; border-top-left-radius: 6px; border-top-right-radius: 6px;">
                I. DATOS PERSONALES DEL DOCENTE
              </div>
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid #cbd5e1; border-top: none; font-size: 12px; border-collapse: collapse;">
                <tr>
                  <td style="border: 1px solid #cbd5e1; padding: 6px 10px; width: 20%; font-weight: bold; background-color: #f8fafc;">APELLIDOS:</td>
                  <td style="border: 1px solid #cbd5e1; padding: 6px 10px; width: 30%;">${staff.apellidos}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 6px 10px; width: 20%; font-weight: bold; background-color: #f8fafc;">NOMBRES:</td>
                  <td style="border: 1px solid #cbd5e1; padding: 6px 10px; width: 30%;">${staff.nombres}</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: bold; background-color: #f8fafc;">C.I.:</td>
                  <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: 600;">${staff.cedula}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: bold; background-color: #f8fafc;">RIF:</td>
                  <td style="border: 1px solid #cbd5e1; padding: 6px 10px;">${staff.rif || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: bold; background-color: #f8fafc;">CORREO INST.:</td>
                  <td style="border: 1px solid #cbd5e1; padding: 6px 10px; color: #0369a1; font-weight: 600;">${correoInst || 'N/A'}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: bold; background-color: #f8fafc;">TELÉFONOS:</td>
                  <td style="border: 1px solid #cbd5e1; padding: 6px 10px;">${staff.telefonos || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: bold; background-color: #f8fafc;">DIRECCIÓN:</td>
                  <td colspan="3" style="border: 1px solid #cbd5e1; padding: 6px 10px;">${staff.direccion || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: bold; background-color: #f8fafc;">CTA. BANCARIA:</td>
                  <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-family: monospace;">${staff.cuentaBancaria || 'N/A'}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: bold; background-color: #f8fafc;">BANCO / TIPO:</td>
                  <td style="border: 1px solid #cbd5e1; padding: 6px 10px;">${staff.banco || 'N/A'} (${staff.tipoCuenta || 'N/A'})</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Sección 2: Perfil Académico -->
          <tr>
            <td style="padding: 0 28px 16px 28px;">
              <div style="background-color: #003366; color: #ffffff; padding: 6px 12px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; border-top-left-radius: 6px; border-top-right-radius: 6px;">
                II. PERFIL ACADÉMICO
              </div>
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid #cbd5e1; border-top: none; font-size: 12px; border-collapse: collapse;">
                <tr>
                  <td style="border: 1px solid #cbd5e1; padding: 6px 10px; width: 25%; font-weight: bold; background-color: #f8fafc;">TÍTULOS PREGRADO:</td>
                  <td style="border: 1px solid #cbd5e1; padding: 6px 10px; width: 75%;">${staff.titulosPregrado || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: bold; background-color: #f8fafc;">POSTGRADO / DOCTORADO:</td>
                  <td style="border: 1px solid #cbd5e1; padding: 6px 10px;">
                    ${[staff.titulosPostgrado, staff.doctorado].filter(Boolean).join(' &bull; ') || 'Ninguno registrado'}
                  </td>
                </tr>
                <tr>
                  <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: bold; background-color: #f8fafc;">CATEGORÍA Y DEDICACIÓN:</td>
                  <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: 600;">
                    ${staff.categoriaDocente || 'Instructor'} &bull; ${staff.dedicacion || 'Tiempo Convencional'} &bull; Sede: ${staff.sedeCentro || 'Rubio'}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Sección 3: Asignación de Carga Académica (Materias) -->
          <tr>
            <td style="padding: 0 28px 20px 28px;">
              <div style="background-color: #003366; color: #ffffff; padding: 6px 12px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; border-top-left-radius: 6px; border-top-right-radius: 6px;">
                III. UNIDADES CURRICULARES ASIGNADAS (OFERTA ACADÉMICA)
              </div>
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid #cbd5e1; border-top: none; font-size: 12px; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #f1f5f9; color: #003366;">
                    <th style="border: 1px solid #cbd5e1; padding: 8px; width: 8%; text-align: center;">N°</th>
                    <th style="border: 1px solid #cbd5e1; padding: 8px; width: 50%; text-align: left;">UNIDAD CURRICULAR / MATERIA</th>
                    <th style="border: 1px solid #cbd5e1; padding: 8px; width: 22%; text-align: center;">ESPECIALIDAD</th>
                    <th style="border: 1px solid #cbd5e1; padding: 8px; width: 10%; text-align: center;">H. SEM.</th>
                    <th style="border: 1px solid #cbd5e1; padding: 8px; width: 10%; text-align: center;">H. LAPSO</th>
                  </tr>
                </thead>
                <tbody>
                  ${materiasRowsHtml}
                </tbody>
                <tfoot>
                  <tr style="background-color: #e2e8f0; font-weight: bold; color: #002244;">
                    <td colspan="3" style="border: 1px solid #cbd5e1; padding: 8px 12px; text-align: right;">TOTAL HORAS ACADÉMICAS:</td>
                    <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; font-size: 13px;">${totalHorasSemanal}h</td>
                    <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; font-size: 13px;">${totalHorasLapso}h</td>
                  </tr>
                </tfoot>
              </table>
            </td>
          </tr>

          <!-- Firmas Institucionales -->
          <tr>
            <td style="padding: 10px 28px 24px 28px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 20px;">
                <tr>
                  <td style="width: 46%; text-align: center; vertical-align: top;">
                    <div style="border-bottom: 1px solid #000000; height: 35px; width: 80%; margin: 0 auto 6px auto;"></div>
                    <div style="font-size: 12px; font-weight: bold; color: #000000;">${staff.nombres} ${staff.apellidos}</div>
                    <div style="font-size: 11px; color: #475569;">DOCENTE CONTRATADO</div>
                    <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Doy fe de los datos suministrados</div>
                  </td>
                  <td style="width: 8%;"></td>
                  <td style="width: 46%; text-align: center; vertical-align: top;">
                    <div style="border-bottom: 1px solid #000000; height: 35px; width: 80%; margin: 0 auto 6px auto;"></div>
                    <div style="font-size: 12px; font-weight: bold; color: #000000;">${jefeName}</div>
                    <div style="font-size: 11px; color: #475569;">Jefe del Dpto. de ${staff.department}</div>
                    <div style="font-size: 10px; color: #16a34a; font-weight: 600; margin-top: 2px;">Carga Académica Validada en SIGOA</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Dirección y Lema Oficial -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 20px; text-align: center;">
              <div style="font-size: 11px; color: #64748b; margin-bottom: 4px; font-style: italic;">
                Final Avenida Dr. Manuel Pulido Méndez, Vía Bramón, Rubio &bull; Estado Táchira &bull; Venezuela
              </div>
              <div style="font-family: Georgia, 'Times New Roman', serif; font-style: italic; font-size: 14px; font-weight: bold; color: #003366; margin-bottom: 8px;">
                "La Universidad de los Maestros"
              </div>
              <div style="font-size: 10px; color: #94a3b8;">
                Documento emitido electrónicamente por el Sistema de Gestión Docente y Talento Humano UPEL (SIGOA). &bull; ${new Date().toLocaleDateString('es-VE')}
              </div>
            </td>
          </tr>

        </table>
        <!-- Fin Contenedor Principal -->

      </td>
    </tr>
  </table>

</body>
</html>
  `;
};

export const generateFichaEmailText = (staff, options = {}) => {
  if (!staff) return '';
  const { jefeName = 'Jefe de Departamento' } = options;
  const materias = Array.isArray(staff.materias) ? staff.materias : [];
  const totSem = materias.reduce((acc, m) => acc + (parseInt(m.horasSemanal) || 0), 0);
  const totLap = materias.reduce((acc, m) => acc + (parseInt(m.horasLapso) || 0), 0);

  let out = `🏛️ UNIVERSIDAD PEDAGÓGICA EXPERIMENTAL LIBERTADOR - IPRGR\n`;
  out += `SUBDIRECCIÓN DE DOCENCIA - UNIDAD DE TALENTO HUMANO\n`;
  out += `FICHA OFICIAL DE OFERTA ACADÉMICA PREGRADO\n`;
  out += `========================================================\n\n`;
  out += `Estimado(a) Profesor(a) ${staff.nombres} ${staff.apellidos} (C.I: ${staff.cedula}):\n\n`;
  out += `Le notificamos formalmente que su Ficha de Oferta Académica para el período ${staff.periodoAcademico || 'Vigente'} en el Departamento de ${staff.department} ha sido validada.\n\n`;
  out += `DATOS DEL PERÍODO:\n`;
  out += `- Período: ${staff.periodoAcademico || 'Actual'}\n`;
  out += `- Semanas: ${staff.semanas || 15} semanas\n`;
  out += `- Vigencia: ${staff.fechaDesde || 'N/A'} al ${staff.fechaHasta || 'N/A'}\n`;
  out += `- Sede/Centro: ${staff.sedeCentro || 'Rubio'}\n\n`;
  out += `ASIGNACIÓN DE MATERIAS:\n`;
  if (materias.length > 0) {
    materias.forEach((m, idx) => {
      out += ` ${idx + 1}. ${m.nombre} | Sec: ${m.seccion || '-'} | Destino: ${m.especialidadDestino || 'General'} | ${m.horasSemanal} hrs/sem (${m.horasLapso} hrs lapso)\n`;
    });
    out += `TOTAL HORAS: ${totSem} horas semanales / ${totLap} horas lapso.\n\n`;
  } else {
    out += ` (Sin materias registradas aún)\n\n`;
  }
  out += `Validado por: ${jefeName} (Jefatura de Departamento de ${staff.department})\n`;
  out += `"La Universidad de los Maestros"\n`;
  return out;
};
