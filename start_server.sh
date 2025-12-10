#!/bin/bash

echo "========================================"
echo " INSTALACIÓN MUSICALENDARIA - UniServerZ"
echo "========================================"
echo

echo "[1/4] Instalando dependencias..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Falló la instalación de dependencias"
    exit 1
fi

echo
echo "[2/4] Verificando configuración de base de datos..."
echo "La base de datos debe estar creada antes de continuar."
echo
read -p "¿Ya creaste la base de datos con el script setup_database.sql? (s/n): " respuesta
if [[ ! "$respuesta" =~ ^[sS]$ ]]; then
    echo
    echo "⚠️  IMPORTANTE: Debes crear la base de datos primero:"
    echo "   1. Abre UniServerZ Control Panel"
    echo "   2. Inicia MySQL/MariaDB"
    echo "   3. Abre phpMyAdmin"
    echo "   4. Ejecuta el archivo: backend/database/setup_database.sql"
    echo "   5. Luego ejecuta este script nuevamente"
    echo
    exit 1
fi

echo
echo "[3/4] Iniciando servidor..."
echo
echo "✅ Servidor iniciado en: http://localhost:3001"
echo "✅ Frontend disponible en: http://localhost (o el puerto que uses)"
echo
echo "📋 CUENTAS DE PRUEBA:"
echo "   Admin: admin@test.com / password123"
echo "   Artista: artista@test.com / password123"
echo
echo "🛑 Presiona Ctrl+C para detener el servidor"
echo

npm start