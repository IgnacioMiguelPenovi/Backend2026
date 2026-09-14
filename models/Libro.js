class Libro {
  #id;
  #titulo;
  #autor;
  #categoria;
  #anio;

  constructor(id, titulo, autor, categoria, anio) {
    this.#id = Number(id);
    this.#titulo = titulo;
    this.#autor = autor;
    this.#categoria = categoria;
    this.#anio = Number(anio);
  }

  get id() {
    return this.#id;
  }

  get resumen() {
    return `${this.#titulo} (${this.#anio}) - ${this.#autor}`;
  }

  toJSON() {
    return {
      id: this.#id,
      titulo: this.#titulo,
      autor: this.#autor,
      categoria: this.#categoria,
      anio: this.#anio
    };
  }
}

module.exports = Libro;
