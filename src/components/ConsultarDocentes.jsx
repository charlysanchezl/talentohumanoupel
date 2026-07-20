import React, { useState, useEffect, useMemo } from 'react';
import { Search, Eye, Printer, Users, CheckSquare, Clock, Edit, Trash2, X, Plus, Calculator } from 'lucide-react';
import { getStaffData, getCurrentUser, createStaff, deleteStaff, updateStaffCarga, getCatalogoMaterias, addMateriaCatalogo } from '../data';
import PrintableFicha from './PrintableFicha';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const ConsultarDocentes = () => {
  const [staffList, setStaffList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [staffToView, setStaffToView] = useState(null);
  const [staffToEdit, setStaffToEdit] = useState(null);
  const [staffToPrint, setStaffToPrint] = useState(null);
  const [staffToValidate, setStaffToValidate] = useState(null);
  const [validationForm, setValidationForm] = useState({
    periodoAcademico: '', semanas: 15, fechaDesde: '', fechaHasta: ''
  });
  
  const academicPeriods = useMemo(() => {
    const year = new Date().getFullYear();
    return [
      `${year}-I`, `${year}-II`,
      `${year + 1}-I`, `${year + 1}-II`,
      `${year + 2}-I`, `${year + 2}-II`
    ];
  }, []);
  const [materiasForm, setMateriasForm] = useState([]);
  const [cursosList, setCursosList] = useState([]);
  const user = getCurrentUser();
  
  useEffect(() => {
    const fetchData = async () => {
      const data = await getStaffData();
      setStaffList(data);
      const catalogo = await getCatalogoMaterias();
      setCursosList(catalogo);
    };
    fetchData();
  }, []);

  // Filtrar y ordenar
  const filteredAndSortedStaff = useMemo(() => {
    return staffList
      .filter(staff => {
        // Si es jefe, solo puede ver su departamento
        if (user && user.role === 'JEFE' && staff.department !== user.department) {
          return false;
        }
        const term = debouncedSearchTerm.toLowerCase();
        const name = `${staff.nombres} ${staff.apellidos}`.toLowerCase();
        const ci = staff.cedula?.toLowerCase() || '';
        return name.includes(term) || ci.includes(term);
      })
      .sort((a, b) => {
        // Ordenar por departamento (alfabéticamente)
        if (a.department < b.department) return -1;
        if (a.department > b.department) return 1;
        
        // Si son del mismo departamento, ordenar numéricamente por cédula
        const numA = parseInt(a.cedula?.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.cedula?.replace(/\D/g, '')) || 0;
        return numA - numB;
      });
  }, [staffList, debouncedSearchTerm, user]);

  if (staffToPrint) {
    return <PrintableFicha staff={staffToPrint} onBack={() => setStaffToPrint(null)} />;
  }

  const handleEditChange = (e) => {
    setStaffToEdit({ ...staffToEdit, [e.target.name]: e.target.value });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (staffToEdit) {
      await createStaff(staffToEdit); // This will UPSERT in the backend
      const data = await getStaffData();
      setStaffList(data);
      setStaffToEdit(null);
    }
  };

  const handleDelete = async (staff) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar permanentemente al docente ${staff.nombres} ${staff.apellidos} (C.I: ${staff.cedula})?`)) {
      const success = await deleteStaff(staff.cedula);
      if (success) {
        setStaffList(staffList.filter(s => s.cedula !== staff.cedula));
      } else {
        alert("Hubo un error al intentar eliminar al docente.");
      }
    }
  };

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
    try {
      const updatedList = staffList.map(staff => {
        if (staff.cedula === staffToValidate.cedula) {
          return { 
            ...staff, 
            ...validationForm,
            materias: materiasForm, 
            status: staff.status === 'Por Revisar' ? 'Activo' : staff.status
          };
        }
        return staff;
      });
      setStaffList(updatedList);
      await updateStaffCarga(staffToValidate.cedula, materiasForm, staffToValidate.status === 'Por Revisar' ? 'Activo' : staffToValidate.status, validationForm);
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

  return (
    <div className="animate-fade-in">
      <div style={{
        background: `linear-gradient(135deg, var(--primary-light) 0%, rgba(255,255,255,0) 100%)`,
        border: `1px solid var(--border-light)`,
        borderLeft: `5px solid var(--primary)`,
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ 
            background: 'var(--primary)', color: 'white', width: '60px', height: '60px', 
            borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 10px rgba(0,0,0,0.1)`
          }}>
            <Users size={32} />
          </div>
          <div>
            <h1 style={{ margin: 0, color: 'var(--primary-dark)', fontSize: '2rem' }}>Consultar Docentes</h1>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500 }}>
              Directorio general de docentes contratados {user?.role === 'JEFE' ? `(${user.department})` : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="surface" style={{ padding: '1.5rem' }}>
        <div className="filters-bar" style={{ justifyContent: 'flex-start', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
            <Search size={18} className="text-muted" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              className="filter-input" 
              placeholder="Consultar docente por Cédula de Identidad o Nombre..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.5rem', fontSize: '1rem' }}
              autoFocus
            />
          </div>
          <div style={{ marginLeft: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Mostrando <strong>{filteredAndSortedStaff.length}</strong> resultados ordenados por departamento
          </div>
        </div>

        <div className="table-container table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Departamento</th>
                <th>Cédula</th>
                <th>Docente</th>
                <th>Estado Ficha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedStaff.length > 0 ? (
                filteredAndSortedStaff.map(staff => {
                  const isPending = staff.status === 'Por Revisar';
                  return (
                    <tr key={staff.id}>
                      <td style={{ fontWeight: 600, color: 'var(--primary-dark)' }}>
                        {staff.department}
                      </td>
                      <td style={{ fontWeight: 500 }}>
                        {staff.cedula}
                      </td>
                      <td>
                        <div className="user-name">{staff.apellidos}, {staff.nombres}</div>
                      </td>
                      <td>
                        <span className={`badge ${isPending ? 'badge-warning' : (staff.status === 'Inactivo' ? 'badge-danger' : 'badge-success')}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          {isPending ? <Clock size={14} /> : <CheckSquare size={14} />}
                          {staff.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className="btn btn-outline" 
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                            onClick={() => setStaffToView(staff)}
                            title="Ver toda la información"
                          >
                            <Eye size={16} /> Ver
                          </button>
                          {user?.role === 'ADMIN' && (
                            <>
                              <button 
                                className="btn btn-outline" 
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', color: 'var(--primary)', borderColor: 'var(--primary)' }}
                                onClick={() => setStaffToEdit(staff)}
                                title="Editar Datos Básicos"
                              >
                                <Edit size={16} /> Editar
                              </button>
                              <button 
                                className="btn btn-outline" 
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', color: 'var(--secondary-dark)', borderColor: 'var(--secondary-dark)' }}
                                onClick={() => handleOpenValidate(staff)}
                                title="Modificar Materias y Carga"
                              >
                                <CheckSquare size={16} /> Materias
                              </button>
                              <button 
                                className="btn btn-outline" 
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', color: '#dc2626', borderColor: '#dc2626' }}
                                onClick={() => handleDelete(staff)}
                                title="Eliminar Docente"
                              >
                                <Trash2 size={16} /> Eliminar
                              </button>
                            </>
                          )}
                          {!isPending && (
                            <button 
                              className="btn btn-primary" 
                              style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                              onClick={() => setStaffToPrint(staff)}
                              title="Imprimir Ficha Completa"
                            >
                              <Printer size={16} /> Ficha
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No se encontraron docentes con la cédula o nombre ingresado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalles del Docente (Solo Lectura) */}
      {staffToView && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="surface animate-fade-in" style={{ width: '98%', maxWidth: '1000px', maxHeight: '98vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ marginBottom: 0 }}>{staffToView.nombres} {staffToView.apellidos}</h2>
                <div className="subtitle">C.I: {staffToView.cedula} | {staffToView.department}</div>
              </div>
              <button onClick={() => setStaffToView(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>&times;</span>
              </button>
            </div>
            
            <div style={{ overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <div className="form-label" style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Periodo Académico</div>
                  <div style={{ fontWeight: 500 }}>{staffToView.periodoAcademico} ({staffToView.semanas} semanas)</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{staffToView.fechaDesde} al {staffToView.fechaHasta}</div>
                </div>
                <div>
                  <div className="form-label" style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Datos Personales</div>
                  <div style={{ fontSize: '0.9rem' }}><strong>Nacimiento:</strong> {staffToView.fechaNac}</div>
                  <div style={{ fontSize: '0.9rem' }}><strong>Teléfono:</strong> {staffToView.telefonos}</div>
                  <div style={{ fontSize: '0.9rem' }}><strong>Correo:</strong> {staffToView.correo}</div>
                  <div style={{ fontSize: '0.9rem' }}><strong>Dirección:</strong> {staffToView.direccion}</div>
                </div>
                <div>
                  <div className="form-label" style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Datos Bancarios</div>
                  <div style={{ fontSize: '0.9rem' }}><strong>Banco:</strong> {staffToView.banco}</div>
                  <div style={{ fontSize: '0.9rem' }}><strong>Cuenta:</strong> {staffToView.cuentaBancaria} ({staffToView.tipoCuenta})</div>
                </div>
                <div>
                  <div className="form-label" style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Perfil Académico</div>
                  <div style={{ fontSize: '0.9rem' }}><strong>Pregrado:</strong> {staffToView.titulosPregrado}</div>
                  <div style={{ fontSize: '0.9rem' }}><strong>Postgrado:</strong> {staffToView.titulosPostgrado || 'N/A'}</div>
                  <div style={{ fontSize: '0.9rem' }}><strong>Categoría:</strong> {staffToView.categoriaDocente}</div>
                  <div style={{ fontSize: '0.9rem' }}><strong>Dedicación:</strong> {staffToView.dedicacion}</div>
                </div>
              </div>

              {staffToView.materias && staffToView.materias.length > 0 && (
                <div>
                  <div className="form-label" style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Materias / Oferta Académica</div>
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

      {/* Modal para Editar Docente (Solo Admin) */}
      {staffToEdit && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="surface animate-fade-in" style={{ width: '98%', maxWidth: '800px', maxHeight: '98vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ marginBottom: 0 }}>Editar Datos Personales</h2>
                <div className="subtitle">C.I: {staffToEdit.cedula}</div>
              </div>
              <button onClick={() => setStaffToEdit(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>&times;</span>
              </button>
            </div>
            
            <form onSubmit={handleSaveEdit} style={{ overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label className="form-label">Nombres</label>
                  <input type="text" name="nombres" value={staffToEdit.nombres || ''} onChange={handleEditChange} className="filter-input w-full" required />
                </div>
                <div>
                  <label className="form-label">Apellidos</label>
                  <input type="text" name="apellidos" value={staffToEdit.apellidos || ''} onChange={handleEditChange} className="filter-input w-full" required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label className="form-label">Teléfonos</label>
                  <input type="text" name="telefonos" value={staffToEdit.telefonos || ''} onChange={handleEditChange} className="filter-input w-full" />
                </div>
                <div>
                  <label className="form-label">Departamento</label>
                  <select name="department" value={staffToEdit.department || ''} onChange={handleEditChange} className="filter-select w-full" required>
                    <option value="Matemáticas">Matemáticas</option>
                    <option value="Pedagogía">Pedagogía</option>
                    <option value="Agroindustrial">Agroindustrial</option>
                    <option value="Ciencias Sociales">Ciencias Sociales</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Dirección</label>
                <input type="text" name="direccion" value={staffToEdit.direccion || ''} onChange={handleEditChange} className="filter-input w-full" />
              </div>

              <div style={{ padding: '1rem', background: '#fffbeb', color: '#92400e', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
                <strong>Nota:</strong> Como administrador, puedes corregir errores tipográficos en el nombre, apellido, departamento o contacto del docente. No se permite cambiar la cédula ya que es el identificador único. Si la cédula es incorrecta, se debe registrar al docente nuevamente.
              </div>
              
              <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setStaffToEdit(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}


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

              <form id="validateForm" onSubmit={handleSaveValidation} style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Asignación de Periodo y Vigencia por el Jefe */}
                <div style={{ background: 'var(--primary-light)', padding: '1.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <h3 style={{ borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Período y Vigencia del Contrato</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
                    <div>
                      <label className="form-label" style={{ color: 'var(--primary-dark)' }}>Período Académico</label>
                      <select name="periodoAcademico" value={validationForm.periodoAcademico} onChange={handleValidationFormChange} className="filter-select w-full" style={{ background: 'white' }}>
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
                  <Plus size={16} /> Añadir otra materia a este docente
                </button>
                </div>
              </form>
            </div>
            
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: 'var(--bg-app)' }}>
              <button type="button" className="btn btn-outline" onClick={() => setStaffToValidate(null)}>Cancelar</button>
              <button type="button" className="btn btn-primary" onClick={handleSaveValidation}>
                <CheckSquare size={18} /> Validar y Guardar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ConsultarDocentes;
