const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { protect, authorize } = require('../middleware/auth');
const { validateProfile, handleValidationErrors } = require('../middleware/validation');

// --- Rutas Públicas ---
// Obtener todos los perfiles de artistas (para cartelera)
router.get('/', profileController.getAllProfiles);

// --- Rutas Protegidas para Artistas ---
// Solo los usuarios con rol 'artista' pueden gestionar sus perfiles.

// Obtener mi perfil
router.get('/me', protect, authorize('artista'), profileController.getMyProfile);

// Crear o actualizar mi perfil
router.post('/', protect, authorize('artista'), validateProfile, handleValidationErrors, profileController.createOrUpdateProfile);

// Actualizar mi perfil (PUT es más explícito para actualización)
router.put('/', protect, authorize('artista'), validateProfile, handleValidationErrors, profileController.createOrUpdateProfile);

// Eliminar mi perfil
router.delete('/', protect, authorize('artista'), profileController.deleteProfile);

module.exports = router;