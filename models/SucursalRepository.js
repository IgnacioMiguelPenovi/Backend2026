const SucursalModel = require('./SucursalModel');

class SucursalRepository {
    
  async obtenerTodos() {
    try {
      return await SucursalModel.find({});
    } catch (error) {
      throw error;
    }
  }

  async obtenerPorId(id) {
    try {
      return await SucursalModel.findById(id);
    } catch (error) {
      throw error;
    }
  }

  async crear(datos) {
    try {
      return await SucursalModel.create(datos);
    } catch (error) {
      throw error;
    }
  }

  async actualizar(id, datos) {
    try {
      return await SucursalModel.findByIdAndUpdate(id, datos, { new: true });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = SucursalRepository;
