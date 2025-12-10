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

// Obtener un evento específico
router.get('/:id', eventController.getEventById);

// Actualizar un evento
router.put('/:id', protect, authorize('artista'), validation.validateEvent, eventController.updateEvent);

// Eliminar un evento
router.delete('/:id', protect, authorize('artista'), eventController.deleteEvent);

module.exports = router;