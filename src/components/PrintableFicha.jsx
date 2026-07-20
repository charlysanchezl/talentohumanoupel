import React, { useState, useEffect } from 'react';

const PrintableFicha = ({ staff, onBack }) => {
  const [jefeName, setJefeName] = useState('');

  useEffect(() => {
    if (staff && staff.department) {
      fetch('http://localhost:3001/api/users')
        .then(res => res.json())
        .then(users => {
          const jefe = users.find(u => u.role === 'JEFE' && u.department === staff.department);
          if (jefe) setJefeName(jefe.name);
        })
        .catch(err => console.error("Error fetching jefe:", err));
    }
  }, [staff]);

  if (!staff) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: '#f1f5f9', zIndex: 1000,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      overflowY: 'auto', padding: '2rem'
    }}>
      {/* Barra de herramientas para no imprimir */}
      <div className="no-print" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', width: '100%', maxWidth: '800px', justifyContent: 'flex-end' }}>
        <button className="btn btn-outline" onClick={onBack} style={{ backgroundColor: 'white' }}>Volver</button>
        <button className="btn btn-primary" onClick={() => window.print()}>🖨️ Imprimir Ficha</button>
      </div>

      {/* Documento (Hoja) */}
      <div className="print-page" style={{
        backgroundColor: 'white',
        width: '100%',
        maxWidth: '215.9mm', // Carta (Letter) Width
        minHeight: '279.4mm', // Carta (Letter) Height
        padding: '10mm',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        color: '#000',
        fontFamily: '"Times New Roman", Times, serif',
        fontSize: '12pt',
        lineHeight: '1.2'
      }}>
        
        {/* Cabecera */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid black', paddingBottom: '5px' }}>
          <div style={{ flex: '0 0 70px' }}>
            <img src="/logo.jpg" alt="UPEL Logo" style={{ width: '70px', height: 'auto' }} />
          </div>
          <div style={{ textAlign: 'center', flex: 1, paddingTop: '10px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '12pt', marginBottom: '4px' }}>UNIVERSIDAD PEDAGÓGICA EXPERIMENTAL LIBERTADOR</div>
            <div style={{ fontWeight: 'bold', fontSize: '11pt', marginBottom: '4px' }}>INSTITUTO PEDAGÓGICO RURAL GERVASIO RUBIO</div>
            <div style={{ fontWeight: 'bold', fontSize: '11pt' }}>UNIDAD DE TALENTO HUMANO</div>
            <div style={{ fontWeight: 'bold', fontSize: '11pt' }}>SECCIÓN APOYO TÉCNICO</div>
            <div style={{ fontWeight: 'bold', marginTop: '5px', fontSize: '13pt' }}>
              FICHA OFERTA ACADÉMICA PREGRADO
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '13pt' }}>
              DOCENTE CONTRATADO
            </div>
          </div>
          <div style={{ flex: '0 0 70px' }}></div>
        </div>

        {/* Info Periodo */}
        <div style={{ marginBottom: '10px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '11pt' }}>
            <tbody>
              <tr>
                <td style={{ border: '1px solid black', padding: '3px 5px', width: '15%', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>LAPSO:</td>
                <td style={{ border: '1px solid black', padding: '3px 5px', width: '35%' }}>Total Semanas: {staff.semanas}</td>
                <td style={{ border: '1px solid black', padding: '3px 5px', width: '20%', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>PERIODO ACADÉMICO:</td>
                <td style={{ border: '1px solid black', padding: '3px 5px', width: '30%' }}>{staff.periodoAcademico}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '3px 5px', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>DEPARTAMENTO:</td>
                <td style={{ border: '1px solid black', padding: '3px 5px' }}>{staff.department}</td>
                <td style={{ border: '1px solid black', padding: '3px 5px', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>VIGENCIA:</td>
                <td style={{ border: '1px solid black', padding: '3px 5px' }}>Desde: {staff.fechaDesde} Hasta: {staff.fechaHasta}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Datos Personales */}
        <div style={{ marginBottom: '10px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '11pt' }}>
            <thead>
              <tr>
                <th colSpan="4" style={{ backgroundColor: '#f0f0f0', borderBottom: '1px solid black', padding: '3px 5px', textAlign: 'left', fontWeight: 'bold' }}>
                  DATOS PERSONALES <span style={{ fontWeight: 'normal', fontStyle: 'italic', fontSize: '9pt', marginLeft: '10px' }}>Información para ser llenada por el Docente</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid black', padding: '3px 5px', width: '15%', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>APELLIDOS:</td>
                <td style={{ border: '1px solid black', padding: '3px 5px', width: '35%' }}>{staff.apellidos}</td>
                <td style={{ border: '1px solid black', padding: '3px 5px', width: '15%', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>NOMBRES:</td>
                <td style={{ border: '1px solid black', padding: '3px 5px', width: '35%' }}>{staff.nombres}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '3px 5px', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>C.I.:</td>
                <td style={{ border: '1px solid black', padding: '3px 5px' }}>{staff.cedula}</td>
                <td style={{ border: '1px solid black', padding: '3px 5px', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>FECHA NAC.:</td>
                <td style={{ border: '1px solid black', padding: '3px 5px' }}>{staff.fechaNac}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '3px 5px', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>RIF.:</td>
                <td style={{ border: '1px solid black', padding: '3px 5px' }}>{staff.rif}</td>
                <td style={{ border: '1px solid black', padding: '3px 5px', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>TELÉFONOS:</td>
                <td style={{ border: '1px solid black', padding: '3px 5px' }}>{staff.telefonos}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '3px 5px', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>DIRECCIÓN:</td>
                <td colSpan="3" style={{ border: '1px solid black', padding: '3px 5px' }}>{staff.direccion}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '3px 5px', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>CORREO:</td>
                <td colSpan="3" style={{ border: '1px solid black', padding: '3px 5px' }}>{staff.correo || 'N/A'}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '3px 5px', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>CTA. BANCARIA:</td>
                <td style={{ border: '1px solid black', padding: '3px 5px' }}>{staff.cuentaBancaria}</td>
                <td style={{ border: '1px solid black', padding: '3px 5px', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>BANCO/TIPO:</td>
                <td style={{ border: '1px solid black', padding: '3px 5px' }}>{staff.banco} - {staff.tipoCuenta}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Datos Académicos */}
        <div style={{ marginBottom: '10px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '11pt' }}>
            <thead>
              <tr>
                <th colSpan="2" style={{ backgroundColor: '#f0f0f0', borderBottom: '1px solid black', padding: '3px 5px', textAlign: 'left', fontWeight: 'bold' }}>
                  DATOS ACADÉMICOS
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid black', padding: '3px 5px', width: '25%', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>TÍTULOS PREGRADO:</td>
                <td style={{ border: '1px solid black', padding: '3px 5px', width: '75%' }}>{staff.titulosPregrado}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '3px 5px', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>TÍTULOS POSTGRADO:</td>
                <td style={{ border: '1px solid black', padding: '3px 5px' }}>{staff.titulosPostgrado || 'N/A'}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '3px 5px', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>DOCTORADO:</td>
                <td style={{ border: '1px solid black', padding: '3px 5px' }}>{staff.doctorado || 'N/A'}</td>
              </tr>
              <tr>
                <td colSpan="2" style={{ border: '1px solid black', padding: '0' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        <td style={{ borderRight: '1px solid black', padding: '3px 5px', width: '25%', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>CATEGORÍA DOCENTE:</td>
                        <td style={{ borderRight: '1px solid black', padding: '3px 5px', width: '25%' }}>{staff.categoriaDocente}</td>
                        <td style={{ borderRight: '1px solid black', padding: '3px 5px', width: '25%', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>DEDICACIÓN:</td>
                        <td style={{ padding: '3px 5px', width: '25%' }}>{staff.dedicacion}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Oferta Académica */}
        <div style={{ marginBottom: '20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', textAlign: 'center', fontSize: '11pt' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th colSpan="4" style={{ border: '1px solid black', padding: '3px 5px', textAlign: 'left', fontWeight: 'bold' }}>
                  DATOS OFERTA ACADÉMICA <span style={{ fontWeight: 'normal', fontStyle: 'italic', fontSize: '9pt', marginLeft: '10px' }}>Datos para ser llenados por el Jefe de Dpto.</span>
                </th>
              </tr>
              <tr style={{ backgroundColor: '#f9f9f9' }}>
                <th style={{ border: '1px solid black', padding: '3px 5px' }}>NRO</th>
                <th style={{ border: '1px solid black', padding: '3px 5px' }}>MATERIA - UNIDAD CURRICULAR</th>
                <th style={{ border: '1px solid black', padding: '3px 5px' }}>HORAS SEMANAL</th>
                <th style={{ border: '1px solid black', padding: '3px 5px' }}>HORAS LAPSO</th>
              </tr>
            </thead>
            <tbody>
              {staff.materias && staff.materias.map((mat, i) => (
                <tr key={i}>
                  <td style={{ border: '1px solid black', padding: '3px 5px' }}>0{i + 1}</td>
                  <td style={{ border: '1px solid black', padding: '3px 5px', textAlign: 'left' }}>{mat.nombre}</td>
                  <td style={{ border: '1px solid black', padding: '3px 5px' }}>{mat.horasSemanal}</td>
                  <td style={{ border: '1px solid black', padding: '3px 5px' }}>{mat.horasLapso}</td>
                </tr>
              ))}
              {/* Filas vacías para rellenar si hay pocas materias */}
              {Array.from({ length: Math.max(0, 3 - (staff.materias?.length || 0)) }).map((_, i) => (
                <tr key={`empty-${i}`}>
                  <td style={{ border: '1px solid black', padding: '3px 5px' }}>0{(staff.materias?.length || 0) + i + 1}</td>
                  <td style={{ border: '1px solid black', padding: '3px 5px' }}>&nbsp;</td>
                  <td style={{ border: '1px solid black', padding: '3px 5px' }}>&nbsp;</td>
                  <td style={{ border: '1px solid black', padding: '3px 5px' }}>&nbsp;</td>
                </tr>
              ))}
              <tr>
                <td colSpan="2" style={{ border: '1px solid black', padding: '3px 5px', textAlign: 'right', fontWeight: 'bold' }}>TOTAL, HORAS LAPSO:</td>
                <td style={{ border: '1px solid black', padding: '3px 5px', fontWeight: 'bold' }}>
                  {staff.materias?.reduce((sum, m) => sum + Number(m.horasSemanal || 0), 0)}
                </td>
                <td style={{ border: '1px solid black', padding: '3px 5px', fontWeight: 'bold' }}>
                  {staff.materias?.reduce((sum, m) => sum + Number(m.horasLapso || 0), 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Firmas */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '70px', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', width: '250px' }}>
            <div style={{ borderBottom: '1px solid black', height: '30px' }}></div>
            <div style={{ marginTop: '5px', fontWeight: 'bold', fontSize: '11pt' }}>{staff.nombres} {staff.apellidos}</div>
            <div style={{ marginTop: '2px', fontSize: '11pt' }}>PROFESOR</div>
            <div style={{ fontSize: '9pt', marginTop: '2px', textAlign: 'center' }}>Nota: Doy fe de los datos suministrados.</div>
          </div>
          <div style={{ textAlign: 'center', width: '250px' }}>
            <div style={{ borderBottom: '1px solid black', height: '30px' }}></div>
            <div style={{ marginTop: '5px', fontWeight: 'bold', fontSize: '11pt' }}>{jefeName || '________________________'}</div>
            <div style={{ marginTop: '2px', fontSize: '11pt' }}>Jefe de Departamento de {staff.department}</div>
          </div>
        </div>

        {/* Anexo eliminado según solicitud */}

        {/* Pie de Página - Dirección */}
        <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '10pt', fontStyle: 'italic' }}>
          Final Avenida Dr Manuel Pulido Mendez Via Bramon Rubio - Estado Tachira
        </div>

        {/* Lema de la Universidad (Movido al final) */}
        <div style={{ textAlign: 'center', marginTop: '5px' }}>
          <p style={{
            fontFamily: '"Dancing Script", cursive',
            fontSize: '11pt',
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
            size: letter;
            margin: 15mm;
          }
          body * {
            visibility: hidden;
          }
          .print-page, .print-page * {
            visibility: visible;
          }
          .print-page {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: none !important;
            min-height: auto !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintableFicha;
