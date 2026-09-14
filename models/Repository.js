const fs = require('fs');

class Repository {
  #filePath;

  constructor(filePath) {
    this.#filePath = filePath;
  }

  leerTodos() {
    const contenido = fs.readFileSync(this.#filePath, 'utf-8');
    return JSON.parse(contenido);
  }

  guardarTodos(datos) {
    fs.writeFileSync(this.#filePath, JSON.stringify(datos, null, 2));
  }

  obtenerPorId(id) {
    const datos = this.leerTodos();
    return datos.find((item) => item.id === Number(id));
  }
}

module.exports = Repository;
