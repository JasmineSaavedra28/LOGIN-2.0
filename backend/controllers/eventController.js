const Event = require('../models/Event');
const { logAction } = require('../middleware/logger');

/**
 * Crea un nuevo evento. Solo para artistas autenticados.
 */
exports.createEvent = async (req, res) => {
    try {
        // El ID del artista viene del token JWT (req.user.id)
        const artist_id = req.user.id;
        
        // Asegurar que el estado por defecto sea 'activo'
        const eventData = {
            artist_id,
            ...req.body,
            status: req.body.status || 'activo',
            entry_type: req.body.entry_type || 'gratuito'
        };
        
        const eventId = await Event.create(eventData);

        // Log de auditoría
        await logAction(req.user.id, 'CREATE_EVENT', `Evento creado: ${eventId}`, req.ip);

        res.status(201).json({ 
            message: 'Evento creado exitosamente', 
            eventId,
            event: await Event.findById(eventId)
        });
    } catch (error) {
        console.error('Error creando evento:', error);
        res.status(500).json({ 
            message: 'Error al crear el evento',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
        });
    }
};

/**
 * Obtiene los eventos del artista que ha iniciado sesión.
 */
exports.getMyEvents = async (req, res) => {
    try {
        const events = await Event.findByArtist(req.user.id);
        res.status(200).json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los eventos' });
    }
};

/**
 * Obtiene todos los eventos futuros para la cartelera pública.
 */
exports.getPublicEvents = async (req, res) => {
    try {
        const events = await Event.findAllPublic();
        res.status(200).json({
            success: true,
            count: events.length,
            events
        });
    } catch (error) {
        console.error('Error obteniendo eventos públicos:', error);
        res.status(500).json({ 
            message: 'Error al obtener los eventos públicos',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
        });
    }
};

/**
 * Obtiene un evento específico por ID.
 */
exports.getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findById(id);
        
        if (!event) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }

        res.status(200).json({
            success: true,
            event
        });
    } catch (error) {
        console.error('Error obteniendo evento:', error);
        res.status(500).json({ 
            message: 'Error al obtener el evento',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
        });
    }
};

/**
 * Actualiza un evento existente.
 */
exports.updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const artist_id = req.user.id;

        // Verificar que el evento pertenece al artista
        const belongsToArtist = await Event.belongsToArtist(id, artist_id);
        if (!belongsToArtist) {
            return res.status(403).json({ 
                message: 'No tienes permisos para editar este evento' 
            });
        }

        const updated = await Event.update(id, req.body);

        if (!updated) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }

        // Log de auditoría
        await logAction(artist_id, 'UPDATE_EVENT', `Evento actualizado: ${id}`, req.ip);

        res.status(200).json({ 
            message: 'Evento actualizado exitosamente',
            event: await Event.findById(id)
        });
    } catch (error) {
        console.error('Error actualizando evento:', error);
        res.status(500).json({ 
            message: 'Error al actualizar el evento',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
        });
    }
};

/**
 * Elimina un evento.
 */
exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const artist_id = req.user.id;

        // Verificar que el evento pertenece al artista
        const belongsToArtist = await Event.belongsToArtist(id, artist_id);
        if (!belongsToArtist) {
            return res.status(403).json({ 
                message: 'No tienes permisos para eliminar este evento' 
            });
        }

        const deleted = await Event.delete(id);

        if (!deleted) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }

        // Log de auditoría
        await logAction(artist_id, 'DELETE_EVENT', `Evento eliminado: ${id}`, req.ip);

        res.status(200).json({ 
            message: 'Evento eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error eliminando evento:', error);
        res.status(500).json({ 
            message: 'Error al eliminar el evento',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
        });
    }
};
