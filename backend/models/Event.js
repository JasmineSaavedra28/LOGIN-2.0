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
    static async update(id, { title, description, event_date, venue, city }) {
        const [result] = await pool.execute(
            'UPDATE events SET title = ?, description = ?, event_date = ?, venue = ?, city = ? WHERE id = ?',
            [title, description, event_date, venue, city, id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = Event;