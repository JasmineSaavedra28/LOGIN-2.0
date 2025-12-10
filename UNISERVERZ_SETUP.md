# 🎵 Guía de Configuración Musicalendaria + UniServerZ

## 🚀 Instalación Rápida (5 minutos)

### Paso 1: Preparar UniServerZ
1. **Abre UniServerZ Control Panel**
2. **Inicia MySQL/MariaDB** (debe mostrar "Running" en verde)
3. **Anota el puerto** (generalmente 3306)

### Paso 2: Crear Base de Datos
1. **Abre phpMyAdmin** desde UniServerZ Control Panel
2. **Ejecuta el script SQL**:
   - Clic en "SQL" 
   - Copia y pega el contenido de: `backend/database/setup_database.sql`
   - Clic en "Continuar"
3. **Verifica**: Debe aparecer la base de datos "musicalendaria" con 4 tablas

### Paso 3: Instalar y Ejecutar
**Windows:**
- Doble clic en `start_server.bat`

**Linux/Mac:**
```bash
chmod +x start_server.sh
./start_server.sh
```

### Paso 4: ¡Probar!
- **Demo**: Abre `frontend/demo.html`
- **Backend**: http://localhost:3001/api/health
- **Frontend**: http://localhost

## 🔑 Credenciales de Prueba

### Administrador
- **Email**: admin@test.com
- **Password**: password123
- **Permisos**: Acceso total, estadísticas, logs

### Artista  
- **Email**: artista@test.com
- **Password**: password123
- **Permisos**: Panel personalizado, gestión de eventos

## 🛠️ Solución de Problemas

### ❌ "Cannot connect to database"
**Solución**:
1. Verifica que MySQL esté iniciado en UniServerZ
2. Confirma que la BD "musicalendaria" existe
3. Revisa el archivo `backend/.env`

### ❌ "Port 3001 already in use"
**Solución**:
```bash
# Cambiar puerto en backend/.env
PORT=3002
```

### ❌ "Module not found"
**Solución**:
```bash
cd backend
npm install
```

### ❌ Frontend no carga datos
**Solución**:
1. Verifica que el backend esté corriendo en puerto 3001
2. Abre DevTools (F12) → Console para ver errores
3. Prueba con `demo.html` primero

## 📊 Verificación de Instalación

### ✅ Backend Funcionando
- Ve a: http://localhost:3001/api/health
- Debe responder: `{"status":"OK",...}`

### ✅ Base de Datos Conectada
- 4 tablas en phpMyAdmin: usuarios, events, artist_profiles, audit_log
- 2 usuarios de prueba creados
- 3 eventos de ejemplo

### ✅ Frontend Funcionando
- `demo.html` carga sin errores
- Login funciona con las credenciales
- Paneles se abren correctamente

## 🎯 Próximos Pasos

1. **Explora** todas las funcionalidades en `demo.html`
2. **Registra** nuevos usuarios desde `register.html`
3. **Crea** eventos como artista logueado
4. **Administra** el sistema como admin

## 📞 Soporte

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Verifica que todos los servicios estén iniciados
3. Consulta el `README.md` completo

---
**¡Musicalendaria listo para usar! 🎵✨**