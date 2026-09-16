const path = require('path');
const Repository = require('./Repository');
const Profesor = require('./Profesor');

const RUTA_ARCHIVO = path.join(__dirname, '..', 'data', 'profesores.json');

class ProfesorRepository extends Repository {
  constructor() {
    super(RUTA_ARCHIVO);
  }

  #siguienteId(profesores) {
    if (profesores.length === 0) return 1;
    return Math.max(...profesores.map((profesor) => profesor.id)) + 1;
  }

  #normalizarLista(valor) {
    if (Array.isArray(valor)) return valor;
    if (!valor) return [];
    return [valor];
  }

  obtenerTodos() {
    return this.leerTodos();
  }

  crear(datos) {
    const profesores = this.leerTodos();
    const nuevoProfesor = new Profesor(
      this.#siguienteId(profesores),
      datos.nombre,
      datos.apellido,
      datos.sucursal,
      this.#normalizarLista(datos.dias),
      this.#normalizarLista(datos.horarios)
    );
    profesores.push(nuevoProfesor.toJSON());
    this.guardarTodos(profesores);
    return nuevoProfesor.toJSON();
  }

  actualizar(id, datos) {
    const profesores = this.leerTodos();
    const indice = profesores.findIndex((profesor) => profesor.id === Number(id));
    if (indice === -1) return null;
    profesores[indice] = {
      ...profesores[indice],
      ...datos,
      dias: this.#normalizarLista(datos.dias),
      horarios: this.#normalizarLista(datos.horarios),
      id: Number(id)
    };
    this.guardarTodos(profesores);
    return profesores[indice];
  }

  eliminar(id) {
    const profesores = this.leerTodos();
    const existe = profesores.some((profesor) => profesor.id === Number(id));
    if (!existe) return false;
    this.guardarTodos(profesores.filter((profesor) => profesor.id !== Number(id)));
    return true;
  }
}

module.exports = ProfesorRepository;
