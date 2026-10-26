# ⭐ AllStar Ticket • Plataforma de Ticketing & Pases de Abordaje

Plataforma web completa de ticketing, registro y control de acceso diseñada para eventos de **Network Marketing, Liderazgo y Cruceros/Viajes**.

Permite a los socios compartir enlaces con su código de referido (`?ref=zamyr`), genera entradas tipo **Boarding Pass** marítimo/aéreo en alta resolución (descargables en PNG o compartibles en WhatsApp), y cuenta con un módulo de **scanner en puerta con cámara móvil** (`html5-qrcode`) que previene duplicados en tiempo real.

---

## 🚀 Arquitectura y Tecnologías

| Componente | Tecnologías |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Canvas Confetti |
| **Lector QR Web** | `html5-qrcode` (acceso directo a cámara trasera en móviles y feedback instantáneo) |
| **Pase de Abordaje** | `html-to-image` + `qrcode.react` (renderizado de ticket estilo tarjeta de embarque descargable en HD) |
| **Backend** | Node.js, Express, TypeScript |
| **Base de Datos** | MongoDB con Mongoose (Soporta Docker local, MongoDB auto-hospedado o Atlas) |
| **Notificaciones** | Resend (Emails transaccionales HTML con QR) + Generador de enlaces WhatsApp (`api.whatsapp.com`) |
| **Infraestructura** | Docker, Docker Compose, Nginx (Multi-stage builds) |

---

## 📁 Estructura del Proyecto

```text
c:\Repositorio-AllStarTicket\
├── docker-compose.yml          # Orquestación de MongoDB, Backend y Frontend
├── .env.example                # Plantilla de variables de entorno globales
├── server/                     # Backend API (Node.js + Express + TS)
│   ├── Dockerfile              # Build multi-stage para Node 22
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── config/             # Conexión a MongoDB (db.ts)
│       ├── models/             # User, Event, TicketType, Ticket (Mongoose Schemas)
│       ├── controllers/        # Controladores RESTful (Event, Ticket, User)
│       ├── routes/             # Enrutamiento modular Express (/api)
│       ├── services/           # Resend Email Service y CSV / Excel Exporter
│       ├── utils/              # Seed automático con datos iniciales
│       └── index.ts            # Punto de entrada de la API
└── client/                     # Frontend SPA (React + Vite + Tailwind + Nginx)
    ├── Dockerfile              # Build multi-stage con Nginx Alpine
    ├── nginx.conf              # Reverse proxy para /api y enrutamiento SPA
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.js      # Paleta de colores Luxury Gold & Cruise Navy
    └── src/
        ├── types/              # Definiciones TypeScript de modelos y respuestas
        ├── services/           # Cliente API, sintetizador de audio (Web Audio) y WhatsApp
        ├── components/
        │   ├── Navbar.tsx
        │   ├── BoardingPass.tsx    # Pase de abordaje estilo crucero/aerolínea (Descarga PNG + WhatsApp)
        │   ├── QRScanner.tsx       # Lector QR con cámara móvil y feedback visual
        │   ├── CheckInResultModal.tsx # Alerta Verde (Acceso) / Roja (Ticket ya usado)
        │   ├── EventStats.tsx      # Métricas en vivo y tabla de liderazgo por socios
        │   ├── AttendeeTable.tsx   # Tabla de asistentes con filtros y exportación CSV
        │   └── ManualTicketModal.tsx # Emisión rápida de pases por parte de socios
        ├── pages/
        │   ├── HomePage.tsx        # Portal central y selector de eventos activos
        │   ├── LandingPage.tsx     # Landing de registro público (/eventos/:slug?ref=codigo)
        │   ├── ScannerPage.tsx     # Módulo de recepción para teléfonos móviles (/scanner)
        │   ├── AdminPage.tsx       # Dashboard ejecutivo con métricas en vivo (/admin)
        │   └── TicketViewPage.tsx  # Vista pública individual de un ticket (/ticket/:code)
        ├── App.tsx
        └── main.tsx
```

---

## ⚡ Inicio Rápido con Docker Compose (Recomendado)

Todo el entorno (MongoDB + Backend API + Frontend Nginx) está configurado para levantarse con un solo comando:

```bash
docker compose up --build
```

