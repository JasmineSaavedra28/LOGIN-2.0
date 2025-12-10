const pool = require('../config/database');

class ArtistProfile {
    /**
     * Busca el perfil de un artista por ID de usuario.
     */
    static async findByUserId(user_id) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM artist_profiles WHERE user_id = ? AND active = TRUE',
                [user_id]
            );
            return rows[0] || null;
        } catch (error) {
            throw new Error('Error al buscar perfil de artista: ' + error.message);
        }
    }

    /**
     * Crea un nuevo perfil de artista.
     */
    static async create(user_id, profileData) {
        try {
            const {
                photo_url, phone, website, portfolio_url,
                spotify_url, apple_music_url, tidal_url, youtube_music_url,
                youtube_channel_url, instagram_url, bio, genre
            } = profileData;

            const [result] = await pool.execute(
                `INSERT INTO artist_profiles (
                    user_id, photo_url, phone, website, portfolio_url,
                    spotify_url, apple_music_url, tidal_url, youtube_music_url,
                    youtube_channel_url, instagram_url, bio, genre
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    user_id, photo_url, phone, website, portfolio_url,
                    spotify_url, apple_music_url, tidal_url, youtube_music_url,
                    youtube_channel_url, instagram_url, bio, genre
                ]
            );

            return {
                id: result.insertId,
                user_id,
                ...profileData
            };
        } catch (error) {
            throw new Error('Error al crear perfil de artista: ' + error.message);
        }
    }

    /**
     * Actualiza el perfil de un artista.
     */
    static async update(user_id, updateData) {
        try {
            const fields = [];
            const values = [];
            
            Object.keys(updateData).forEach(key => {
                if (updateData[key] !== undefined) {
                    fields.push(`${key} = ?`);
                    values.push(updateData[key]);
                }
            });
            
            if (fields.length === 0) {
                throw new Error('No hay datos para actualizar');
            }
            
            values.push(user_id);
            
            const [result] = await pool.execute(
                `UPDATE artist_profiles SET ${fields.join(', ')}, updated_at = NOW() WHERE user_id = ?`,
                values
            );
            
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error('Error al actualizar perfil de artista: ' + error.message);
        }
    }

    /**
     * Desactiva (soft delete) el perfil de un artista.
     */
    static async delete(user_id) {
        try {
            const [result] = await pool.execute(
                'UPDATE artist_profiles SET active = FALSE WHERE user_id = ?',
                [user_id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error('Error al desactivar perfil de artista: ' + error.message);
        }
    }

    /**
     * Obtiene todos los perfiles activos de artistas (para cartelera).
     */
    static async findAllActive() {
        try {
            const [rows] = await pool.execute(
                `SELECT ap.*, u.name as artist_name, u.email 
                 FROM artist_profiles ap 
                 JOIN usuarios u ON ap.user_id = u.id 
                 WHERE ap.active = TRUE 
                 ORDER BY u.name ASC`
            );
            return rows;
        } catch (error) {
            throw new Error('Error al buscar perfiles activos: ' + error.message);
        }
    }

    /**
     * Busca artistas por género musical.
     */
    static async findByGenre(genre) {
        try {
            const [rows] = await pool.execute(
                `SELECT ap.*, u.name as artist_name 
                 FROM artist_profiles ap 
                 JOIN usuarios u ON ap.user_id = u.id 
                 WHERE ap.active = TRUE AND ap.genre LIKE ? 
                 ORDER BY u.name ASC`,
                [`%${genre}%`]
            );
            return rows;
        } catch (error) {
            throw new Error('Error al buscar artistas por género: ' + error.message);
        }
    }
}

module.exports = ArtistProfile;