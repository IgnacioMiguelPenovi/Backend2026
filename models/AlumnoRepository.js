const Alumno = require('./AlumnoModel');

class AlumnoRepository {
  obtenerTodos() {
    return Alumno.find().lean();
  }

  obtenerPorId(id) {
    return Alumno.findById(id).lean();
  }

  crear(datos) {
    return Alumno.create(datos);
  }

  actualizar(id, datos) {
    return Alumno.findByIdAndUpdate(id, datos, { new: true, runValidators: true }).lean();
  }

  async eliminar(id) {
    const eliminado = await Alumno.findByIdAndDelete(id);
    return eliminado !== null;
  }
}

module.exports = AlumnoRepository;