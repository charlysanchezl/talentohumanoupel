import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Search, Eye, FileText, CheckCircle, Clock, X, Plus, CheckSquare, Settings, Calculator, Globe, GraduationCap, Microscope, User, Printer, Upload } from 'lucide-react';
import PrintableFicha from './PrintableFicha';
import { getStaffData, getCurrentUser, createStaff, updateStaffCarga, getCatalogoMaterias, addMateriaCatalogo } from '../data';
import * as XLSX from 'xlsx-js-style';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const getDeptTheme = (dept) => {
  switch (dept) {
    case 'Matemáticas': return { color: '#3b82f6', bg: '#eff6ff', icon: <Calculator size={32} /> };
    case 'Ciencias Sociales': return { color: '#8b5cf6', bg: '#ede9fe', icon: <Globe size={32} /> };
    case 'Pedagogía': return { color: '#ec4899', bg: '#fce7f3', icon: <GraduationCap size={32} /> };
    case 'Agroindustrial': return { color: '#10b981', bg: '#d1fae5', icon: <Microscope size={32} /> };
    default: return { color: 'var(--primary)', bg: 'var(--primary-light)', icon: <User size={32} /> };
  }
};

const StaffList = () => {
  const { deptName } = useParams();
  const currentDept = decodeURIComponent(deptName);
  
  const user = getCurrentUser();
  const [staffList, setStaffList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  const [isAddDocenteModalOpen, setIsAddDocenteModalOpen] = useState(false); // Modal Ingresar Docente
  const [newDocente, setNewDocente] = useState({ cedula: '', nombres: '', apellidos: '' });
  const [staffToView, setStaffToView] = useState(null); 
  const [staffToValidate, setStaffToValidate] = useState(null); // Docente que vamos a validar materias
  const [staffToPrint, setStaffToPrint] = useState(null); 
  
  const [materiasForm, setMateriasForm] = useState([{ nombre: '', horasSemanal: 0, horasLapso: 0 }]);
  const [validationForm, setValidationForm] = useState({
    periodoAcademico: `${new Date().getFullYear()}-I`,
    semanas: 15,
    fechaDesde: '',
    fechaHasta: ''
  });
  const [cursosList, setCursosList] = useState([]);

  const academicPeriods = React.useMemo(() => {
    const year = new Date().getFullYear();
    return [
      `${year}-I`, `${year}-II`,
      `${year + 1}-I`, `${year + 1}-II`,
      `${year + 2}-I`, `${year + 2}-II`
    ];
  }, []);

  const fetchData = async () => {
    const staff = await getStaffData();
    setStaffList(staff);
    const catalogo = await getCatalogoMaterias();
    setCursosList(catalogo);
  };

  useEffect(() => {
    fetchData();
  }, [currentDept]);

  if (user && user.role === 'JEFE' && user.department !== currentDept) {
    return <Navigate to={`/departamento/${encodeURIComponent(user.department)}`} replace />;
  }

  const theme = getDeptTheme(currentDept);

  const handleAddDocenteSubmit = (e) => {
    e.preventDefault();
    if (!newDocente.cedula || !newDocente.nombres || !newDocente.apellidos) return;
    
    // Verificación de cédula duplicada
    const cleanNewCedula = newDocente.cedula.replace(/\D/g, '');
    if (cleanNewCedula) {
      const existingDocente = staffList.find(s => {
        const cleanExisting = s.cedula ? s.cedula.replace(/\D/g, '') : '';
        return cleanExisting === cleanNewCedula;
      });

      if (existingDocente) {
        alert(`Error: La cédula ${newDocente.cedula} ya está registrada en el sistema a nombre de ${existingDocente.nombres} ${existingDocente.apellidos} (${existingDocente.department}).`);
        return;
      }
    }
    
    const newStaff = {
      id: Date.now().toString(),
      cedula: newDocente.cedula,
      nombres: newDocente.nombres.toUpperCase(),
      apellidos: newDocente.apellidos.toUpperCase(),
      department: currentDept,
      status: 'Por Revisar',
      fechaNac: '', rif: '', direccion: '', telefonos: '', cuentaBancaria: '',
      banco: '', tipoCuenta: 'Ahorro', titulosPregrado: '', titulosPostgrado: '',
      categoriaDocente: 'Instructor', dedicacion: 'Tiempo Convencional',
      periodoAcademico: `${new Date().getFullYear()}-I`, semanas: 15, fechaDesde: '', fechaHasta: '',
      materias: []
    };

    // Import createStaff from data (wait, StaffList imports saveStaffData, we should change the import and use createStaff)
    // However, createStaff doesn't exist in imports. I need to update imports.
    // Let's just update the list locally for immediate feedback, then send to backend.
    const updatedList = [newStaff, ...staffList];
    setStaffList(updatedList);
    createStaff(newStaff).then(() => fetchData());
    
    // Clear new docente state
    setNewDocente({ cedula: '', nombres: '', apellidos: '' });
    setIsAddDocenteModalOpen(false);
  };

  // --- LÓGICA DE VALIDACIÓN DE MATERIAS ---
  const handleOpenValidate = (staff) => {
    setStaffToValidate(staff);
    const currentPeriod = `${new Date().getFullYear()}-${new Date().getMonth() < 6 ? 'I' : 'II'}`;
    setValidationForm({
      periodoAcademico: staff.periodoAcademico || currentPeriod,
      semanas: staff.semanas || 15,
      fechaDesde: staff.fechaDesde || '',
      fechaHasta: staff.fechaHasta || ''
    });
    if (staff.materias && staff.materias.length > 0) {
      setMateriasForm(staff.materias);
    } else {
      setMateriasForm([{ nombre: '', horasSemanal: 0, horasLapso: 0 }]);
    }
  };

  const handleValidationFormChange = (e) => {
    const { name, value } = e.target;
    setValidationForm({ ...validationForm, [name]: value });

    if (name === 'semanas') {
      const newSemanas = parseInt(value) || 0;
      setMateriasForm(materiasForm.map(mat => ({
        ...mat,
        horasLapso: (parseInt(mat.horasSemanal) || 0) * newSemanas
      })));
    }
  };

  const handleMateriaChange = (index, field, value) => {
    const newMaterias = [...materiasForm];
    newMaterias[index] = { ...newMaterias[index], [field]: value };
    
    if (field === 'horasSemanal') {
      const semanas = parseInt(validationForm.semanas) || 0;
      newMaterias[index].horasLapso = (parseInt(value) || 0) * semanas;
    }
    
    setMateriasForm(newMaterias);
  };

  const addMateria = () => {
    setMateriasForm([...materiasForm, { nombre: '', horasSemanal: 0, horasLapso: 0 }]);
  };

  const removeMateria = (index) => {
    const newMaterias = materiasForm.filter((_, i) => i !== index);
    setMateriasForm(newMaterias);
  };

  const handleSaveValidation = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!staffToValidate) return;
    
    // Filtrar materias vacías para no enviar "fantasmas" a la base de datos
    const cleanMaterias = materiasForm.filter(m => m.nombre && m.nombre.trim() !== '');
    
    console.log("Guardando validación para:", staffToValidate.cedula, validationForm, cleanMaterias);
    try {
      const updatedList = staffList.map(staff => {
        if (staff.cedula === staffToValidate.cedula) {
          return { 
            ...staff, 
            ...validationForm,
            materias: cleanMaterias, 
            status: 'Activo' 
          };
        }
        return staff;
      });
      setStaffList(updatedList);
      
      const res = await updateStaffCarga(staffToValidate.cedula, cleanMaterias, 'Activo', validationForm);
      if (res) {
        // Refrescar para asegurar sincronización con MySQL
        fetchData();
      } else {
        alert("Hubo un error al guardar en la base de datos. Verifica la conexión.");
      }
    } catch (error) {
      console.error("Error saving validation:", error);
    } finally {
      setStaffToValidate(null);
    }
  };

  const handleAddMateriaGlobal = async () => {
    const newName = window.prompt("Ingrese el nombre exacto de la NUEVA MATERIA para agregar al catálogo general del sistema:");
    if (newName && newName.trim().length > 0) {
      const res = await addMateriaCatalogo(newName.trim());
      if (res && res.success) {
        const catalogo = await getCatalogoMaterias();
        setCursosList(catalogo);
        alert(`La materia "${res.nombre}" fue agregada exitosamente al catálogo global.`);
      } else {
        alert("Ocurrió un error o la materia ya existe.");
      }
    }
  };

  const filteredStaff = useMemo(() => {
    return staffList.filter(staff => {
      const matchesDept = staff.department === currentDept;
      const searchLower = debouncedSearchTerm.toLowerCase();
      const fullName = `${staff.nombres} ${staff.apellidos}`.toLowerCase();
      const ci = staff.cedula?.toLowerCase() || '';
      
      return matchesDept && (fullName.includes(searchLower) || ci.includes(searchLower));
    }).sort((a, b) => {
      const numA = parseInt(a.cedula?.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.cedula?.replace(/\D/g, '')) || 0;
      return numA - numB;
    });
  }, [staffList, currentDept, debouncedSearchTerm]);

  if (staffToPrint) {
    return <PrintableFicha staff={staffToPrint} onBack={() => setStaffToPrint(null)} />;
  }

  return (
    <div className="animate-fade-in">
      <div style={{
        background: `linear-gradient(135deg, ${theme.bg} 0%, rgba(255,255,255,0) 100%)`,
        border: `1px solid ${theme.bg}`,
        borderLeft: `5px solid ${theme.color}`,
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ 
            background: theme.color, color: 'white', width: '60px', height: '60px', 
            borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 10px ${theme.color}40`
          }}>
            {theme.icon}
          </div>
          <div>
            <h1 style={{ margin: 0, color: 'var(--text-main)', fontSize: '2rem' }}>{currentDept}</h1>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500 }}>
              Gestión y Autorización de docentes contratados
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={() => {
            const validatedStaff = filteredStaff.filter(staff => staff.status !== 'Por Revisar');
            
            if (validatedStaff.length === 0) {
              alert('No hay docentes con información validada para exportar en este departamento.');
              return;
            }

            const worksheet = XLSX.utils.json_to_sheet(validatedStaff.map(staff => ({
              Cédula: staff.cedula,
              Nombres: staff.nombres,
              Apellidos: staff.apellidos,
              Teléfonos: staff.telefonos || 'N/A',
              Correo: staff.correo || 'N/A',
              Dirección: staff.direccion || 'N/A',
              'Títulos Pregrado': staff.titulosPregrado || 'N/A',
              'Títulos Postgrado': staff.titulosPostgrado || 'N/A',
              'Doctorado': staff.doctorado || 'N/A',
              'Categoría Docente': staff.categoriaDocente || 'N/A',
              'Dedicación': staff.dedicacion || 'N/A',
              'Materias Asignadas': staff.materias && staff.materias.length > 0 
                ? staff.materias.map(m => `${m.nombre} (${m.horasSemanal}h)`).join('; ') 
                : 'Sin materias asignadas',
              'Vigencia Desde': staff.fechaDesde || 'N/A',
              'Vigencia Hasta': staff.fechaHasta || 'N/A',
              Estado: staff.status
            })));
            
            const headerStyle = {
              font: { bold: true, color: { rgb: "FFFFFF" } },
              fill: { fgColor: { rgb: "2563EB" } },
              border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } }
              },
              alignment: { horizontal: "center", vertical: "center" }
            };
            
            const cellStyle = {
              border: {
                top: { style: "thin", color: { rgb: "CBD5E1" } },
                bottom: { style: "thin", color: { rgb: "CBD5E1" } },
                left: { style: "thin", color: { rgb: "CBD5E1" } },
                right: { style: "thin", color: { rgb: "CBD5E1" } }
              },
              alignment: { vertical: "center", wrapText: true }
            };

            const range = XLSX.utils.decode_range(worksheet['!ref']);
            for (let R = range.s.r; R <= range.e.r; ++R) {
              for (let C = range.s.c; C <= range.e.c; ++C) {
                const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
                if (!worksheet[cellRef]) continue;
                if (R === 0) {
                  worksheet[cellRef].s = headerStyle;
                } else {
                  worksheet[cellRef].s = cellStyle;
                }
              }
            }
            
            worksheet['!cols'] = [
              { wch: 12 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, 
              { wch: 30 }, { wch: 25 }, { wch: 25 }, { wch: 15 }, 
              { wch: 20 }, { wch: 45 }, { wch: 15 }, { wch: 15 }, { wch: 12 }
            ];

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Docentes');
            XLSX.writeFile(workbook, `Docentes_${currentDept}.xlsx`);
          }}>
            <Printer size={18} />
            <span>Exportar a Excel</span>
          </button>
          {user?.role === 'JEFE' && (
            <>
              <button className="btn btn-outline" onClick={() => document.getElementById('excelUpload').click()}>
                <Upload size={18} />
                <span>Carga Masiva (Excel)</span>
              </button>
              <input 
                type="file" 
                id="excelUpload" 
                accept=".xlsx, .xls" 
                style={{ display: 'none' }} 
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (evt) => {
                    try {
                      const bstr = evt.target.result;
                      const workbook = XLSX.read(bstr, { type: 'binary' });
                      const ws = workbook.Sheets[workbook.SheetNames[0]];
                      const data = XLSX.utils.sheet_to_json(ws);
                      
                      let updatedList = [...staffList];
                      let changes = 0;
                      
                      data.forEach(row => {
                        const cedula = String(row.Cedula || row.cedula || row.Cédula || '').trim();
                        const materia = String(row.Materia || row.materia || row.Curso || row.nom_Curso || '').trim();
                        const horasS = parseInt(row.Horas_Semanal || row.horas_semanales || 0);
                        const horasL = parseInt(row.Horas_Lapso || row.horas_lapso || 0);
                        
                        if (cedula && materia) {
                          const staffIndex = updatedList.findIndex(s => s.cedula === cedula);
                          if (staffIndex !== -1) {
                            const staff = updatedList[staffIndex];
                            if (!staff.materias) staff.materias = [];
                            
                            // Check if materia already exists
                            const existing = staff.materias.find(m => m.nombre === materia);
                            if (!existing) {
                              staff.materias.push({ nombre: materia, horasSemanal: horasS, horasLapso: horasL });
                              staff.status = 'Activo';
                              changes++;
                            }
                          }
                        }
                      });
                      
                      if (changes > 0) {
                        setStaffList(updatedList);
                        fetch('http://localhost:3001/api/migrate', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ docentes: updatedList })
                        }).then(() => fetchData());
                        alert(`Se han asignado ${changes} materias correctamente a los docentes correspondientes.`);
                      } else {
                        alert('No se encontraron coincidencias o los docentes ya tenían esas materias asignadas.');
                      }
                    } catch (error) {
                      console.error(error);
                      alert('Error al leer el archivo Excel. Asegúrese de que tenga las columnas: Cedula, Materia, Horas_Semanal, Horas_Lapso.');
                    }
                    e.target.value = '';
                  };
                  reader.readAsBinaryString(file);
                }} 
              />
              <button className="btn btn-primary" onClick={() => setIsAddDocenteModalOpen(true)} style={{ background: theme.color, borderColor: theme.color }}>
                <Plus size={18} />
                <span>Ingresar Docente</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        {/* Lista Principal de Docentes */}
        <div className="surface" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Fichas de Docentes</h3>
          <div className="filters-bar" style={{ justifyContent: 'flex-start' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
              <Search size={18} className="text-muted" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                className="filter-input" 
                placeholder="Buscar docente por nombre o cédula..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div className="table-container table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Docente</th>
                  <th>Títulos</th>
                  <th>Materias Asignadas</th>
                  <th>Vigencia</th>
                  <th>Estado Ficha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.length > 0 ? (
                  filteredStaff.map(staff => {
                    const isPending = staff.status === 'Por Revisar';
                    return (
                      <tr key={staff.id}>
                        <td>
                          <div className="user-name">{staff.apellidos}, {staff.nombres}</div>
                          <div className="user-email">C.I: {staff.cedula}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{staff.titulosPregrado}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{staff.categoriaDocente}</div>
                        </td>
                        <td style={{ fontSize: '0.85rem', maxWidth: '250px' }}>
                          {staff.materias && staff.materias.length > 0 ? (
                            <ul style={{ margin: 0, paddingLeft: '1rem', color: 'var(--text-main)' }}>
                              {staff.materias.map((m, i) => (
                                <li key={i}>{m.nombre} <strong style={{ color: 'var(--primary)' }}>({m.horasSemanal}h)</strong></li>
                              ))}
                            </ul>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Sin materias asignadas</span>
                          )}
                        </td>
                        <td>
                          <div>{staff.fechaDesde || 'N/A'} al {staff.fechaHasta || 'N/A'}</div>
                        </td>
                        <td>
                          <span className={`badge ${isPending ? 'badge-warning' : 'badge-success'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            {isPending ? <Clock size={14} /> : <CheckSquare size={14} />}
                            {isPending ? 'Requiere Materias' : 'Validado'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {user?.role === 'JEFE' && (
                              <button 
                                className="btn btn-primary" 
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                                onClick={() => handleOpenValidate(staff)}
                                title={isPending ? "Cargar materias y validar" : "Modificar Carga Académica"}
                              >
                                {isPending ? <CheckSquare size={16} /> : <Calculator size={16} />} {isPending ? 'Cargar' : 'Modificar'}
                              </button>
                            )}
                            {!isPending && (
                              <>
                                <button 
                                  className="btn btn-outline" 
                                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                                  onClick={() => setStaffToView(staff)}
                                  title="Ver toda la información"
                                >
                                  <Eye size={16} />
                                </button>
                                <button 
                                  className="btn btn-primary" 
                                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                                  onClick={() => setStaffToPrint(staff)}
                                  title="Imprimir Ficha Completa"
                                >
                                  <Printer size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No hay docentes registrados en este departamento que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal para VALIDAR Y CARGAR MATERIAS (Jefe de Dpto) */}
      {staffToValidate && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="surface animate-fade-in" style={{ width: '98%', maxWidth: '1200px', maxHeight: '98vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--primary-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'white', padding: '0.5rem', borderRadius: '50%', color: 'var(--primary)' }}><CheckSquare size={28} /></div>
                <div>
                  <h2 style={{ marginBottom: 0, color: 'var(--primary-dark)' }}>Validación y Carga Académica</h2>
                  <div className="subtitle" style={{ color: 'var(--primary)' }}>{staffToValidate.nombres} {staffToValidate.apellidos} - C.I: {staffToValidate.cedula}</div>
                </div>
              </div>
              <button onClick={() => setStaffToValidate(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} className="text-muted" />
              </button>
            </div>
            
            <div style={{ overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '-0.5rem' }}>Verifique los datos básicos ingresados por el docente:</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', background: 'var(--bg-app)', padding: '1.5rem', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <div className="form-label">Datos Personales</div>
                  <div style={{ fontSize: '0.9rem' }}><strong>Teléfono:</strong> {staffToValidate.telefonos}</div>
                  <div style={{ fontSize: '0.9rem' }}><strong>Dirección:</strong> {staffToValidate.direccion}</div>
                </div>
                <div>
                  <div className="form-label">Perfil Académico</div>
                  <div style={{ fontSize: '0.9rem' }}><strong>Pregrado:</strong> {staffToValidate.titulosPregrado}</div>
                  <div style={{ fontSize: '0.9rem' }}><strong>Postgrado:</strong> {staffToValidate.titulosPostgrado || 'N/A'}</div>
                  <div style={{ fontSize: '0.9rem' }}><strong>Categoría:</strong> {staffToValidate.categoriaDocente}</div>
                </div>
              </div>

              <form id="validateForm" onSubmit={handleSaveValidation} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                <div style={{ overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* Asignación de Periodo y Vigencia por el Jefe */}
                  <div style={{ background: 'var(--primary-light)', padding: '1.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.05)' }}>
                    <h3 style={{ borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Período y Vigencia del Contrato</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
                      <div>
                        <label className="form-label" style={{ color: 'var(--primary-dark)' }}>Período Académico</label>
                        <select 
                          required 
                          name="periodoAcademico" 
                          value={validationForm.periodoAcademico} 
                          onChange={handleValidationFormChange} 
                          className="filter-select w-full"
                          style={{ background: 'white' }}
                        >
                          {academicPeriods.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="form-label" style={{ color: 'var(--primary-dark)' }}>Semanas</label>
                        <input type="number" name="semanas" value={validationForm.semanas} onChange={handleValidationFormChange} className="filter-input w-full" style={{ background: 'white' }} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div>
                        <label className="form-label">Fecha Desde</label>
                        <input type="date" name="fechaDesde" value={validationForm.fechaDesde} onChange={handleValidationFormChange} className="filter-input w-full" style={{ background: 'white' }} />
                      </div>
                      <div>
                        <label className="form-label">Fecha Hasta</label>
                        <input type="date" name="fechaHasta" value={validationForm.fechaHasta} onChange={handleValidationFormChange} className="filter-input w-full" style={{ background: 'white' }} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 style={{ borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Asignación de Materias (Oferta Académica)</h3>
                    <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Llene las materias que dictará este docente para que queden registradas digitalmente en la ficha final.</p>
                  
                    <div className="table-responsive">
                    <table style={{ width: '100%', marginBottom: '1rem', borderCollapse: 'collapse', minWidth: '500px' }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid var(--border-light)' }}>Materia / Unidad Curricular</th>
                          <th style={{ textAlign: 'center', padding: '0.5rem', borderBottom: '1px solid var(--border-light)', width: '120px' }}>Horas Semanal</th>
                          <th style={{ textAlign: 'center', padding: '0.5rem', borderBottom: '1px solid var(--border-light)', width: '120px' }}>Horas Lapso</th>
                          <th style={{ width: '50px' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {materiasForm.map((mat, index) => (
                          <tr key={index}>
                            <td style={{ padding: '0.5rem' }}>
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <select value={mat.nombre} onChange={(e) => handleMateriaChange(index, 'nombre', e.target.value)} className="filter-select w-full" style={{ flex: 1 }}>
                                  <option value="">Seleccione una materia...</option>
                                  {(Array.isArray(cursosList) ? cursosList : (cursosList?.default || [])).map((curso, idx) => (
                                    <option key={idx} value={curso}>{curso}</option>
                                  ))}
                                </select>
                              </div>
                            </td>
                            <td style={{ padding: '0.5rem' }}>
                              <input type="number" min="0" value={mat.horasSemanal} onChange={(e) => handleMateriaChange(index, 'horasSemanal', e.target.value)} className="filter-input w-full" style={{ textAlign: 'center' }} />
                            </td>
                            <td style={{ padding: '0.5rem' }}>
                              <input type="number" min="0" value={mat.horasLapso} onChange={(e) => handleMateriaChange(index, 'horasLapso', e.target.value)} className="filter-input w-full" style={{ textAlign: 'center' }} />
                            </td>
                            <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                              <button type="button" onClick={() => removeMateria(index)} className="btn btn-outline" style={{ padding: '0.3rem', color: 'var(--danger)', borderColor: 'var(--danger-bg)' }}>
                                <X size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                    <button type="button" className="btn btn-outline" onClick={addMateria} style={{ fontSize: '0.85rem' }}>
                      <Plus size={16} /> Añadir otra materia
                    </button>
                  </div>
                </div>
                
                <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: 'var(--bg-app)' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setStaffToValidate(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">
                    <CheckSquare size={18} /> Validar y Guardar Ficha
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}


      {/* Modal de Detalles del Docente (Solo Lectura) */}
      {staffToView && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="surface animate-fade-in" style={{ width: '98%', maxWidth: '1000px', maxHeight: '98vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'var(--primary-light)', padding: '0.5rem', borderRadius: '50%', color: 'var(--primary)' }}><User size={28} /></div>
                <div>
                  <h2 style={{ marginBottom: 0 }}>{staffToView.nombres} {staffToView.apellidos}</h2>
                  <div className="subtitle">C.I: {staffToView.cedula} | {staffToView.department}</div>
                </div>
              </div>
              <button onClick={() => setStaffToView(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} className="text-muted" />
              </button>
            </div>
            
            <div style={{ overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <div className="form-label">Periodo Académico</div>
                  <div style={{ fontWeight: 500 }}>{staffToView.periodoAcademico} ({staffToView.semanas} semanas)</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{staffToView.fechaDesde} al {staffToView.fechaHasta}</div>
                </div>
                <div>
                  <div className="form-label">Datos Personales</div>
                  <div style={{ fontSize: '0.9rem' }}><strong>Nacimiento:</strong> {staffToView.fechaNac}</div>
                  <div style={{ fontSize: '0.9rem' }}><strong>Teléfono:</strong> {staffToView.telefonos}</div>
                  <div style={{ fontSize: '0.9rem' }}><strong>Correo:</strong> {staffToView.correo}</div>
                  <div style={{ fontSize: '0.9rem' }}><strong>Dirección:</strong> {staffToView.direccion}</div>
                </div>
                <div>
                  <div className="form-label">Datos Bancarios</div>
                  <div style={{ fontSize: '0.9rem' }}><strong>Banco:</strong> {staffToView.banco}</div>
                  <div style={{ fontSize: '0.9rem' }}><strong>Cuenta:</strong> {staffToView.cuentaBancaria} ({staffToView.tipoCuenta})</div>
                </div>
                <div>
                  <div className="form-label">Perfil Académico</div>
                  <div style={{ fontSize: '0.9rem' }}><strong>Pregrado:</strong> {staffToView.titulosPregrado}</div>
                  <div style={{ fontSize: '0.9rem' }}><strong>Postgrado:</strong> {staffToView.titulosPostgrado || 'N/A'}</div>
                  <div style={{ fontSize: '0.9rem' }}><strong>Doctorado:</strong> {staffToView.doctorado || 'N/A'}</div>
                  <div style={{ fontSize: '0.9rem' }}><strong>Categoría:</strong> {staffToView.categoriaDocente}</div>
                  <div style={{ fontSize: '0.9rem' }}><strong>Dedicación:</strong> {staffToView.dedicacion}</div>
                </div>
              </div>

              {staffToView.materias && staffToView.materias.length > 0 && (
                <div>
                  <div className="form-label">Materias / Oferta Académica</div>
                  <div className="table-responsive" style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', minWidth: '400px' }}>
                      <thead style={{ background: 'var(--bg-app)' }}>
                        <tr>
                          <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid var(--border-light)' }}>Asignatura</th>
                          <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid var(--border-light)' }}>H. Semanales</th>
                          <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid var(--border-light)' }}>H. Lapso</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staffToView.materias.map((mat, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                            <td style={{ padding: '0.75rem' }}>{mat.nombre}</td>
                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>{mat.horasSemanal}</td>
                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>{mat.horasLapso}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: 'var(--bg-app)' }}>
              <button type="button" className="btn btn-outline" onClick={() => setStaffToView(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Ingresar Docente Manualmente */}
      {isAddDocenteModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
        }}>
          <div className="surface animate-fade-in" style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ marginBottom: 0 }}>Ingresar Nuevo Docente</h2>
                <div className="subtitle">Agregar a {currentDept}</div>
              </div>
              <button onClick={() => setIsAddDocenteModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} className="text-muted" />
              </button>
            </div>
            
            <div style={{ padding: '1.5rem' }}>
              <form id="addDocenteForm" onSubmit={handleAddDocenteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="form-label">Cédula de Identidad</label>
                  <input 
                    required 
                    type="text" 
                    value={newDocente.cedula} 
                    onChange={(e) => setNewDocente({...newDocente, cedula: e.target.value})} 
                    className="filter-input w-full" 
                    placeholder="Ej. V-12345678"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="form-label">Nombres</label>
                  <input 
                    required 
                    type="text" 
                    value={newDocente.nombres} 
                    onChange={(e) => setNewDocente({...newDocente, nombres: e.target.value})} 
                    className="filter-input w-full" 
                    placeholder="Ej. Juan Carlos"
                  />
                </div>
                <div>
                  <label className="form-label">Apellidos</label>
                  <input 
                    required 
                    type="text" 
                    value={newDocente.apellidos} 
                    onChange={(e) => setNewDocente({...newDocente, apellidos: e.target.value})} 
                    className="filter-input w-full" 
                    placeholder="Ej. Pérez Gómez"
                  />
                </div>
                <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  El docente será agregado a la lista y podrá asignarle materias inmediatamente. Luego, el docente podrá ingresar al portal público con esta cédula para completar sus datos bancarios y personales.
                </p>
              </form>
            </div>
            
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: 'var(--bg-app)' }}>
              <button type="button" className="btn btn-outline" onClick={() => setIsAddDocenteModalOpen(false)}>Cancelar</button>
              <button type="submit" form="addDocenteForm" className="btn btn-primary" style={{ background: theme.color, borderColor: theme.color }}>Registrar Docente</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .w-full { width: 100%; }
        .form-label { display: block; margin-bottom: 0.3rem; font-size: 0.85rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.03em; }
      `}</style>
    </div>
  );
};

export default StaffList;
