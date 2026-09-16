const Persona = require('./Persona');

class Profesor extends Persona {
  #dias;
  #horarios;

  constructor(id, nombre, apellido, sucursal, dias, horarios) {
    super(id, nombre, apellido, sucursal);
    this.#dias = dias;
    this.#horarios = horarios;
  }

  get disponibilidad() {
    return `${this.#dias.join(', ')} (${this.#horarios.join(', ')})`;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      dias: this.#dias,
      horarios: this.#horarios
    };
  }
}

module.exports = Profesor;
