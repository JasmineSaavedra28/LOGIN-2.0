const pool = require('../config/database');

class Event {
    /**
     * Crea un nuevo evento en la base de datos.
     */
    static async create({ artist_id, title, description, event_date, venue, city }) {
        const [result] = await pool.execute(
            'INSERT INTO events (artist_id, title, description, event_date, venue, city) VALUES (?, ?, ?, ?, ?, ?)',
            [artist_id, title, description, event_date, venue, city]
        );
        return result.insertId;
    }

    /**
     * Busca todos los eventos de un artista específico.
     */
    static async findByArtist(artist_id) {
        const [rows] = await pool.execute('SELECT * FROM events WHERE artist_id = ? ORDER BY event_date DESC', [artist_id]);
        return rows;
    }

    /**
     * Busca todos los eventos para la cartelera pública.
     */
    static async findAllPublic() {
        const [rows] = await pool.execute(
            `SELECT e.id, e.title, e.description, e.event_date, e.venue, e.city, u.name as artist_name 
             FROM events e 
             JOIN usuarios u ON e.artist_id = u.id 
             WHERE e.event_date >= CURDATE() 
             ORDER BY e.event_date ASC`
        );
        return rows;
    }

    /**
     * Actualiza un evento.
     */
    static async update(id, updateData) {
        try {
            const { title, description, event_date, venue, city, entry_type, price, ticket_url, flyer_url, status } = updateData;
            
            const [result] = await pool.execute(
                `UPDATE events SET 
                 title = ?, description = ?, event_date = ?, venue = ?, city = ?, 
                 entry_type = ?, price = ?, ticket_url = ?, flyer_url = ?, status = ? 
                 WHERE id = ?`,
                [title, description, event_date, venue, city, entry_type, price, ticket_url, flyer_url, status, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error('Error al actualizar evento: ' + error.message);
        }
    }

    /**
     * Elimina un evento.
     */
    static async delete(id) {
        try {
            const [result] = await pool.execute('DELETE FROM events WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error('Error al eliminar evento: ' + error.message);
        }
    }

    /**
     * Busca un evento por ID.
     */
    static async findById(id) {
        try {
            const [rows] = await pool.execute(
                `SELECT e.*, u.name as artist_name 
                 FROM events e 
                 JOIN usuarios u ON e.artist_id = u.id 
                 WHERE e.id = ?`,
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            throw new Error('Error al buscar evento por ID: ' + error.message);
        }
    }

    /**
     * Verifica si un evento pertenece al artista.
     */
    static async belongsToArtist(eventId, artistId) {
        try {
            const [rows] = await pool.execute(
                'SELECT id FROM events WHERE id = ? AND artist_id = ?',
                [eventId, artistId]
            );
            return rows.length > 0;
        } catch (error) {
            throw new Error('Error al verificar propiedad del evento: ' + error.message);
        }
    }
}

module.exports = Event;