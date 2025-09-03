const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth'); // Asumo que tienes un middleware authorize
const validation = require('../middleware/validation'); // Necesitarás crear esta validación

// --- Rutas Públicas ---
// Cualquiera puede ver la cartelera de eventos
router.get('/', eventController.getPublicEvents);

// --- Rutas Protegidas para Artistas ---
// Solo los usuarios con rol 'artista' pueden gestionar eventos.

// Obtener los eventos del artista logueado
router.get('/my-events', protect, authorize('artista'), eventController.getMyEvents);

// Crear un nuevo evento
router.post('/', protect, authorize('artista'), validation.validateEvent, eventController.createEvent);

module.exports = router;