const Persona = require('./Persona');

class Profesor extends Persona {
  #dias;
  #horarios;
  #dni;
  #email;
  #telefono;
  #fechaNacimiento;

  constructor(id, nombre, apellido, sucursal, dias, horarios, dni, email, telefono, fechaNacimiento) {
    super(id, nombre, apellido, sucursal);
    this.#dias = dias;
    this.#horarios = horarios;
    this.#dni = dni;
    this.#email = email;
    this.#telefono = telefono;
    this.#fechaNacimiento = fechaNacimiento;
  }

  get disponibilidad() {
    return `${this.#dias.join(', ')} (${this.#horarios.join(', ')})`;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      dias: this.#dias,
      horarios: this.#horarios,
      dni: this.#dni,
      email: this.#email,
      telefono: this.#telefono,
      fechaNacimiento: this.#fechaNacimiento
    };
  }
}

module.exports = Profesor;
