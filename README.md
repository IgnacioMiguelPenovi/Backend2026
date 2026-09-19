# 🧘‍♀️ PilatesFlow Studios — Plataforma TurnoFlex

> **Desarrollo de Sistemas Web - Back End** | IFTS N° 29  
> **1° Entrega de Proyecto** — 2° Cuatrimestre 2026  
> **Cátedra:** Lic. García Ontiveros, Emir Eliezer  
> **Equipo / Empresa:** Código Base (Comisión B — Grupo N° 5)
> **Caso 1:** Plataforma de Gestión de Turnos y Atención "TurnoFlex"


---

## 📋 Descripción del Proyecto

**PilatesFlow Studios** (desarrollado sobre la plataforma de gestión **TurnoFlex**) es una solución backend construida con **Node.js** y **Express** para la administración centralizada de turnos, pases, alumnos y profesores en salas de Pilates. 

El sistema resuelve la gestión de reservas por sucursal (*Palermo*, *Belgrano*, *Caballito*), permitiendo operar tanto desde una **interfaz web renderizada dinámicamente con Pug** como a través de un servicio de **API REST** que responde en formato JSON.

---

## 🚀 Tecnologías y Herramientas

* **Entorno de Ejecución:** [Node.js](https://nodejs.org/) (v18+)
* **Framework Web:** [Express.js](https://expressjs.com/)
* **Motor de Plantillas:** [Pug](https://pugjs.org/)
* **Persistencia de Datos:** Archivos planos `.json` manipulados sincrónicamente con el módulo nativo `fs` (`readFileSync` y `writeFileSync`).
* **Paradigma:** Programación Orientada a Objetos (POO) con herencia y campos privados (`#`).
* **Arquitectura:** Modelo-Vista-Controlador (MVC) + API REST.
* **Middlewares:** `morgan`, `express.json()`, `express.urlencoded()`, logger de consola.
* **Herramientas de Desarrollo y Pruebas:** `nodemon`, Thunder Client.

---

## 📂 Estructura del Proyecto

```text
Backend2026/
├── config/
│   └── opciones.js           # Sucursales, días y grilla horaria
├── data/
│   ├── alumnos.json          # Persistencia en JSON de Alumnos
│   └── profesores.json       # Persistencia en JSON de Profesores
├── middlewares/
│   └── logger.js             # Middleware de registro de peticiones
├── models/
│   ├── Persona.js            # Clase base (Encapsulamiento POO)
│   ├── Alumno.js             # Clase derivada (extends Persona)
│   ├── Profesor.js           # Clase derivada (extends Persona)
│   ├── Repository.js         # Persistencia base con módulo fs
│   ├── AlumnoRepository.js   # Repositorio específico de Alumnos
│   └── ProfesorRepository.js # Repositorio específico de Profesores
├── routes/
│   ├── index.js              # Enrutador de portada
│   ├── alumnos.js            # Rutas web de Alumnos (Pug)
│   ├── profesores.js         # Rutas web de Profesores (Pug)
│   └── api/
│       ├── alumnos.js        # Endpoints API REST de Alumnos (JSON)
│       └── profesores.js     # Endpoints API REST de Profesores (JSON)
├── views/
│   ├── 404.pug
│   ├── alumnos/              # Plantillas Pug (listado, formulario, detalle)
│   └── profesores/           # Plantillas Pug (listado, formulario, detalle)
├── public/
│   └── css/                  # Estilos CSS estáticos
├── app.js                    # Servidor principal Express
├── package.json
└── README.md
```

---

## 🛠️ Instalación y Ejecución

### 1. Clonar el repositorio
```bash
git clone https://github.com/IgnacioMiguelPenovi/Backend2026.git
cd Backend2026
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Iniciar el servidor de desarrollo
```bash
npm run dev
```
Accedé a la aplicación en tu navegador en: `http://localhost:3000`

---

## 🔌 Endpoints de la API REST

### 🔹 Módulo Alumnos (`/api/alumnos`)

| Método | Endpoint | Descripción | Estado HTTP |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/alumnos` | Obtener el listado completo de alumnos en JSON | `200 OK` |
| **GET** | `/api/alumnos/:id` | Obtener un alumno específico por su ID | `200 OK` / `404 Not Found` |
| **POST** | `/api/alumnos` | Registrar un nuevo alumno | `201 Created` |
| **PUT** | `/api/alumnos/:id` | Actualizar datos de un alumno por ID | `200 OK` / `404 Not Found` |
| **DELETE**| `/api/alumnos/:id` | Eliminar un alumno por ID | `204 No Content` / `404 Not Found` |

#### Ejemplos de Payload (Body JSON) para `POST` / `PUT`:
```json
{
  "nombre": "Carolina",
  "apellido": "Smith",
  "sucursal": "Palermo",
  "turnoDia": "Lunes",
  "turnoHorario": "18.00"
}
```

---

### 🔹 Módulo Profesores (`/api/profesores`)

| Método | Endpoint | Descripción | Estado HTTP |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/profesores` | Obtener el listado completo de profesores | `200 OK` |
| **GET** | `/api/profesores/:id` | Obtener un profesor específico por ID | `200 OK` / `404 Not Found` |
| **POST** | `/api/profesores` | Registrar un nuevo profesor | `201 Created` |
| **PUT** | `/api/profesores/:id` | Actualizar disponibilidad de un profesor | `200 OK` / `404 Not Found` |
| **DELETE**| `/api/profesores/:id` | Eliminar un profesor por ID | `204 No Content` / `404 Not Found` |

#### Ejemplos de Payload (Body JSON) para `POST` / `PUT`:
```json
{
  "nombre": "Martín",
  "apellido": "López",
  "sucursal": "Belgrano",
  "dias": ["Lunes", "Miércoles", "Viernes"],
  "horarios": ["9.00", "10.00", "11.00"]
}
```

---

## 👥 Integrantes del Equipo (Código Base)

* **Miguel Penovi, Ignacio**
* **Moguilevsky, Eliana Sarah**
* **Mosquera, Ester**
```
---

## 📁 Carpeta de drive: 

https://drive.google.com/drive/folders/1ssO7dckoUUDJs87NzrH7b0CRgLEA_MRF?usp=drive_link
```

---