Una vez levantado:
- 🌐 **Frontend (Web App):** [http://localhost:3000](http://localhost:3000)
- 🔌 **Backend API:** [http://localhost:5000/api](http://localhost:5000/api)
- 📊 **Visualizador DB (Mongo Express):** [http://localhost:8081](http://localhost:8081) *(explora y edita datos en tu navegador sin instalar nada)*
- 🗄️ **MongoDB:** `mongodb://localhost:27017/allstar_tickets`

> **Nota:** La base de datos se siembra automáticamente al iniciar por primera vez con socios de prueba, un evento principal y tickets de demostración.

---

## 🛠️ Ejecución Local para Desarrollo (Sin Docker)

Si prefieres ejecutar los servicios directamente en tu entorno Node.js:

### 1. Prerrequisitos
- Node.js v18+ y npm
- MongoDB ejecutándose localmente en `mongodb://localhost:27017` (o una URI de MongoDB Atlas)

### 2. Levantar el Backend (`server`)
```bash
cd server
npm install
npm run dev
```
El servidor arrancará en `http://localhost:5000` y creará la data inicial automáticamente.

### 3. Levantar el Frontend (`client`)
En otra terminal:
```bash
cd client
npm install
npm run dev
```
La aplicación abrirá en `http://localhost:5173` y conectará automáticamente con el backend a través del proxy de Vite.

---

---

## 🔐 Matriz de Roles y Permisos (RBAC)

La plataforma cuenta con un sistema granular de roles y permisos:

| Permiso | Descripción | Rol `admin` | Rol `leader` | Rol `partner` |
|---|---|:---:|:---:|:---:|
| `invite_prospects` | Invitar prospectos con enlace de referido y emitir tickets | ✅ | ✅ | ✅ |
| `manage_partners` | Acceder al Mantenedor de Socios, crear y editar socios | ✅ | ✅ | ❌ |
| `create_events` | Crear nuevas cumbres/eventos y configurar aforos | ✅ | ❌ *(o por permiso)* | ❌ |
| `view_metrics` | Ver analíticas globales y exportar lista a CSV/Excel | ✅ | ✅ | ❌ *(ve sus propios invitados)* |
| `door_scanner` | Acceso al scanner de puerta con cámara web/móvil | ✅ | ✅ | ❌ *(o por permiso)* |

---

## 🎫 Credenciales de Acceso para Pruebas

Contraseña común para todas las cuentas iniciales: `AllStar2026!`

| Usuario | Correo | Rol | Código Referido | Capacidades Clave |
|---|---|---|---|---|
| **Zamyr Pedreros** | `zamyr@allstarticket.com` | **Admin** | `@zamyr` | Control total, crear eventos, crear socios, métricas |
| **Andrea Gómez** | `andrea.gomez@allstarticket.com` | **Líder** | `@andrea` | Mantenedor de socios (crear nuevos socios), invitar prospectos |
| **Carlos Mendoza** | `carlos.m@allstarticket.com` | **Socio** | `@carlos` | Invitar prospectos y ver sus propios invitados registrados |
| **Sofía Valenzuela** | `sofia.v@allstarticket.com` | **Socio** | `@sofia` | Invitar prospectos y generar pases con su código |

> **Tip:** En la pantalla de login (`/login`) existen botones de **"Acceso Rápido"** para alternar entre roles con un solo clic sin necesidad de escribir la contraseña.

---

## 📡 Referencia de la API RESTful

| Método | Endpoint | Protección / Permiso | Descripción |
|---|---|:---:|---|
| `POST` | `/api/auth/login` | Público | Autenticación con email y contraseña (retorna JWT) |
| `GET` | `/api/auth/me` | JWT | Obtiene sesión actual y permisos del socio |
| `GET` | `/api/events` | Público | Lista todos los eventos activos |
| `GET` | `/api/events/:slug?ref=codigo` | Público | Detalles del evento y validación de socio anfitrión |
| `POST` | `/api/events` | `create_events` | Crear nuevo evento y configurar tipos de entradas |
| `GET` | `/api/events/:id/stats` | JWT | Métricas en tiempo real y tabla de liderazgo |
| `GET` | `/api/events/:id/export` | `view_metrics` | Descarga de CSV con BOM UTF-8 para Excel |
| `GET` | `/api/users` | JWT | Lista de socios para el mantenedor |
| `POST` | `/api/users` | `manage_partners` | **Crear nuevo socio con rol y permisos asignados** |
| `PUT` | `/api/users/:id` | `manage_partners` | **Modificar rol, permisos o estado del socio** |
| `GET` | `/api/users/referral/:code` | Público | Valida si un código de referido está activo |
| `POST` | `/api/tickets/register` | Público / Socio | Registra asistente y emite Pase de Abordaje |
| `POST` | `/api/tickets/check-in` | Público / Scanner | Validación QR en puerta (bloquea duplicados) |
| `GET` | `/api/tickets/:code` | Público | Vista y descarga del Boarding Pass |

---

## 🎨 Características Destacadas de Experiencia de Usuario (UX)

1. **Boarding Pass Tipo Primera Clase:**
   - Estructura realista con cupón principal + talón desprendible ("Tear-off stub") con muescas circulares y líneas perforadas.
   - Código QR dinámico de alto contraste con el identificador del ticket.
   - Botón de descarga instantánea como imagen PNG con resolución Retina (`pixelRatio: 3`).
   - Botón de compartir en WhatsApp con mensaje formateado listo para enviar.

2. **Scanner en Puerta (`/scanner`):**
   - Vista móvil con visor de cámara, animación de línea láser guía (`scanner-laser`) y selector de cámara trasera/frontal.
   - Control de linterna / flash en dispositivos móviles compatibles.
   - Síntesis de sonido mediante **Web Audio API** (sin depender de archivos `.mp3` externos que puedan fallar en producción).
   - Retroalimentación háptica (vibración en teléfonos Android).

3. **Panel Administrativo (`/admin`):**
   - Indicadores KPI: Total inscritos, aforo disponible, porcentaje de asistencia en vivo.
   - Tabla de liderazgo para medir qué socio ha invitado a más prospectos y quién tiene mejor tasa de asistencia.
   - Modal de emisión manual de pases para entregar tickets directamente a prospectos en WhatsApp.
