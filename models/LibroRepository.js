const path = require('path');
const Repository = require('./Repository');
const Libro = require('./Libro');

const RUTA_ARCHIVO = path.join(__dirname, '..', 'data', 'libros.json');

class LibroRepository extends Repository {
  constructor() {
    super(RUTA_ARCHIVO);
  }

  #siguienteId(libros) {
    if (libros.length === 0) return 1;
    return Math.max(...libros.map((libro) => libro.id)) + 1;
  }

  obtenerTodos() {
    return this.leerTodos();
  }

  obtenerPorCategoria(categoria) {
    return this.leerTodos().filter((libro) => libro.categoria === categoria);
  }

  crear(datos) {
    const libros = this.leerTodos();
    const nuevoLibro = new Libro(
      this.#siguienteId(libros),
      datos.titulo,
      datos.autor,
      datos.categoria,
      datos.anio
    );
    libros.push(nuevoLibro.toJSON());
    this.guardarTodos(libros);
    return nuevoLibro.toJSON();
  }

  actualizar(id, datos) {
    const libros = this.leerTodos();
    const indice = libros.findIndex((libro) => libro.id === Number(id));
    if (indice === -1) return null;
    libros[indice] = { ...libros[indice], ...datos, id: Number(id) };
    this.guardarTodos(libros);
    return libros[indice];
  }

  eliminar(id) {
    const libros = this.leerTodos();
    const libroExistente = libros.find((libro) => libro.id === Number(id));
    if (!libroExistente) return false;
    const librosRestantes = libros.filter((libro) => libro.id !== Number(id));
    this.guardarTodos(librosRestantes);
    return true;
  }
}

module.exports = LibroRepository;
