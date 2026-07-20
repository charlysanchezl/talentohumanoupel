async function test() {
  try {
    const res = await fetch('http://localhost:3001/api/docentes/carga', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cedula: 'V-13230490',
        materias: [{ nombre: 'NUEVA MATERIA DE PRUEBA', horasSemanal: 5, horasLapso: 10 }],
        status: 'Activo',
        periodoAcademico: '2025-II',
        semanas: 20,
        fechaDesde: '2025-01-01',
        fechaHasta: '2025-06-01'
      })
    });
    console.log("Status:", res.status);
    console.log("Response:", await res.json());
  } catch(e) {
    console.error(e);
  }
}

test();
