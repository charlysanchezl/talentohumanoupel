const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const BASE_URL = process.env.API_TEST_URL || 'http://127.0.0.1:3001';

describe('Suite de Pruebas de Regresión de API: Endpoints Clave', () => {

  it('GET /api/periodos - debe responder 200 y retornar lista de períodos con estados válidos', async () => {
    const res = await fetch(`${BASE_URL}/api/periodos`);
    assert.strictEqual(res.status, 200, 'El endpoint debe responder HTTP 200');
    
    const data = await res.json();
    assert.ok(Array.isArray(data), 'La respuesta debe ser un arreglo de períodos');
    assert.ok(data.length > 0, 'Debe existir al menos un período registrado');

    const primerPeriodo = data[0];
    assert.ok('id' in primerPeriodo, 'El período debe tener id');
    assert.ok('nombre' in primerPeriodo, 'El período debe tener nombre');
    assert.ok('estado' in primerPeriodo, 'El período debe tener estado');
    
    // Validar que el estado sea uno de los reconocidos por el sistema
    const estadosValidos = ['PLANIFICACION', 'ACTIVO', 'CERRADO'];
    assert.ok(estadosValidos.includes(primerPeriodo.estado), `Estado desconocido: ${primerPeriodo.estado}`);
  });

  it('GET /api/docentes - debe exigir autenticación JWT (HTTP 401 sin token)', async () => {
    const res = await fetch(`${BASE_URL}/api/docentes`);
    assert.strictEqual(res.status, 401, 'El endpoint protegido de docentes debe responder HTTP 401 sin token JWT');
  });

  it('GET /api/materias-catalogo - debe responder 200 y retornar el catálogo institucional de asignaturas', async () => {
    const res = await fetch(`${BASE_URL}/api/materias-catalogo`);
    assert.strictEqual(res.status, 200, 'El catálogo de materias debe responder HTTP 200');

    const data = await res.json();
    assert.ok(Array.isArray(data), 'La respuesta debe ser un arreglo de materias');
    assert.ok(data.length > 0, 'El catálogo institucional debe contener materias registradas');
  });

  it('POST /api/login - debe rechazar peticiones con credenciales vacías con HTTP 400 o 401', async () => {
    const res = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: '', password: '' })
    });
    
    assert.ok(
      res.status === 400 || res.status === 401,
      `Se esperaba 400 o 401 para credenciales inválidas, se obtuvo: ${res.status}`
    );
  });

  it('Rutas Inexistentes - debe responder 404 adecuadamente', async () => {
    const res = await fetch(`${BASE_URL}/api/ruta-que-no-existe-para-test`);
    assert.strictEqual(res.status, 404, 'Rutas desconocidas deben retornar 404');
  });

});
