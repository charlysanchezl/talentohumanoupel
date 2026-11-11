import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, FileSpreadsheet, FileText } from 'lucide-react';

const ExcelPreviewModal = ({ 
  isOpen, 
  onClose, 
  headerRows = [], 
  dataRows = [], 
  colsWidth = [],
  sheetName = 'Hoja 1',
  fileName = 'Documento.xlsx',
  title = 'Vista Previa de Exportación'
}) => {
  const [previewPage, setPreviewPage] = useState(1);
  const PREVIEW_PER_PAGE = 50;
  const safeDataRows = Array.isArray(dataRows) ? dataRows : [];
  const totalPreviewPages = Math.max(1, Math.ceil(safeDataRows.length / PREVIEW_PER_PAGE));
  const currentPreviewRows = safeDataRows.slice((previewPage - 1) * PREVIEW_PER_PAGE, previewPage * PREVIEW_PER_PAGE);

  const handleDownload = async () => {
    try {
      const { default: ExcelJS } = await import('exceljs');
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'UPEL Talento Humano';
      workbook.created = new Date();
      const worksheet = workbook.addWorksheet(sheetName || 'Docentes', {
        views: [{ showGridLines: true }]
      });

      // 1. Cargar e Incrustar Logo UPEL
      try {
        const logoResp = await fetch('/upel.jpg');
        if (logoResp.ok) {
          const logoBlob = await logoResp.blob();
          const arrayBuffer = await logoBlob.arrayBuffer();
          const imageId = workbook.addImage({
            buffer: arrayBuffer,
            extension: 'jpeg',
          });
          worksheet.addImage(imageId, {
            tl: { col: 0.1, row: 0.2 },
            ext: { width: 75, height: 75 },
            editAs: 'oneCell'
          });
        }
      } catch (imgErr) {
        console.warn('No se pudo cargar upel.jpg en el Excel:', imgErr);
      }

      // Encabezados institucionales
      const titleRowIndex = headerRows.length - 1;
      const columnHeaders = headerRows.length > 0 ? headerRows[titleRowIndex] : [];
      const institutionalHeaders = headerRows.slice(0, titleRowIndex);

      // Escribir filas institucionales con margen para el logo (col B en adelante)
      institutionalHeaders.forEach((row, rIdx) => {
        const text = row && row.length > 0 ? row[0] : '';
        const xlRow = worksheet.addRow(['', text]); // Col A vacía para el logo
        xlRow.height = 18;
        const cell = xlRow.getCell(2);
        cell.font = {
          name: 'Calibri',
          bold: rIdx === 0 || rIdx === 1 || rIdx === 3,
          size: rIdx === 0 ? 12 : (rIdx === 1 || rIdx === 3 ? 11 : 10),
          color: { argb: 'FF1E293B' }
        };
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      });

      // Fila vacía separadora si hace falta
      if (institutionalHeaders.length < 5) {
        worksheet.addRow([]);
      }

      // Fila de encabezados de columnas
      const headerXlRow = worksheet.addRow(columnHeaders);
      headerXlRow.height = 28;
      const headerRowNumber = headerXlRow.number;

      const totalCols = Math.max(columnHeaders.length, colsWidth.length, 1);

      // Estilo a la fila de encabezados
      for (let c = 1; c <= totalCols; c++) {
        const cell = headerXlRow.getCell(c);
        cell.font = { name: 'Calibri', bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF1E293B' } // Fondo oscuro elegante
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'medium', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
      }

      // Escribir datos con bordes oscuros en todas las celdas
      const startDataRow = headerRowNumber + 1;
      dataRows.forEach((row, rowIdx) => {
        const xlRow = worksheet.addRow(row);
        xlRow.height = 20;
        const isEven = rowIdx % 2 === 0;

        for (let c = 1; c <= totalCols; c++) {
          const cell = xlRow.getCell(c);
          cell.font = { name: 'Calibri', size: 9.5, color: { argb: 'FF000000' } };
          
          if (!isEven) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF8FAFC' }
            };
          }

          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };

          const val = cell.value;
          if (typeof val === 'string' && /^\d{10,}$/.test(val)) {
            cell.numFmt = '@';
          }
          const isCenter = typeof val === 'number' || val === '-' || val === '0' || [3, 4, 5, 8, 9, 10].includes(c);
          cell.alignment = {
            horizontal: isCenter ? 'center' : 'left',
            vertical: 'middle',
            wrapText: true
          };
        }
      });

      // Configurar anchos de columna
      if (colsWidth && colsWidth.length > 0) {
        colsWidth.forEach((col, idx) => {
          worksheet.getColumn(idx + 1).width = (col.wch || 12) + 2;
        });
      } else {
        worksheet.columns.forEach(column => {
          column.width = 16;
        });
      }

      // Generar archivo y descargar
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const downloadName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 150);

      onClose();
    } catch (error) {
      console.error('Error generando Excel con ExcelJS, usando respaldo XLSX:', error);
      // Respaldo con xlsx-js-style en caso de error
      try {
        const xlsxMod = await import('xlsx-js-style');
        const XLSX = xlsxMod.default?.utils ? xlsxMod.default : xlsxMod;
        const allRows = [...headerRows, ...dataRows];
        const worksheet = XLSX.utils.aoa_to_sheet(allRows);
        const titleRowIndex = headerRows.length - 1;
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:Z100');

        for (let R = range.s.r; R <= range.e.r; ++R) {
          for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ c: C, r: R });
            if (!worksheet[cellAddress]) {
              worksheet[cellAddress] = { v: '', t: 's' };
            }
            if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {};

            if (R === titleRowIndex) {
              worksheet[cellAddress].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "1E293B" } },
                alignment: { horizontal: "center", vertical: "center", wrapText: true },
                border: {
                  top: { style: "thin", color: { rgb: "000000" } },
                  bottom: { style: "medium", color: { rgb: "000000" } },
                  left: { style: "thin", color: { rgb: "000000" } },
                  right: { style: "thin", color: { rgb: "000000" } }
                }
              };
            } else if (R > titleRowIndex) {
              worksheet[cellAddress].s = {
                alignment: { vertical: "center", wrapText: true },
                border: {
                  top: { style: "thin", color: { rgb: "000000" } },
                  bottom: { style: "thin", color: { rgb: "000000" } },
                  left: { style: "thin", color: { rgb: "000000" } },
                  right: { style: "thin", color: { rgb: "000000" } }
                }
              };
            }
          }
        }

        if (colsWidth && colsWidth.length > 0) {
          worksheet['!cols'] = colsWidth;
        }

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        XLSX.writeFile(workbook, fileName);
        onClose();
      } catch (fallbackError) {
        alert("Error al exportar: " + fallbackError.message);
      }
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
      ]);
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // 1. Cargar e Incrustar Logo UPEL
      try {
        const logoResp = await fetch('/upel.jpg');
        if (logoResp.ok) {
          const blob = await logoResp.blob();
          const base64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
          doc.addImage(base64, 'JPEG', 14, 8, 22, 22);
        }
      } catch (imgErr) {
        console.warn('No se pudo cargar el logo para el PDF:', imgErr);
      }

      // 2. Encabezados Institucionales
      const titleRowIndex = headerRows.length - 1;
      const columnHeaders = headerRows.length > 0 ? headerRows[titleRowIndex] : [];
      const institutionalHeaders = headerRows.slice(0, titleRowIndex);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);

      let textY = 11;
      institutionalHeaders.forEach((row, idx) => {
        const text = row && row.length > 0 ? row[0] : '';
        if (!text) return;
        if (idx === 0 || idx === 1 || idx === 3) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(idx === 0 ? 9.5 : 8.5);
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
        }
        doc.text(text, 40, textY);
        textY += 4.2;
      });

      // 3. Formatear datos para AutoTable (convertir null / undefined a '')
      const cleanData = dataRows.map(row => row.map(cell => (cell === null || cell === undefined) ? '' : String(cell)));

      // 4. Generar AutoTable con bordes completos y legibles
      autoTable(doc, {
        startY: Math.max(textY + 3, 34),
        head: [columnHeaders],
        body: cleanData,
        theme: 'grid',
        headStyles: {
          fillColor: [30, 41, 59], // #1e293b
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 6.5,
          halign: 'center',
          valign: 'middle',
          lineWidth: 0.15,
          lineColor: [15, 23, 42]
        },
        bodyStyles: {
          fontSize: 6,
          valign: 'middle',
          lineWidth: 0.15,
          lineColor: [203, 213, 225],
          textColor: [15, 23, 42]
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        styles: {
          cellPadding: 1.2,
          overflow: 'linebreak'
        },
        margin: { top: 34, left: 10, right: 10, bottom: 12 },
        didDrawPage: (data) => {
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          doc.setTextColor(100);
          doc.text(
            `Página ${data.pageNumber} de ${pageCount} — UPEL - Instituto Pedagógico Rural Gervasio Rubio`,
            doc.internal.pageSize.width - 12,
            doc.internal.pageSize.height - 5,
            { align: 'right' }
          );
        }
      });

      const pdfName = (fileName || 'Documento').replace(/\.xlsx$/i, '') + '.pdf';
      doc.save(pdfName);
      onClose();
    } catch (err) {
      console.error('Error generando PDF:', err);
      alert('Error al generar PDF: ' + err.message);
    }
  };

  const validHeaderRows = Array.isArray(headerRows) ? headerRows : [];
  const validDataRows = safeDataRows;

  const columnHeaders = validHeaderRows.length > 0 && Array.isArray(validHeaderRows[validHeaderRows.length - 1])
    ? validHeaderRows[validHeaderRows.length - 1]
    : [];
  const institutionalHeaders = validHeaderRows.length > 1
    ? validHeaderRows.slice(0, validHeaderRows.length - 1)
    : [];

  if (!isOpen) return null;

  return createPortal(
    <div className="upel-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', zIndex: 99999, justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
      <div className="surface animate-scale" style={{ width: '95%', maxWidth: '1400px', height: '90vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '1.5rem 1.5rem 0 1.5rem', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileSpreadsheet size={24} color="#10b981" />
            <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.5rem' }}>{title}</h2>
          </div>
          <button onClick={onClose} className="btn-icon" title="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', padding: '1.5rem', margin: '0 1.5rem' }}>
          
          <div style={{ background: 'white', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflowX: 'auto', minWidth: '800px' }}>
            <div style={{ padding: '20px', borderBottom: '2px solid #333', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <img 
                src="/upel.jpg" 
                alt="Logo UPEL" 
                style={{ width: '80px', height: '80px', objectFit: 'contain', flexShrink: 0 }}
                onError={(e) => { e.currentTarget.src = '/logo.jpg'; }}
              />
              <div style={{ flex: 1 }}>
                {institutionalHeaders.map((row, idx) => {
                  const lineText = Array.isArray(row) ? (row[0] || ' ') : (row || ' ');
                  return (
                    <div key={idx} style={{ 
                      fontWeight: (idx === 0 || idx === 1 || idx === 3) ? 'bold' : 'normal',
                      fontSize: idx === 0 ? '1.1rem' : (idx === 1 || idx === 3 ? '0.95rem' : '0.85rem'),
                      lineHeight: '1.35',
                      minHeight: '1.35em',
                      color: '#1e293b'
                    }}>
                      {lineText}
                    </div>
                  );
                })}
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', fontFamily: 'Arial, sans-serif' }}>
              <thead>
                <tr>
                  {columnHeaders.map((col, idx) => (
                    <th key={idx} style={{ 
                      background: '#333', 
                      color: 'white', 
                      padding: '10px 8px',
                      border: '1px solid #555',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap'
                    }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentPreviewRows.map((row, rowIdx) => (
                  <tr key={rowIdx} style={{ background: rowIdx % 2 === 0 ? '#ffffff' : '#f9f9f9' }}>
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} style={{ 
                        border: '1px solid #ddd', 
                        padding: '8px',
                        textAlign: (typeof cell === 'number' || cell === '-' || cell === '0') ? 'center' : 'left'
                      }}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
                {dataRows.length === 0 && (
                  <tr>
                    <td colSpan={columnHeaders.length} style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                      No hay datos para mostrar
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Barra de Navegación de Vista Previa para Alto Rendimiento */}
            {dataRows.length > PREVIEW_PER_PAGE && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: '#f1f5f9', borderTop: '1px solid #cbd5e1', fontSize: '0.85rem' }}>
                <span style={{ color: '#475569', fontWeight: 500 }}>
                  Mostrando filas {(previewPage - 1) * PREVIEW_PER_PAGE + 1} - {Math.min(previewPage * PREVIEW_PER_PAGE, dataRows.length)} de <strong>{dataRows.length.toLocaleString('es-VE')}</strong> en vista previa interactiva.
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button 
                    type="button"
                    disabled={previewPage <= 1} 
                    onClick={() => setPreviewPage(p => Math.max(1, p - 1))}
                    className="btn btn-outline" 
                    style={{ padding: '4px 10px', fontSize: '0.8rem', background: '#ffffff', opacity: previewPage <= 1 ? 0.5 : 1, cursor: previewPage <= 1 ? 'not-allowed' : 'pointer' }}
                  >
                    ◀ Anterior
                  </button>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>
                    Pág. {previewPage} de {totalPreviewPages}
                  </span>
                  <button 
                    type="button"
                    disabled={previewPage >= totalPreviewPages} 
                    onClick={() => setPreviewPage(p => Math.min(totalPreviewPages, p + 1))}
                    className="btn btn-outline" 
                    style={{ padding: '4px 10px', fontSize: '0.8rem', background: '#ffffff', opacity: previewPage >= totalPreviewPages ? 0.5 : 1, cursor: previewPage >= totalPreviewPages ? 'not-allowed' : 'pointer' }}
                  >
                    Siguiente ▶
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', marginTop: '1rem', borderTop: '1px solid var(--border-light)', background: 'var(--bg-app)', borderBottomLeftRadius: 'var(--radius-lg)', borderBottomRightRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0047bb', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '4px', padding: '2px 8px' }}>
                Archivo: {fileName}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                ({dataRows.length.toLocaleString('es-VE')} registros)
              </span>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              {dataRows.length > PREVIEW_PER_PAGE 
                ? `⚡ Vista previa instantánea optimizada. Al hacer clic en descargar se exportan las ${dataRows.length.toLocaleString('es-VE')} filas completas.` 
                : 'Selecciona el formato de exportación deseado con membrete oficial, logo UPEL y cuadrícula completa.'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={onClose} className="btn btn-outline" style={{ padding: '0.55rem 1rem' }}>
              Cancelar
            </button>
            <button onClick={handleDownloadPDF} className="btn" style={{ background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 1.1rem', fontWeight: 600 }}>
              <FileText size={18} /> Exportar a PDF (.pdf)
            </button>
            <button onClick={handleDownload} className="btn" style={{ background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 1.1rem', fontWeight: 600 }}>
              <FileSpreadsheet size={18} /> Exportar a Excel (.xlsx)
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default ExcelPreviewModal;
