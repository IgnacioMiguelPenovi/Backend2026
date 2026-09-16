class Persona {
  #id;
  #nombre;
  #apellido;
  #sucursal;

  constructor(id, nombre, apellido, sucursal) {
    this.#id = Number(id);
    this.#nombre = nombre;
    this.#apellido = apellido;
    this.#sucursal = sucursal;
  }

  get id() {
    return this.#id;
  }

  get nombreCompleto() {
    return `${this.#nombre} ${this.#apellido}`;
  }

  toJSON() {
    return {
      id: this.#id,
      nombre: this.#nombre,
      apellido: this.#apellido,
      sucursal: this.#sucursal
    };
  }
}

module.exports = Persona;
