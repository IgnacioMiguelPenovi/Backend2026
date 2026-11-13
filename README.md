# <table>
  <tr>
    <td><img src="public/img/logo.png" width="90" alt="Logo de TurnoFlex"></td>
    <td><h1>TurnoFlex</h1></td>
  </tr>
</table>

> **Desarrollo de Sistemas Web - Back End** | IFTS N° 29  
> **Entrega Final** — 2° Cuatrimestre 2026  
> **Cátedra:** Lic. García Ontiveros, Emir Eliezer  
> **Equipo / Empresa:** Código Base (Comisión B — Grupo N° 5)
> **Caso 1:** Plataforma de Gestión de Turnos y Atención "TurnoFlex"


---

## 📋 Descripción del Proyecto

**TurnoFlex** es una solución backend construida con **Node.js**, **Express** y **MongoDB Atlas** para la administración centralizada de turnos, pases, alumnos y empleados de **PilatesFlow Studios**. Utiliza **MongoDB** para almacenar la información y ofrece funciones para el personal de la empresa y para los alumnos, como consultar y reservar turnos. Además, incluye un chatbot que brinda asistencia a los alumnos durante el uso de la plataforma.

---

### ✨ Funcionalidades Destacadas en la Entrega Final (v2.2.1)

* **Autenticación y Roles (RBAC):** Control de acceso por roles (`alumno`, `profesor`, `empleado`, `administrador`, `gerencia`) mediante `express-session` respaldado por `connect-mongo` en MongoDB Atlas.
* **Seguridad Criptográfica:** Hasheo de contraseñas con el módulo nativo `crypto.scrypt` \+ *salt* aleatorio, comparación constante con `crypto.timingSafeEqual`, historial de no reutilización de contraseñas previas e inactividad con cierre de sesión automático (1 hora).
* **Recuperación de Contraseña:** Flujo con envío de correo electrónico mediante **Nodemailer** y generación de tokens de un solo uso con vencimiento automático a los **15 minutos**.
* **Agendamiento en Tiempo Real con Control de Cupos (*Capping*):** Verificación de disponibilidad dinámica con un límite estricto de **8 alumnos por clase** (`CUPOS_POR_CLASE = 8`).
* **Pagos y Comprobantes QR:** Selección de método de pago (Transferencia Bancaria con 10% de descuento vs. Mercado Pago) y generación automática de comprobante con **Código QR** (`qrcode`).
* **Módulo de Mi Perfil:** Autogestión de datos personales y actualización segura de perfil para los alumnos.
* **Auditoría y Trazabilidad:** Registro automático de eventos (`RegistroActividad`) con timestamps y cálculo de *diffs* de modificaciones sobre entidades sensibles.
* **Asistente Virtual con IA:** Chatbot integrado vía API de Groq para resolver dudas sobre la plataforma, horarios y sucursales.

---

## 🚀 Tecnologías y Herramientas

