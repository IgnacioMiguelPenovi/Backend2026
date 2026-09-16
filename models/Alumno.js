const Persona = require('./Persona');

class Alumno extends Persona {
  #turnoDia;
  #turnoHorario;

  constructor(id, nombre, apellido, sucursal, turnoDia, turnoHorario) {
    super(id, nombre, apellido, sucursal);
    this.#turnoDia = turnoDia;
    this.#turnoHorario = turnoHorario;
  }

  get turno() {
    return `${this.#turnoDia} - ${this.#turnoHorario}`;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      turnoDia: this.#turnoDia,
      turnoHorario: this.#turnoHorario
    };
  }
}

module.exports = Alumno;
