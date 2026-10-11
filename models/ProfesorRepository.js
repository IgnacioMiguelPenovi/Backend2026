const mongoose = require('mongoose');
const Usuario = require('./UsuarioModel');

class ProfesorRepository {
  #normalizarLista(valor) {
    if (Array.isArray(valor)) return valor;
    if (!valor) return [];
    return [valor];
  }

  obtenerTodos() {
    return Usuario.find({ rol: 'profesor' }).lean();
  }

  obtenerPorId(id) {
    if (!mongoose.isValidObjectId(id)) return null;
    return Usuario.findOne({ _id: id, rol: 'profesor' }).lean();
  }

  crear(datos) {
    return Usuario.create({
      ...datos,
      rol: 'profesor',
      dias: this.#normalizarLista(datos.dias),
      horarios: this.#normalizarLista(datos.horarios)
    });
  }

  async actualizar(id, datos) {
    if (!mongoose.isValidObjectId(id)) return null;
    const profesor = await Usuario.findOne({ _id: id, rol: 'profesor' });
    if (!profesor) return null;
    profesor.set({
      ...datos,
      dias: this.#normalizarLista(datos.dias),
      horarios: this.#normalizarLista(datos.horarios)
    });
    await profesor.save();
    return profesor.toObject();
  }

  async eliminar(id) {
    if (!mongoose.isValidObjectId(id)) return false;
    const eliminado = await Usuario.findOneAndDelete({ _id: id, rol: 'profesor' });
    return eliminado !== null;
  }
}

module.exports = ProfesorRepository;