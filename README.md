# 🚀 Sistema de Login Seguro - Versión 2.0

## 📋 Descripción

Sistema de autenticación y autorización implementado con las mejores prácticas de seguridad y arquitectura en capas. Este proyecto demuestra cómo construir una aplicación web segura siguiendo los principios de MVVM y programación orientada a APIs.

## ✨ Características Implementadas

### 🔒 Seguridad
- **Prevención de XSS**: Eliminación del uso de `innerHTML` y sanitización de datos
- **Validación de entrada**: Validación robusta con `express-validator`
- **Autenticación JWT**: Tokens seguros con expiración
- **Autorización por roles**: Control de acceso basado en roles (admin/artista)
- **Rate Limiting**: Protección contra ataques de fuerza bruta
- **Helmet**: Headers de seguridad HTTP
- **CORS configurado**: Configuración segura de CORS

### 🏗️ Arquitectura
- **Patrón MVVM**: Separación clara de responsabilidades
- **Arquitectura en capas**: 
  - Controllers (Lógica de negocio)
  - Models (Acceso a datos)
  - Middleware (Autenticación, validación, logging)
  - Routes (Definición de endpoints)
- **API RESTful**: Diseño de API orientado a recursos
- **Pool de conexiones**: Gestión eficiente de conexiones a base de datos

### 📊 Auditoría y Logging
- **Sistema de auditoría**: Registro automático de todas las acciones
- **Panel de administración**: Interfaz gráfica para visualizar logs
- **Exportación de datos**: Exportación de logs en formato CSV
- **Búsqueda y filtros**: Búsqueda avanzada en logs de auditoría
- **Estadísticas en tiempo real**: Métricas del sistema

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **MySQL** - Base de datos
- **JWT** - Autenticación
- **bcryptjs** - Encriptación de contraseñas
- **express-validator** - Validación de datos
- **helmet** - Seguridad HTTP
- **express-rate-limit** - Rate limiting

### Frontend
- **HTML5** - Estructura
- **CSS3** - Estilos y diseño responsivo
- **JavaScript ES6+** - Lógica del cliente
- **Fetch API** - Comunicación con el backend

## 📁 Estructura del Proyecto

```
LOGIN-2.0/
├── backend/
│   ├── config/
│   │   ├── database.js      # Configuración de base de datos
│   │   └── auth.js          # Configuración de JWT
│   ├── controllers/
│   │   ├── authController.js # Controlador de autenticación
│   │   └── adminController.js # Controlador de administración
│   ├── middleware/
│   │   ├── auth.js          # Middleware de autenticación
│   │   ├── validation.js    # Middleware de validación
│   │   └── logger.js        # Middleware de logging
│   ├── models/
│   │   └── User.js          # Modelo de usuario
│   ├── routes/
│   │   ├── auth.js          # Rutas de autenticación
│   │   └── admin.js         # Rutas de administración
│   ├── database/
│   │   └── audit_log.sql    # Script de auditoría
│   ├── server.js            # Servidor principal
│   └── package.json         # Dependencias
├── frontend/
│   ├── css/
│   │   └── admin.css        # Estilos del panel admin
│   ├── js/
│   │   ├── api.js           # Servicio de API
│   │   └── admin.js         # Lógica del panel admin
│   ├── index.html           # Página de login
│   ├── register.html        # Página de registro
│   ├── panel_admin.html     # Panel de administrador
│   ├── panel_artista.html   # Panel de artista
│   ├── script.js            # Lógica principal
│   └── style.css            # Estilos generales
└── README.md                # Documentación
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (v14 o superior)
- MySQL (v8.0 o superior)
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd LOGIN-2.0
```

### 2. Configurar la base de datos
```sql
-- Crear base de datos
CREATE DATABASE musicalendaria;

-- Usar la base de datos
USE musicalendaria;

-- Crear tabla de usuarios (si no existe)
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'artista') DEFAULT 'artista',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP NULL
);

-- Ejecutar script de auditoría
SOURCE backend/database/audit_log.sql;
```

### 3. Configurar variables de entorno
Crear archivo `.env` en la carpeta `backend/`:
```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=2869
DB_NAME=musicalendaria
JWT_SECRET=mi_secreto_super_seguro_cambiame_en_produccion
JWT_EXPIRES_IN=1h
FRONTEND_URL=http://localhost:3000
```

### 4. Instalar dependencias
```bash
cd backend
npm install
```

### 5. Iniciar el servidor
```bash
npm start
# o para desarrollo
npm run dev
```

### 6. Acceder a la aplicación
- Frontend: http://localhost:3000
- API: http://localhost:5000/api
- Health check: http://localhost:5000/api/health

## 🔐 Endpoints de la API

### Autenticación
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/profile` - Obtener perfil (requiere autenticación)

### Administración (requiere rol admin)
- `GET /api/admin/audit-logs` - Obtener logs de auditoría
- `GET /api/admin/audit-logs/:id` - Obtener log específico
- `GET /api/admin/audit-logs/search` - Buscar logs
- `GET /api/admin/audit-logs/export` - Exportar logs en CSV
- `GET /api/admin/statistics` - Obtener estadísticas

## 🛡️ Medidas de Seguridad Implementadas

### 1. Prevención de XSS
- Uso de `textContent` en lugar de `innerHTML`
- Sanitización de datos de entrada
- Headers de seguridad con Helmet

### 2. Validación de Datos
- Validación del lado del servidor con express-validator
- Validación del lado del cliente con HTML5
- Sanitización automática de datos

### 3. Autenticación y Autorización
- Tokens JWT con expiración
- Verificación de roles
- Middleware de autenticación en rutas protegidas

### 4. Protección contra Ataques
- Rate limiting para prevenir fuerza bruta
- Headers de seguridad HTTP
- Configuración segura de CORS

### 5. Auditoría Completa
- Logging automático de todas las acciones
- Registro de IPs y detalles de usuario
- Panel de administración para monitoreo

## 📊 Panel de Administración

El panel de administración incluye:

- **Dashboard con estadísticas**: Usuarios totales, logins del día, etc.
- **Logs de auditoría**: Visualización de todas las acciones del sistema
- **Búsqueda y filtros**: Búsqueda por usuario, acción, fecha
- **Exportación de datos**: Descarga de logs en formato CSV
- **Detalles de logs**: Modal con información detallada de cada acción

## 🔧 Configuración de Desarrollo

### Scripts disponibles
```bash
npm start          # Iniciar en producción
npm run dev        # Iniciar en desarrollo con nodemon
npm test           # Ejecutar pruebas
```

### Variables de entorno de desarrollo
```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=2869
DB_NAME=musicalendaria
JWT_SECRET=dev_secret_key
JWT_EXPIRES_IN=1h
FRONTEND_URL=http://localhost:3000
```

## 🧪 Pruebas

Para ejecutar las pruebas:
```bash
npm test
```

## 📝 Logs de Auditoría

El sistema registra automáticamente:
- Registros de usuarios
- Inicios de sesión
- Accesos a perfiles
- Acciones de administración
- Búsquedas y exportaciones

Cada log incluye:
- ID del usuario
- Tipo de acción
- IP del cliente
- Timestamp
- Detalles adicionales en formato JSON

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Jazmin del Rosario Saavedra Piñeiro**

## 🆘 Soporte

Si tienes alguna pregunta o problema, por favor abre un issue en el repositorio.

---

**Nota**: Este proyecto es un ejemplo educativo que implementa las mejores prácticas de seguridad y arquitectura. Para uso en producción, asegúrate de cambiar las claves secretas y configuraciones por defecto. 