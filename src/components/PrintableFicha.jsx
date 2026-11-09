import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getUsers, matchDepartment, getAcademicPeriodsList, isExpedienteCompleto, getMissingExpedienteFields } from '../data';
import SendFichaEmailModal from './SendFichaEmailModal';
import { Mail, Printer, ArrowLeft, ShieldAlert, Download } from 'lucide-react';
import { generateFichaPdf } from '../utils/generateFichaPdf';

const PrintableFicha = ({ staff, onBack }) => {
  const [jefeName, setJefeName] = useState('');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [activePeriod, setActivePeriod] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [printingPdf, setPrintingPdf] = useState(false);

  useEffect(() => {
    getAcademicPeriodsList()
      .then(periods => {
        if (periods && periods.length > 0) {
          const act = periods.find(p => p.estado === 'ACTIVO') || periods[0];
          if (act) setActivePeriod(act);
        }
      })
      .catch(e => console.error("Error fetching periods in PrintableFicha:", e));
  }, []);

  useEffect(() => {
    if (staff && staff.department) {
      getUsers()
        .then(users => {
          const jefes = users.filter(u => u.role === 'JEFE' && matchDepartment(u.department, staff.department));
          if (jefes.length > 0) {
            setJefeName(jefes.map(j => j.name).join(' / '));
          }
        })
        .catch(err => console.error("Error fetching jefe:", err));
    }
  }, [staff]);

  if (!staff) return null;

  const expedienteValido = isExpedienteCompleto(staff);
  const faltantes = !expedienteValido ? getMissingExpedienteFields(staff) : [];

  if (!expedienteValido) {
    return createPortal(
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.85)', zIndex: 99999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          maxWidth: '520px',
          width: '100%',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '1.5px solid #fecaca'
        }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
            <ShieldAlert size={34} color="#dc2626" />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#991b1b', marginBottom: '0.75rem' }}>
            Expediente Incompleto — Ficha Bloqueada
          </h3>
          <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: '1.55', marginBottom: '1.25rem' }}>
            Por normativa institucional de la Subdirección de Docencia y Talento Humano, no se puede emitir ni visualizar la Ficha de Oferta Académica del docente <strong>{staff.nombres} {staff.apellidos}</strong> hasta que complete los datos obligatorios de su expediente:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginBottom: '1.75rem' }}>
            {faltantes.map((f, idx) => (
              <span key={idx} style={{ background: '#fee2e2', color: '#b91c1c', fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', border: '1px solid #fca5a5' }}>
                • {f}
              </span>
            ))}
          </div>
          <button
            className="btn btn-primary"
            onClick={onBack}
            style={{ width: '100%', padding: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <ArrowLeft size={16} /> Volver para Actualizar Datos
          </button>
        </div>
      </div>,
      document.body
    );
  }

  const displayPeriodo = staff.periodoAcademico || activePeriod?.nombre || '2026-I';
  const displaySemanas = staff.semanas || activePeriod?.semanas || 15;
  const displayFechaDesde = staff.fechaDesde || activePeriod?.fechaDesde || '13/04/2026';
  const displayFechaHasta = staff.fechaHasta || activePeriod?.fechaHasta || '02/10/2026';

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      const { doc } = await generateFichaPdf(staff, { jefeName });
      doc.save(`Ficha_${staff.cedula || 'Docente'}_${staff.apellidos || ''}.pdf`);
    } catch (err) {
      console.error("Error al descargar PDF:", err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handlePrint = async () => {
    // Abrir ventana inmediatamente en el evento de clic para evitar bloqueo de popup en navegadores
    let printWindow = null;
    try {
      printWindow = window.open('about:blank', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head><title>Imprimiendo Ficha Oficial - UPEL</title></head>
          <body style="font-family: Arial, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 75vh; color: #1e293b; background: #f8fafc;">
            <div style="text-align: center; background: white; padding: 2rem 3rem; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
              <h3 style="margin-bottom: 8px; color: #003366;">Generando Ficha Oficial UPEL...</h3>
              <p style="color: #64748b; font-size: 14px; margin: 0;">Preparando el documento en formato Carta para impresión de alta resolución.</p>
            </div>
          </body>
          </html>
        `);
      }
    } catch (_) {}

    try {
      setPrintingPdf(true);
      const { doc } = await generateFichaPdf(staff, { jefeName });
      
      // Habilitar diálogo de impresión automático en el visor PDF oficial
      doc.autoPrint();
      const blob = doc.output('blob');
      const blobUrl = URL.createObjectURL(blob);

      if (printWindow && !printWindow.closed) {
        printWindow.location.href = blobUrl;
      } else {
        // Fallback usando iframe oculto
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.top = '-9999px';
        iframe.style.left = '-9999px';
        iframe.style.width = '1px';
        iframe.style.height = '1px';
        iframe.style.opacity = '0';
        iframe.src = blobUrl;
        document.body.appendChild(iframe);
        iframe.onload = () => {
          try {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
          } catch (_) {
            window.open(blobUrl, '_blank');
          }
        };
      }
    } catch (err) {
      console.error("Error al preparar impresión oficial:", err);
      if (printWindow && !printWindow.closed) printWindow.close();
      window.print();
    } finally {
      setPrintingPdf(false);
    }
  };

  return createPortal(
    <div className="printable-modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: '#f1f5f9', zIndex: 99999,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      overflowY: 'auto', padding: '1.5rem 1rem'
    }}>
      {/* Modal de Envío al Correo Institucional */}
      <SendFichaEmailModal 
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        staff={staff}
        jefeName={jefeName}
      />

      {/* Barra de herramientas para no imprimir */}
      <div className="no-print" style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', width: '100%', maxWidth: '215.9mm', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button className="btn btn-outline" onClick={onBack} style={{ backgroundColor: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ArrowLeft size={16} /> Volver
        </button>
        <button 
          className="btn btn-outline" 
          onClick={() => setIsEmailModalOpen(true)} 
          style={{ backgroundColor: 'white', color: '#003366', borderColor: '#003366', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
          title="Enviar Ficha Completa al correo institucional del docente"
        >
          <Mail size={16} color="#003366" /> Enviar al Correo Institucional
        </button>
        <button 
          className="btn btn-outline" 
          onClick={handleDownloadPdf}
          disabled={downloadingPdf}
          style={{ backgroundColor: 'white', color: '#166534', borderColor: '#166534', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
          title="Descargar Ficha oficial de 1 página en PDF Formato Carta"
        >
          <Download size={16} color="#166534" /> {downloadingPdf ? 'Generando PDF...' : 'Descargar PDF (Carta)'}
        </button>
        <button 
          className="btn btn-primary" 
          onClick={handlePrint}
          disabled={printingPdf}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#003366', borderColor: '#003366', fontWeight: 600 }}
          title="Imprimir Ficha Oficial con calidad de alta resolución (Formato Carta)"
        >
          <Printer size={16} /> {printingPdf ? 'Preparando...' : 'Imprimir Ficha'}
        </button>
      </div>

      {/* Documento (Hoja Carta Oficial) */}
      <div className="print-page" style={{
        backgroundColor: 'white',
        width: '100%',
        maxWidth: '215.9mm', // Carta (Letter) Width
        minHeight: '279.4mm', // Carta (Letter) Height
        padding: '10mm 12mm 8mm 12mm',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        color: '#000',
        fontFamily: '"Times New Roman", Times, serif',
        fontSize: '9pt',
        lineHeight: '1.18',
        boxSizing: 'border-box'
      }}>
        
        {/* Cabecera */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px', borderBottom: '1px solid black', paddingBottom: '3px' }}>
          <div style={{ flex: '0 0 54px' }}>
            <img src="/logo.jpg" alt="UPEL Logo" style={{ width: '50px', height: 'auto' }} />
          </div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontWeight: 'bold', fontSize: '10pt', lineHeight: 1.15 }}>UNIVERSIDAD PEDAGÓGICA EXPERIMENTAL LIBERTADOR</div>
            <div style={{ fontWeight: 'bold', fontSize: '9pt', lineHeight: 1.15 }}>INSTITUTO PEDAGÓGICO RURAL GERVASIO RUBIO</div>
            <div style={{ fontWeight: 'bold', fontSize: '8.5pt', lineHeight: 1.15 }}>UNIDAD DE TALENTO HUMANO</div>
            <div style={{ fontWeight: 'bold', fontSize: '8.5pt', lineHeight: 1.15 }}>SECCIÓN APOYO TÉCNICO</div>
            <div style={{ fontWeight: 'bold', marginTop: '2px', fontSize: '10.5pt', letterSpacing: '0.2px' }}>
              FICHA OFERTA ACADÉMICA PREGRADO
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '10.5pt' }}>
              DOCENTE CONTRATADO
            </div>
          </div>
          <div style={{ flex: '0 0 54px' }}></div>
        </div>

        {/* Info Periodo */}
        <div style={{ marginBottom: '5px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '8.5pt' }}>
            <tbody>
              <tr>
                <td style={{ border: '1px solid black', padding: '2px 4px', width: '15%', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>LAPSO:</td>
                <td style={{ border: '1px solid black', padding: '2px 4px', width: '35%' }}>
                  Total Semanas: {displaySemanas}
                </td>
                <td style={{ border: '1px solid black', padding: '2px 4px', width: '20%', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>PERIODO ACADÉMICO:</td>
                <td style={{ border: '1px solid black', padding: '2px 4px', width: '30%' }}>{displayPeriodo}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '2px 4px', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>DEPARTAMENTO:</td>
                <td style={{ border: '1px solid black', padding: '2px 4px' }}>{staff.department}</td>
                <td style={{ border: '1px solid black', padding: '2px 4px', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>VIGENCIA:</td>
                <td style={{ border: '1px solid black', padding: '2px 4px' }}>Desde: {displayFechaDesde} Hasta: {displayFechaHasta}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Datos Personales */}
        <div style={{ marginBottom: '5px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '8.5pt' }}>
            <thead>
              <tr>
                <th colSpan="4" style={{ backgroundColor: '#f0f0f0', borderBottom: '1px solid black', padding: '2px 4px', textAlign: 'left', fontWeight: 'bold' }}>
                  DATOS PERSONALES <span style={{ fontWeight: 'normal', fontStyle: 'italic', fontSize: '8pt', marginLeft: '8px' }}>Información para ser llenada por el Docente</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid black', padding: '2px 4px', width: '15%', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>APELLIDOS:</td>
                <td style={{ border: '1px solid black', padding: '2px 4px', width: '35%' }}>{staff.apellidos}</td>
                <td style={{ border: '1px solid black', padding: '2px 4px', width: '15%', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>NOMBRES:</td>
                <td style={{ border: '1px solid black', padding: '2px 4px', width: '35%' }}>{staff.nombres}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '2px 4px', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>C.I.:</td>
                <td style={{ border: '1px solid black', padding: '2px 4px' }}>{staff.cedula}</td>
                <td style={{ border: '1px solid black', padding: '2px 4px', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>FECHA NAC.:</td>
                <td style={{ border: '1px solid black', padding: '2px 4px' }}>{staff.fechaNac}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '2px 4px', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>RIF.:</td>
                <td style={{ border: '1px solid black', padding: '2px 4px' }}>{staff.rif}</td>
                <td style={{ border: '1px solid black', padding: '2px 4px', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>TELÉFONOS:</td>
                <td style={{ border: '1px solid black', padding: '2px 4px' }}>{staff.telefonos}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '2px 4px', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>DIRECCIÓN:</td>
                <td colSpan="3" style={{ border: '1px solid black', padding: '2px 4px' }}>{staff.direccion}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '2px 4px', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>CORREO:</td>
                <td colSpan="3" style={{ border: '1px solid black', padding: '2px 4px' }}>{staff.correo || 'N/A'}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '2px 4px', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>CTA. BANCARIA:</td>
                <td style={{ border: '1px solid black', padding: '2px 4px' }}>{staff.cuentaBancaria}</td>
                <td style={{ border: '1px solid black', padding: '2px 4px', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>BANCO/TIPO:</td>
                <td style={{ border: '1px solid black', padding: '2px 4px' }}>{staff.banco} - {staff.tipoCuenta}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Datos Académicos */}
        <div style={{ marginBottom: '5px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '8.5pt' }}>
            <thead>
              <tr>
                <th colSpan="2" style={{ backgroundColor: '#f0f0f0', borderBottom: '1px solid black', padding: '2px 4px', textAlign: 'left', fontWeight: 'bold' }}>
                  DATOS ACADÉMICOS
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid black', padding: '2px 4px', width: '25%', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>TÍTULOS PREGRADO:</td>
                <td style={{ border: '1px solid black', padding: '2px 4px', width: '75%' }}>{staff.titulosPregrado}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '2px 4px', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>TÍTULOS POSTGRADO:</td>
                <td style={{ border: '1px solid black', padding: '2px 4px' }}>{staff.titulosPostgrado || 'N/A'}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '2px 4px', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>DOCTORADO:</td>
                <td style={{ border: '1px solid black', padding: '2px 4px' }}>{staff.doctorado || 'N/A'}</td>
              </tr>
              <tr>
                <td colSpan="2" style={{ border: '1px solid black', padding: '0' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        <td style={{ borderRight: '1px solid black', padding: '2px 4px', width: '25%', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>CATEGORÍA DOCENTE:</td>
                        <td style={{ borderRight: '1px solid black', padding: '2px 4px', width: '25%' }}>{staff.categoriaDocente}</td>
                        <td style={{ borderRight: '1px solid black', padding: '2px 4px', width: '25%', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>DEDICACIÓN:</td>
                        <td style={{ padding: '2px 4px', width: '25%' }}>{staff.dedicacion}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Oferta Académica */}
        <div style={{ marginBottom: '6px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', textAlign: 'center', fontSize: '8.5pt' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th colSpan="5" style={{ border: '1px solid black', padding: '2px 4px', textAlign: 'left', fontWeight: 'bold' }}>
                  DATOS OFERTA ACADÉMICA <span style={{ fontWeight: 'normal', fontStyle: 'italic', fontSize: '8pt', marginLeft: '8px' }}>Datos para ser llenados por el Jefe de Dpto.</span>
                </th>
              </tr>
              <tr style={{ backgroundColor: '#f9f9f9' }}>
                <th style={{ border: '1px solid black', padding: '2px 4px', width: '6%' }}>NRO</th>
                <th style={{ border: '1px solid black', padding: '2px 4px', textAlign: 'left' }}>MATERIA - UNIDAD CURRICULAR</th>
                <th style={{ border: '1px solid black', padding: '2px 4px', width: '15%' }}>COHORTE</th>
                <th style={{ border: '1px solid black', padding: '2px 4px', width: '14%' }}>HORAS SEMANAL</th>
                <th style={{ border: '1px solid black', padding: '2px 4px', width: '14%' }}>HORAS LAPSO</th>
              </tr>
            </thead>
            <tbody>
              {staff.materias && staff.materias.map((mat, i) => {
                const sec = mat.seccion || mat.secciones || 'U';
                const cup = (mat.cupos !== undefined && mat.cupos !== null && mat.cupos !== '') ? mat.cupos : 0;
                const ins = (mat.inscritos !== undefined && mat.inscritos !== null && mat.inscritos !== '') ? mat.inscritos : 0;
                const rawCoh = mat.cohorte || staff.cohorte || '';
                const coh = String(rawCoh).trim() || '-';

                return (
                  <tr key={i}>
                    <td style={{ border: '1px solid black', padding: '2px 4px' }}>0{i + 1}</td>
                    <td style={{ border: '1px solid black', padding: '2px 4px', textAlign: 'left' }}>
                      <div style={{ fontWeight: 'bold' }}>{mat.nombre}</div>
                      <div style={{ fontSize: '7.5pt', color: '#1f2937', marginTop: '1px' }}>
                        <span>Sec. {sec}</span> &nbsp;|&nbsp; <span>Cupos: {cup}</span> &nbsp;|&nbsp; <span>Inscritos: {ins}</span>
                        {mat.especialidadDestino ? ` | Especialidad: ${mat.especialidadDestino}` : ''}
                      </div>
                    </td>
                    <td style={{ border: '1px solid black', padding: '2px 4px', fontWeight: 'bold', textAlign: 'center' }}>
                      {coh}
                    </td>
                    <td style={{ border: '1px solid black', padding: '2px 4px' }}>{mat.horasSemanal}</td>
                    <td style={{ border: '1px solid black', padding: '2px 4px' }}>{mat.horasLapso}</td>
                  </tr>
                );
              })}
              {/* Filas vacías para completar el formato */}
              {Array.from({ length: Math.max(0, Math.min(2, 3 - (staff.materias?.length || 0))) }).map((_, i) => (
                <tr key={`empty-${i}`}>
                  <td style={{ border: '1px solid black', padding: '2px 4px' }}>0{(staff.materias?.length || 0) + i + 1}</td>
                  <td style={{ border: '1px solid black', padding: '2px 4px' }}>&nbsp;</td>
                  <td style={{ border: '1px solid black', padding: '2px 4px' }}>&nbsp;</td>
                  <td style={{ border: '1px solid black', padding: '2px 4px' }}>&nbsp;</td>
                  <td style={{ border: '1px solid black', padding: '2px 4px' }}>&nbsp;</td>
                </tr>
              ))}
              <tr>
                <td colSpan="3" style={{ border: '1px solid black', padding: '2px 4px', textAlign: 'right', fontWeight: 'bold' }}>TOTAL, HORAS LAPSO:</td>
                <td style={{ border: '1px solid black', padding: '2px 4px', fontWeight: 'bold' }}>
                  {staff.materias?.reduce((sum, m) => sum + Number(m.horasSemanal || 0), 0)}
                </td>
                <td style={{ border: '1px solid black', padding: '2px 4px', fontWeight: 'bold' }}>
                  {staff.materias?.reduce((sum, m) => sum + Number(m.horasLapso || 0), 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Firmas */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '26px', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', width: '230px' }}>
            <div style={{ borderBottom: '1px solid black', height: '24px' }}></div>
            <div style={{ marginTop: '4px', fontWeight: 'bold', fontSize: '9pt' }}>{staff.nombres} {staff.apellidos}</div>
            <div style={{ marginTop: '1px', fontSize: '8.5pt' }}>PROFESOR</div>
            <div style={{ fontSize: '7.5pt', marginTop: '1px', textAlign: 'center', fontStyle: 'italic' }}>Nota: Doy fe de los datos suministrados.</div>
          </div>
          <div style={{ textAlign: 'center', width: '230px' }}>
            <div style={{ borderBottom: '1px solid black', height: '24px' }}></div>
            <div style={{ marginTop: '4px', fontWeight: 'bold', fontSize: '9pt' }}>{jefeName || '________________________'}</div>
            <div style={{ marginTop: '1px', fontSize: '8.5pt' }}>Jefatura(s) de {staff.department}</div>
            <div style={{ fontSize: '7.5pt', marginTop: '1px', textAlign: 'center', fontStyle: 'italic' }}>Ficha Validada en Sistema SIGOA</div>
          </div>
        </div>

        {/* Coletilla de Anexo */}
        <div style={{ marginTop: '10px', fontSize: '8.5pt', fontWeight: 'bold', textAlign: 'left' }}>
          ANEXO: CI, COPIA DE TITULOS
        </div>

        {/* Pie de Página - Dirección */}
        <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '8pt', fontStyle: 'italic' }}>
          Final Avenida Dr Manuel Pulido Mendez Via Bramon Rubio - Estado Tachira
        </div>

        {/* Lema de la Universidad */}
        <div style={{ textAlign: 'center', marginTop: '3px' }}>
          <p style={{
            fontFamily: '"Dancing Script", cursive',
            fontSize: '10pt',
            color: '#000',
            margin: 0,
            fontWeight: 600
          }}>
            "La Universidad de los Maestros"
          </p>
        </div>

      </div>

      <style>{`
        @media print {
          @page {
            size: letter portrait;
            margin: 8mm 12mm 8mm 12mm;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden;
          }
          .print-page, .print-page * {
            visibility: visible;
          }
          .printable-modal-overlay {
            position: static !important;
            background: transparent !important;
            padding: 0 !important;
            overflow: visible !important;
          }
          .print-page {
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            font-size: 9pt !important;
            line-height: 1.18 !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .no-print {
            display: none !important;
          }
          table {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            border-collapse: collapse !important;
          }
          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          td, th {
            padding: 2.5px 5px !important;
            border: 1px solid #000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default PrintableFicha;
