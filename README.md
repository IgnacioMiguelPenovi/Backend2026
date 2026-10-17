# 🧘‍♀️ PilatesFlow Studios — Plataforma TurnoFlex

> **Desarrollo de Sistemas Web - Back End** | IFTS N° 29  
> **2° Entrega de Proyecto** — 2° Cuatrimestre 2026  
> **Cátedra:** Lic. García Ontiveros, Emir Eliezer  
> **Equipo / Empresa:** Código Base (Comisión B — Grupo N° 5)
> **Caso 1:** Plataforma de Gestión de Turnos y Atención "TurnoFlex"


---

## 📋 Descripción del Proyecto

**PilatesFlow Studios** (desarrollado sobre la plataforma de gestión **TurnoFlex**) es una solución backend construida con **Node.js** y **Express** para la administración centralizada de turnos, pases, alumnos y empleados en salas de Pilates. 

El sistema resuelve la gestión de reservas por sucursal (*Palermo*, *Belgrano*, *Caballito*), permitiendo operar tanto desde una **interfaz web renderizada dinámicamente con Pug** como a través de un servicio de **API REST** que responde en formato JSON.

---

## 🚀 Tecnologías y Herramientas

* **Entorno de Ejecución:** [Node.js](https://nodejs.org/) (v18+)
* **Framework Web:** [Express.js](https://expressjs.com/)
* **Motor de Plantillas:** [Pug](https://pugjs.org/)
* **Persistencia de Datos:** Base de datos NoSQL documental **MongoDB** gestionada asíncronamente mediante el **ODM Mongoose**.
* **Paradigma Operativo:** Arquitectura orientada a **Esquemas rígidos de Mongoose** (`mongoose.Schema`), removiendo la antigua herencia nativa de JavaScript.
* **Manejo Asincrónico:** Control de flujo unificado no bloqueante basado puramente en la sintaxis **`async/await`** y bloques `try/catch`.
* **Middlewares:** `express.json()`, `express.urlencoded()` (para el parseo nativo de formularios Pug locales), y logger de consola personalizado.
* **Herramientas de Desarrollo y Pruebas:** `nodemon`, MongoDB Compass.

---

## 📂 Estructura del Proyecto

```text
Backend2026/
├── config/
│   ├── db.js                 # conexión a MongoDB
│   └── opciones.js           # Sucursales, días y grilla horaria
├── middlewares/
│   ├── logger.js             # Middleware de registro de peticiones
│   ├── validarAlumno.js      # Middleware sanitario: Validación de datos de entrada para Alumnos
│   └── validarProfesor.js    # Middleware sanitario: Validación de datos de entrada para Profesores
├── models/
│   ├── Persona.js            # Clase base abstracta: Define las propiedades comunes de identidad (Encapsulamiento POO de la 1° Entrega).
│   ├── Alumno.js             # Clase derivada nativa (extends Persona): Estructura lógica y constructora de los clientes en memoria (1° Entrega).
│   ├── Profesor.js           # Clase derivada nativa (extends Persona): Estructura de disponibilidad del staff heredada de la capa inicial (1° Entrega).
│   ├── Repository.js         # Abstracción de persistencia síncrona: Centraliza la lectura y escritura mediante el módulo de Node.js 'fs' (1° Entrega).
│   ├── AlumnoRepository.js   # Repositorio específico NoSQL: Gestiona operaciones CRUD asíncronas utilizando el esquema AlumnoModel en MongoDB.
│   ├── ProfesorRepository.js # Repositorio específico NoSQL: Administra las consultas de grillas operativas delegando la persistencia a Mongoose.
│   ├── PersonalRepository.js # Capa de datos del Staff: Procesa el alta y actualización asíncrona de Empleados mutando colecciones en la BD.
│   ├── RegistroActividad.js  # Esquema de Auditoría NoSQL: Registra de manera automatizada las marcas de tiempo (timestamps) de creación y modificación en la BD.
│   ├── SucursalModel.js      # Esquema estructural de Mongoose: Define las restricciones, tipados y el índice único case-insensitive para las sedes.
│   ├── SucursalRepository.js # Controlador defensivo de datos: Administra el alta de sedes e intercepta la excepción de duplicados (Error 11000) de MongoDB.
│   └── TurnoModel.js         # Esquema dinámico de Reservas: Modela el agendamiento asíncrono vinculando el ID del alumno con un turno, día y horario.
├── routes/
│   ├── api/                  # Subcarpeta para endpoints de la API REST (Respuestas en JSON)
│   │   ├── alumnos.js        # Endpoints asíncronos para el recurso Alumnos (JSON)
│   │   └── profesores.js     # Endpoints asíncronos para el recurso Profesores (JSON)
│   ├── alumnos.js            # Control y renderizado web del ABM de Alumnos (Pug)
│   ├── index.js              # Enrutador de la portada y página de bienvenida principal
│   ├── login.js              # Control de autenticación y acceso al panel de gestión
│   ├── personal.js           # Renderizado de vistas y alta del Módulo de Empleados
│   ├── profesores.js         # Control y renderizado web de la grilla de Profesores (Pug)
│   ├── register.js           # Enrutador para el formulario de registro de nuevos usuarios
│   ├── sucursales.js         # Rutas web del nuevo Módulo de Sucursales (Alta y control case-insensitive)
│   └── turnos.js             # Control y flujos del nuevo motor de reserva de clases en tiempo real
├── views/
│   ├── alumnos/              # Subcarpeta de interfaces destinadas al recurso Alumnos
│   │   ├── detalle.pug       # Renderizado del perfil y ficha individual del alumno
│   │   ├── formulario.pug    # Formulario dinámico de alta y edición de datos
│   │   └── lista.pug         # Tabla principal con el listado de clientes
│   ├── personal/             # Subcarpeta de interfaces destinadas al Módulo de Personal
│   │   ├── detalle.pug       # Renderizado del perfil y ficha individual del empleado
│   │   ├── formulario.pug    # Formulario modularizado para inscribir o modificar personal
│   │   └── lista.pug         # Listado general con control de estados para administración
│   ├── sucursales/           # Subcarpeta de interfaces destinadas al Módulo de sucursales
│   │   ├── detalle.pug       # Vista detallada de la información de una sucursal
│   │   ├── formulario.pug    # Interfaz de alta
│   │   └── lista.pug         # Visualización de las sedes registradas
│   ├── 404.pug               # Pantilla defensiva ante peticiones de rutas inexistentes
│   ├── index.pug             # Portada de bienvenida y acceso principal a la plataforma
│   ├── layout.pug            # Plantilla estructural base (Layout reutilizable por herencia)
│   ├── login.pug             # Formulario de autenticación para el ingreso al sistema
│   ├── misTurnos.pug         # Renderizado con la grilla de reservas consolidadas del usuario
│   ├── nuevoTurno.pug        # Motor dinámico para el agendamiento y reserva de clases
│   └── register.pug          # Interfaz web para el registro de nuevos usuarios (alumnos) en línea
├── public/
│   ├── css/                  # Carpeta contenedora de hojas de estilo CSS estáticas
│   │   └── style.css         # Archivo de estilos globales de la interfaz web de TurnoFlex
│   └── js/                   # Carpeta para scripts dinámicos ejecutados en el navegador
│       └── validaciones.js   # Script del lado del cliente: Captura eventos, peticiones Fetch y control del DOM
├── utils/                    # Herramientas de utilidad global del sistema
│   └── auditoria.js          # Motor asíncrono de tracking de cambios y auditoría de datos
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

### 2. Configurar Variables de Entorno
Cree un archivo **`.env`** en la raíz del proyecto para definir el puerto de escucha y la URI local del contenedor NoSQL:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/TurnoFlex
```

### 3. Instalar dependencias
```bash
npm install
```

### 4. Iniciar el servidor de desarrollo
```bash
npm run dev
```
Accedé a la aplicación en tu navegador en: `http://localhost:3000`
```

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

### 🔹 Módulo Personal / Empleados (`/api/profesores`)

| Método | Endpoint | Descripción | Estado HTTP |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/profesores` | Obtener el listado completo de empleados | `200 OK` |
| **GET** | `/api/profesores/:id` | Obtener los detalles de un empleado por ID | `200 OK` / `404 Not Found` |
| **POST** | `/api/profesores` | Registrar un nuevo integrante del personal (Validación integrada) | `201 Created` / `400 Bad Request` |
| **PUT** | `/api/profesores/:id` | Modificar los datos de un empleado | `200 OK` / `404 Not Found` |
| **DELETE**| `/api/profesores/:id` | Desactivación lógica (Borrado defensivo de estado `'inactivo'`) | `204 No Content` / `404 Not Found` |

#### Ejemplo de Payload (Body JSON) para `POST` / `PUT`:
```json
{
  "nombre": "Martín",
  "apellido": "López",
  "dni": "38123456",
  "email": "martin.lopez@pilatesflow.com",
  "telefono": "1123456789",
  "rol": "profesor",
  "dias": ["Lunes", "Miércoles", "Viernes"],
  "horarios": ["09:00", "10:00", "11:00"]
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