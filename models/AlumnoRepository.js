const path = require('path');
const Repository = require('./Repository');
const Alumno = require('./Alumno');

const RUTA_ARCHIVO = path.join(__dirname, '..', 'data', 'alumnos.json');

class AlumnoRepository extends Repository {
  constructor() {
    super(RUTA_ARCHIVO);
  }

  #siguienteId(alumnos) {
    if (alumnos.length === 0) return 1;
    return Math.max(...alumnos.map((alumno) => alumno.id)) + 1;
  }

  obtenerTodos() {
    return this.leerTodos();
  }

  crear(datos) {
    const alumnos = this.leerTodos();
    const nuevoAlumno = new Alumno(
      this.#siguienteId(alumnos),
      datos.nombre,
      datos.apellido,
      datos.sucursal,
      datos.turnoDia,
      datos.turnoHorario
    );
    alumnos.push(nuevoAlumno.toJSON());
    this.guardarTodos(alumnos);
    return nuevoAlumno.toJSON();
  }

  actualizar(id, datos) {
    const alumnos = this.leerTodos();
    const indice = alumnos.findIndex((alumno) => alumno.id === Number(id));
    if (indice === -1) return null;
    alumnos[indice] = { ...alumnos[indice], ...datos, id: Number(id) };
    this.guardarTodos(alumnos);
    return alumnos[indice];
  }

  eliminar(id) {
    const alumnos = this.leerTodos();
    const existe = alumnos.some((alumno) => alumno.id === Number(id));
    if (!existe) return false;
    this.guardarTodos(alumnos.filter((alumno) => alumno.id !== Number(id)));
    return true;
  }
}

module.exports = AlumnoRepository;
