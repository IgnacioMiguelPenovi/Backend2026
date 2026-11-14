document.addEventListener('DOMContentLoaded', () => {
  const sucursalSelect = document.getElementById('sucursalTurno');
  const busquedaInput = document.getElementById('buscarAlumno');
  const alumnoSelect = document.getElementById('alumnoSelect');
  const fechaInput = document.getElementById('fecha');
  const horarioSelect = document.getElementById('turnoHorario');

  // --- 1. LÓGICA DE FILTRADO Y AUTOCOMPLETADO DE ALUMNOS (Para equipo/empleados/admin) ---
  if (alumnoSelect) {
    let todosLosAlumnos = [];
    try {
      todosLosAlumnos = JSON.parse(alumnoSelect.dataset.alumnos || '[]');
    } catch (e) {
      console.error('Error al parsear alumnos:', e);
    }
    const alumnoInicialId = alumnoSelect.dataset.inicial || '';

    const normalizar = (texto) => (texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

    const actualizarAlumnos = (conservarSeleccion = false) => {
      const sucursalSeleccionada = sucursalSelect ? sucursalSelect.value : '';
      const termino = normalizar(busquedaInput ? busquedaInput.value : '');
      const valorActual = conservarSeleccion ? alumnoSelect.value : (alumnoInicialId || '');

      alumnoSelect.innerHTML = '';

      if (!sucursalSeleccionada) {
        alumnoSelect.disabled = true;
        if (busquedaInput) busquedaInput.disabled = true;
        const opt = document.createElement('option');
        opt.value = '';
        opt.disabled = true;
        opt.selected = true;
        opt.textContent = 'Primero seleccioná una sucursal';
        alumnoSelect.appendChild(opt);
        return;
      }

      alumnoSelect.disabled = false;
      if (busquedaInput) busquedaInput.disabled = false;

      const alumnosFiltrados = todosLosAlumnos.filter((a) => {
        const coincideSucursal = normalizar(a.sucursal) === normalizar(sucursalSeleccionada);
        const textoCompleto = normalizar(`${a.apellido} ${a.nombre} ${a.nombre} ${a.apellido}`);
        const coincideBusqueda = !termino || textoCompleto.includes(termino);
        return coincideSucursal && coincideBusqueda;
      });

      if (alumnosFiltrados.length === 0) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.disabled = true;
        opt.selected = true;
        opt.textContent = termino 
          ? 'No hay alumnos que coincidan con la búsqueda'
          : 'No hay alumnos registrados en esta sucursal';
        alumnoSelect.appendChild(opt);
        return;
      }

      const optDefault = document.createElement('option');
      optDefault.value = '';
      optDefault.disabled = true;
      optDefault.selected = !valorActual;
      optDefault.textContent = 'Seleccioná un alumno';
      alumnoSelect.appendChild(optDefault);

      let seleccionado = false;
      alumnosFiltrados.forEach((a) => {
        const opt = document.createElement('option');
        opt.value = a.id;
        opt.textContent = `${a.apellido}, ${a.nombre}`;
        if (valorActual && String(a.id) === String(valorActual)) {
          opt.selected = true;
          seleccionado = true;
        }
        alumnoSelect.appendChild(opt);
      });

      if (!seleccionado && alumnosFiltrados.length === 1 && termino) {
        alumnoSelect.value = alumnosFiltrados[0].id;
      }
    };

    if (sucursalSelect) {
      sucursalSelect.addEventListener('change', () => {
        if (busquedaInput) busquedaInput.value = '';
        actualizarAlumnos(false);
        actualizarDisponibilidadHorarios();
      });
    }

    if (busquedaInput) {
      busquedaInput.addEventListener('input', () => {
        actualizarAlumnos(true);
      });
    }

    actualizarAlumnos(false);
  } else if (sucursalSelect) {
    sucursalSelect.addEventListener('change', () => {
      actualizarDisponibilidadHorarios();
    });
  }

  // --- 2. LÓGICA DE CONSULTA EN TIEMPO REAL DE DISPONIBILIDAD DE CUPOS ---
  async function actualizarDisponibilidadHorarios() {
    if (!fechaInput || !horarioSelect) return;

    const fecha = fechaInput.value;
    const sucursal = sucursalSelect ? sucursalSelect.value : '';

    if (!fecha) return;

    try {
      const url = `/disponibilidad?fecha=${encodeURIComponent(fecha)}${sucursal ? `&sucursal=${encodeURIComponent(sucursal)}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) return;

      const data = await res.json();
      const ocupacion = data.ocupacion || {};
      const cupoMaximo = data.cupoMaximo || 8;
      const horarioSeleccionadoActual = horarioSelect.value || horarioSelect.dataset.horarioInicial || '';

      Array.from(horarioSelect.options).forEach(option => {
        if (!option.value) return; // Saltear la opción por defecto ("Seleccioná un horario")

        const h = option.value;
        const ocupados = ocupacion[h] || 0;
        const disponibles = Math.max(0, cupoMaximo - ocupados);

        if (disponibles <= 0) {
          option.disabled = true;
          option.textContent = `${h} hs (Sin cupo - 0/${cupoMaximo})`;
          if (option.selected) {
            option.selected = false;
            horarioSelect.value = '';
          }
        } else {
          option.disabled = false;
          option.textContent = `${h} hs (${disponibles} cupos libre${disponibles !== 1 ? 's' : ''})`;
          if (h === horarioSeleccionadoActual) {
            option.selected = true;
          }
        }
      });
    } catch (err) {
      console.error('Error al consultar disponibilidad:', err);
    }
  }

  if (fechaInput) {
    fechaInput.addEventListener('change', actualizarDisponibilidadHorarios);
    if (fechaInput.value) {
      actualizarDisponibilidadHorarios();
    }
  }
});
