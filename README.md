# TurnoFlex

> **Desarrollo de Sistemas Web - Back End** | IFTS N° 29
> **Entrega Final** — 2° Cuatrimestre 2026
> **Cátedra:** Lic. García Ontiveros, Emir Eliezer
> **Equipo / Empresa:** Código Base (Comisión B — Grupo N° 5)
> **Caso 1:** Plataforma de Gestión de Turnos y Atención "TurnoFlex"


## Descripción

TurnoFlex es una aplicación web para gestionar alumnos, personal, sucursales y turnos de PilatesFlow Studios. Está desarrollada con Node.js, Express, Pug y MongoDB mediante Mongoose. Incluye vistas web renderizadas en el servidor, una API para alumnos y un chatbot de asistencia para alumnos.


## Funcionalidades

- Inicio de sesión con sesiones almacenadas en MongoDB y acceso según roles: `alumno`, `profesor`, `empleado`, `administrador` y `gerencia`.
- Registro de alumnos y gestión de perfiles.
- Recuperación y cambio de contraseña por correo electrónico.
- Agendamiento de turnos de lunes a sábado, con horarios y sucursales configurados en `config/opciones.js`.
- Consulta de disponibilidad y límite de 8 turnos confirmados por sucursal, fecha y horario.
- Registro de pago por transferencia o Mercado Pago dentro de la aplicación y generación de comprobantes con QR. El flujo actual no integra una pasarela externa de cobro.
- Registro de actividad para operaciones relevantes.
- Chatbot para consultas sobre el uso de TurnoFlex, integrado con la API de Groq.


## Tecnologías

- Node.js (se recomienda v18 o superior; el chatbot usa `fetch` y `AbortSignal.timeout`).
- Express 4 y Pug.
- MongoDB y Mongoose.
- `express-session` con `connect-mongo`.
- Nodemailer para recuperación de contraseña.
- `qrcode` para comprobantes.
- Vercel para despliegue; el proyecto incluye `vercel.json`.


## Estructura

```text
Backend2026/
├── .vercel/
│   ├── README.txt
│   └── project.json
├── config
│   ├── db.js
│   └── opciones.js
├── middlewares
│   ├── autorizacion.js
│   ├── logger.js
│   ├── validarAlumno.js
│   └── validarProfesor.js
├── models
│   ├── Alumno.js
│   ├── AlumnoRepository.js
│   ├── Persona.js
│   ├── PersonalRepository.js
│   ├── Profesor.js
│   ├── ProfesorRepository.js
│   ├── RegistroActividad.js
│   ├── Repository.js
│   ├── SucursalModel.js
│   ├── SucursalRepository.js
│   ├── TurnoModel.js
│   └── UsuarioModel.js
├── public
│   ├── css
│   │   └── style.css
│   ├── img
│   │   ├── error.png
│   │   ├── logo_mp.png
│   │   ├── logo.png
│   │   ├── logos_bancos.png
│   │   └── pf_logo.jpeg
│   └── js
│       ├── chatbot.js
│       ├── nuevoTurno.js
│       └── validaciones.js
├── routes
│   ├── api
│   │   ├── alumnos.js
│   │   └── profesores.js
│   ├── alumnos.js
│   ├── chatbot.js
│   ├── index.js
│   ├── login.js
│   ├── personal.js
│   ├── profesores.js
│   ├── recuperacion.js
│   ├── register.js
│   ├── sucursales.js
│   └── turnos.js
├── utils
│   ├── auditoria.js
│   ├── contrasenas.js
│   └── sucursales.js
├── views
│   ├── alumnos
│   │   ├── detalle.pug
│   │   ├── formulario.pug
│   │   ├── lista.pug
│   │   └── miPerfil.pug
│   ├── passwords
│   │   ├── cambioPassword.pug
│   │   └── recuperacion.pug
│   ├── personal
│   │   ├── detalle.pug
│   │   ├── formulario.pug
│   │   └── lista.pug
│   ├── sucursales
│   │   ├── detalle.pug
│   │   ├── formulario.pug
│   │   └── lista.pug
│   ├── turnos
│   │   ├── agendaProfesor.pug
│   │   ├── comprobante.pug
│   │   ├── lista.pug
│   │   ├── misTurnos.pug
│   │   ├── nuevoTurno.pug
│   │   ├── pago.pug
│   │   └── registrarTurno.pug
│   ├── 404.pug
│   ├── chatbot.pug
│   ├── index.pug
│   ├── layout.pug
│   ├── login.pug
│   └── register.pug
├── .env
├── .gitattributes
├── .gitignore
├── app.js
├── package-lock.json
├── package.json
├── README.md
├── test-db.js
└── vercel.json
``


## Instalación y ejecución local

1. Cloná el repositorio y entrá a la carpeta:

   ```bash
   git clone https://github.com/IgnacioMiguelPenovi/Backend2026.git
   cd Backend2026
   ```

2. Creá un archivo `.env` en la raíz. Configurá las variables necesarias para tu entorno:

   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/turnoflex
   DB_NAME=turnoflex
   SESSION_SECRET=un-secreto-largo-y-aleatorio
   ```

   Para habilitar el envío de correos de recuperación, configurá también `EMAIL_SERVICE`, `EMAIL_USER` y `EMAIL_PASS`. Para habilitar el chatbot, configurá `GROQ_API_KEY`; `GROQ_MODEL` es opcional y, si falta, se usa `openai/gpt-oss-120b`.

   No subas el archivo `.env` al repositorio. Está excluido por `.gitignore`.