* **Entorno de Ejecución:** [Node.js](https://nodejs.org/) (v18+)
* **Framework Web:** [Express.js](https://expressjs.com/)
* **Motor de Plantillas:** [Pug](https://pugjs.org/)
* **Persistencia de datos:** Base de datos NoSQL documental [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas), gestionada de forma asíncrona mediante el ODM [Mongoose](https://mongoosejs.com/).
* **Paradigma Operativo:** Arquitectura orientada a **Esquemas rígidos de Mongoose** (`mongoose.Schema`), removiendo la antigua herencia nativa de JavaScript.
* **Manejo Asincrónico:** Control de flujo unificado no bloqueante basado puramente en la sintaxis **`async/await`** y bloques `try/catch`.
* **Middlewares:** `express.json()`, `express.urlencoded()` (para el parseo nativo de formularios Pug locales), y logger de consola personalizado.
* **Herramientas de Desarrollo y Pruebas:** `nodemon`, MongoDB Compass.
* **Plataforma de Despliegue:** [Vercel Serverless Functions](https://vercel.com/)


---

## 📂 Estructura del Proyecto

```text
Backend2026/
├── config/
│   ├── db.js
│   └── opciones.js
├── middlewares/
│   ├── autorizacion.js
│   ├── logger.js
│   ├── validarAlumno.js
│   └── validarProfesor.js
├── models/
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
├── public/
│   ├── css/
│   │   └── style.css
│   ├── img/
│   │   ├── error.png
│   │   ├── logo.png
│   │   ├── logo_mp.png
│   │   ├── logos_bancos.png
│   │   └── pf_logo.jpeg
│   └── js/
│       ├── chatbot.js
│       ├── nuevoTurno.js
│       └── validaciones.js
├── routes/
│   ├── api/
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
├── utils/
│   ├── auditoria.js
│   ├── contrasenas.js
│   └── sucursales.js
├── views/
│   ├── alumnos/
│   │   ├── detalle.pug
│   │   ├── formulario.pug
│   │   ├── lista.pug
│   │   └── miPerfil.pug
│   ├── passwords/
│   │   ├── cambioPassword.pug
│   │   └── recuperacion.pug
│   ├── personal/
│   │   ├── detalle.pug
│   │   ├── formulario.pug
│   │   └── lista.pug
│   ├── sucursales/
│   │   ├── detalle.pug
│   │   ├── formulario.pug
│   │   └── lista.pug
│   ├── turnos/
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
├── app.js
├── package.json
├── package-lock.json
├── vercel.json
└── README.md
```


---

## 🌐 Acceso en Vivo y Despliegue La aplicación se encuentra **desplegada y lista para probar en vivo\*\* en Vercel: 👉 **[https://backend2026-delta.vercel.app/](https://backend2026-delta.vercel.app/)**

## 🛠️ Instalación y Ejecución

### 1. Clonar el repositorio
```bash
git clone https://github.com/IgnacioMiguelPenovi/Backend2026.git
cd Backend2026
```

### 2. Configurar Variables de Entorno
Cree un archivo `.env` en la raíz del proyecto basándose en las siguientes claves:
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

---

## 🔑 Credenciales de Prueba (Verificación)

Para evaluar y navegar los diferentes roles del sistema, se pueden utilizar las siguientes credenciales pre-configuradas:

| Rol               | Usuario    | Contraseña     | Permisos Principales                                            |
| ----------------- | ---------- | -------------- | --------------------------------------------------------------- |
| **Administrador** | `pepe123`  | `54545454!`    | Acceso total, gestión de personal, sucursales y alumnos.        |
| **Empleado**      | `ester`    | `11111111!`    | Inscribir alumnos, agendar turnos y consultar listas.           |
| **Gerencia**      | `mfal`     | `62626262!`    | Lectura de listados, reportes y auditoría.                      |
| **Profesor**      | `joaco`    | `joaco123!`    | Consulta de agenda de clases asignadas y alumnos del día.       |
| **Alumno**        | `mati`     | `12121212!`    | Reserva de turnos, consulta de mis turnos, Mi Perfil y Chatbot. |

---

## 🔌 Endpoints de la API REST y Rutas Web

### 🌐 Rutas Web Principales (SSR - Pug)

* `GET /login` | `POST /login` — Inicio de sesión con protección anti-fuerza bruta (bloqueo de 5 min tras 3 intentos fallidos).
* `GET /recuperacion` | `POST /recuperacion` — Solicitud de token temporal por email (expira en 15 min).
* `GET /alumnos/mi-perfil` | `POST /alumnos/mi-perfil` — Edición de perfil de alumno en sesión.
* `GET /nuevoTurno` | `POST /nuevoTurno` — Formulario interactivo para agendar turno con selección de horario y sucursal.
* `GET /turnos/disponibilidad` — Endpoint AJAX de consulta de cupos disponibles (`CUPOS_POR_CLASE = 8`).
* `GET /pagarTurno` | `POST /confirmarPago` — Pasarela de pago simulada y renderizado del comprobante con QR.
* `GET /agenda` — Vista de clases y alumnos asignados para el rol Profesor.


### 🔹 Módulo API de Alumnos (`/api/alumnos`)

Se requiere una sesión iniciada. Los permisos dependen del rol: empleados, administradores y gerencia pueden consultar; empleados y administradores pueden crear; solo administradores pueden actualizar o desactivar alumnos.

| Método | Endpoint | Descripción | Respuestas principales |
|---|---|---|---|
| GET | `/api/alumnos` | Obtener el listado de alumnos en JSON | `200 OK`, `401 Unauthorized`, `403 Forbidden` |
| GET | `/api/alumnos/:id` | Obtener un alumno por su ID | `200 OK`, `404 Not Found`, `401 Unauthorized`, `403 Forbidden` |
| POST | `/api/alumnos` | Registrar un alumno | `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden` |
| PUT | `/api/alumnos/:id` | Actualizar los datos de un alumno | `200 OK`, `400 Bad Request`, `404 Not Found`, `401 Unauthorized`, `403 Forbidden` |
| DELETE | `/api/alumnos/:id` | Desactivar un alumno | `204 No Content`, `404 Not Found`, `401 Unauthorized`, `403 Forbidden` |

---


### 🔹 Módulo de Asistencia Virtual / Chatbot (`/api/chat`)

Se requiere una sesión iniciada con rol de alumno. El chatbot recibe la consulta y devuelve una respuesta en formato JSON.

| Método | Endpoint | Descripción | Respuestas principales |
|---|---|---|---|
| POST | `/api/chat` | Enviar una consulta y recibir asistencia del chatbot | `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `502 Bad Gateway`, `503 Service Unavailable` |

#### Ejemplo de solicitud (Body JSON) para `POST`:

```json
{
  "mensaje": "¿Cómo puedo reservar un turno?"
}
```

---


## 👥 Integrantes del Equipo N° 5 "Código Base"

* **Miguel Penovi, Ignacio**
* **Moguilevsky, Eliana Sarah**
* **Mosquera, Ester**


---

## 🔗 Enlaces Oficiales del Proyecto

- **Despliegue en Producción (Vercel):** [https://backend2026-delta.vercel.app/](https://backend2026-delta.vercel.app/) 
- **Repositorio en GitHub:** [https://github.com/IgnacioMiguelPenovi/Backend2026](https://github.com/IgnacioMiguelPenovi/Backend2026) 
- **Carpeta de Google Drive:** [DSWB\_2B\_CodigoBase\_2C26](https://drive.google.com/drive/folders/1ssO7dckoUUDJs87NzrH7b0CRgLEA_MRF?usp=drive_link) 
- **Video de Defensa / Coloquio:** [Insertar enlace al video en Drive/YouTube]

---

```

---