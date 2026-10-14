const Persona = require('./Persona');

class Alumno extends Persona {
  /*#turnoDia;
  #turnoHorario;*/
  #dni;
  #email;
  #telefono;
  #fechaNacimiento;

  constructor(id, nombre, apellido, sucursal, dni, email, telefono, fechaNacimiento) {
    super(id, nombre, apellido, sucursal);
    this.#dni = dni;
    this.#email = email;
    this.#telefono = telefono;
    this.#fechaNacimiento = fechaNacimiento;
  }

  /*get turno() {
    return `${this.#turnoDia} - ${this.#turnoHorario}`;
  }*/

  toJSON() {
    return {
      ...super.toJSON(),
      /*turnoDia: this.#turnoDia,
      turnoHorario: this.#turnoHorario */
      dni: this.#dni,
      email: this.#email,
      telefono: this.#telefono,
      fechaNacimiento: this.#fechaNacimiento
    };
  }
}

module.exports = Alumno;
