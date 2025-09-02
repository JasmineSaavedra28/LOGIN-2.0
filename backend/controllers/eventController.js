const Event = require('../models/Event');

/**
 * Crea un nuevo evento. Solo para artistas autenticados.
 */
exports.createEvent = async (req, res) => {
    try {
        // El ID del artista viene del token JWT (req.user.id)
        const artist_id = req.user.id;
        const eventId = await Event.create({ artist_id, ...req.body });

        // Aquí podrías registrar en el log de auditoría
        // await logAction(req.user.id, 'CREATE_EVENT', `Evento creado: ${eventId}`);

        res.status(201).json({ message: 'Evento creado exitosamente', eventId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear el evento' });
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
        res.status(200).json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los eventos públicos' });
    }
};
