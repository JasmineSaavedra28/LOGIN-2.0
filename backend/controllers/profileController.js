const ArtistProfile = require('../models/ArtistProfile');
const { logAction } = require('../middleware/logger');

/**
 * Obtiene el perfil del artista autenticado.
 */
exports.getMyProfile = async (req, res) => {
    try {
        const user_id = req.user.id;
        const profile = await ArtistProfile.findByUserId(user_id);
        
        if (!profile) {
            return res.status(404).json({ 
                message: 'Perfil no encontrado. Debes crear tu perfil primero.',
                hasProfile: false
            });
        }

        res.status(200).json({
            success: true,
            hasProfile: true,
            profile
        });
    } catch (error) {
        console.error('Error obteniendo perfil:', error);
        res.status(500).json({ 
            message: 'Error al obtener el perfil',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
        });
    }
};

/**
 * Crea o actualiza el perfil del artista.
 */
exports.createOrUpdateProfile = async (req, res) => {
    try {
        const user_id = req.user.id;
        const profileData = req.body;
        
        // Verificar si el perfil ya existe
        const existingProfile = await ArtistProfile.findByUserId(user_id);
        
        let result;
        if (existingProfile) {
            // Actualizar perfil existente
            result = await ArtistProfile.update(user_id, profileData);
            
            if (!result) {
                return res.status(404).json({ message: 'Perfil no encontrado para actualizar' });
            }
            
            // Log de auditoría
            await logAction(user_id, 'UPDATE_PROFILE', 'Perfil actualizado', req.ip);
            
            res.status(200).json({
                message: 'Perfil actualizado exitosamente',
                profile: await ArtistProfile.findByUserId(user_id)
            });
        } else {
            // Crear nuevo perfil
            result = await ArtistProfile.create(user_id, profileData);
            
            // Log de auditoría
            await logAction(user_id, 'CREATE_PROFILE', 'Perfil creado', req.ip);
            
            res.status(201).json({
                message: 'Perfil creado exitosamente',
                profile: result
            });
        }
    } catch (error) {
        console.error('Error creando/actualizando perfil:', error);
        res.status(500).json({ 
            message: 'Error al procesar el perfil',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
        });
    }
};

/**
 * Elimina (desactiva) el perfil del artista.
 */
exports.deleteProfile = async (req, res) => {
    try {
        const user_id = req.user.id;
        
        const deleted = await ArtistProfile.delete(user_id);
        
        if (!deleted) {
            return res.status(404).json({ message: 'Perfil no encontrado' });
        }
        
        // Log de auditoría
        await logAction(user_id, 'DELETE_PROFILE', 'Perfil eliminado', req.ip);
        
        res.status(200).json({
            message: 'Perfil eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error eliminando perfil:', error);
        res.status(500).json({ 
            message: 'Error al eliminar el perfil',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
        });
    }
};

/**
 * Obtiene todos los perfiles de artistas activos (para cartelera).
 */
exports.getAllProfiles = async (req, res) => {
    try {
        const { genre } = req.query;
        
        let profiles;
        if (genre) {
            profiles = await ArtistProfile.findByGenre(genre);
        } else {
            profiles = await ArtistProfile.findAllActive();
        }
        
        res.status(200).json({
            success: true,
            count: profiles.length,
            profiles
        });
    } catch (error) {
        console.error('Error obteniendo perfiles:', error);
        res.status(500).json({ 
            message: 'Error al obtener los perfiles',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
        });
    }
};