3. Instalá las dependencias e iniciá el servidor:

   ```bash
   npm install
   npm run dev
   ```

4. Abrí `http://localhost:3000`. El puerto puede cambiarse con la variable `PORT`.

El comando `npm start` inicia la aplicación con Node.js sin Nodemon.


## Variables de entorno

| Variable | Uso | Requerida |
|---|---|---|
| `MONGODB_URI` | URI de conexión a MongoDB; también se usa para el almacén de sesiones | Sí |
| `DB_NAME` | Nombre de la base de datos; valor predeterminado: `turnoflex` | No |
| `PORT` | Puerto local; valor predeterminado: `3000` | No |
| `SESSION_SECRET` | Secreto de firma de sesiones; el código tiene un valor de respaldo inseguro | Obligatorio en producción; recomendado en local |
| `EMAIL_SERVICE` | Servicio de correo de Nodemailer; si no se configura, usa `gmail` | No; solo se usa para recuperación por correo |
| `EMAIL_USER` | Usuario de la cuenta de correo de Nodemailer | Necesario para habilitar recuperación por correo |
| `EMAIL_PASS` | Contraseña o clave de aplicación del correo | Necesaria para habilitar recuperación por correo |
| `GROQ_API_KEY` | Clave para llamar al chatbot de Groq | Para habilitar el chatbot |
| `GROQ_MODEL` | Modelo de Groq; valor predeterminado: `openai/gpt-oss-120b` | No |


## Rutas principales

### Vistas web

- `/`, `/index`: inicio.
- `GET /login`, `POST /login`: inicio de sesión. Tras 3 intentos fallidos, bloquea el inicio durante 5 minutos en esa sesión.
- `/register`: registro.
- `/recuperacion` y `/recuperacion/cambio-password`: solicitud de recuperación y cambio de contraseña.
- `/alumnos/mi-perfil`: consulta y edición del perfil del alumno autenticado.
- `/alumnos`: administración y consulta de alumnos según el rol.
- `/personal` y `/sucursales`: gestión de personal y sucursales según el rol.
- `GET /nuevoTurno`, `POST /nuevoTurno`: inicio del flujo de reserva.
- `GET /disponibilidad`: disponibilidad de horarios; requiere sesión con rol de alumno, empleado o administrador.
- `GET /pagarTurno`, `POST /pagarTurno`: confirmación del método de pago y creación del turno; no procesa un cobro externo.
- `/misTurnos`: turnos del alumno autenticado.
- `/turnos`: listado de turnos para empleado, administrador o gerencia.
- `/agenda`: agenda disponible para profesor, administrador o gerencia.
- `POST /logout`: cierre de sesión.

### API de alumnos (`/api/alumnos`)

Requiere sesión. Empleados, administradores y gerencia pueden consultar; empleados y administradores pueden crear; solo administradores pueden actualizar o desactivar.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/alumnos` | Listar alumnos |
| GET | `/api/alumnos/:id` | Consultar un alumno |
| POST | `/api/alumnos` | Crear un alumno |
| PUT | `/api/alumnos/:id` | Actualizar un alumno |
| DELETE | `/api/alumnos/:id` | Desactivar un alumno |

### Chatbot (`POST /api/chat`)

Disponible para alumnos autenticados y requiere `GROQ_API_KEY`. Recibe JSON y responde JSON:

```json
{
  "mensaje": "¿Cómo puedo reservar un turno?"
}
```


## Credenciales de prueba


| Rol | Usuario | Contraseña | Permisos principales |
|---|---|---|---|
| Administrador | `pepe123` | `54545454!` | Gestión de personal, sucursales, alumnos y turnos. |
| Empleado | `ester` | `11111111!` | Inscripción de alumnos, agendamiento y consulta de turnos. |
| Gerencia | `mfal` | `62626262!` | Consulta de listados, reportes y auditoría. |
| Profesor | `joaco` | `joaco123!` | Consulta de agenda y alumnos del día. |
| Alumno | `mati` | `12121212!` | Reserva y consulta de turnos, perfil y chatbot. |


## Despliegue

El repositorio incluye configuración para Vercel en `vercel.json`. La aplicación publicada está indicada como [TurnoFlex en Vercel](https://backend2026-delta.vercel.app/). El despliegue requiere configurar sus variables de entorno en la plataforma.


## Equipo y enlaces

Integrantes del equipo Código Base:

- Miguel Penovi, Ignacio
- Moguilevsky, Eliana Sarah
- Mosquera, Ester

- [Repositorio en GitHub](https://github.com/IgnacioMiguelPenovi/Backend2026)
- [Carpeta de Google Drive](https://drive.google.com/drive/folders/1ssO7dckoUUDJs87NzrH7b0CRgLEA_MRF?usp=drive_link)
- Video de defensa / 
