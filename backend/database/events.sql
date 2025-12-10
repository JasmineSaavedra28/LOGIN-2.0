-- Script para crear la tabla de eventos.
-- Puedes ejecutar esto en phpMyAdmin o cualquier cliente de MySQL.

CREATE TABLE IF NOT EXISTS `events` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `artist_id` INT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `event_date` DATETIME NOT NULL,
    `venue` VARCHAR(255) NOT NULL,
    `city` VARCHAR(100) NOT NULL,
    `entry_type` ENUM('gorra', 'gratuito', 'beneficio', 'arancelado') NOT NULL DEFAULT 'gratuito',
    `price` DECIMAL(10,2) DEFAULT NULL,
    `ticket_url` VARCHAR(500) DEFAULT NULL,
    `flyer_url` VARCHAR(500) DEFAULT NULL,
    `status` ENUM('activo', 'cancelado', 'postponed') DEFAULT 'activo',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`artist_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_event_date ON events(event_date);
CREATE INDEX idx_artist_id ON events(artist_id);
CREATE INDEX idx_status ON events(status);

-- Script para crear la tabla de perfiles de artista.
-- Contiene información específica del artista para su perfil público.

CREATE TABLE IF NOT EXISTS `artist_profiles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `photo_url` VARCHAR(500) DEFAULT NULL,
    `phone` VARCHAR(20) DEFAULT NULL,
    `website` VARCHAR(500) DEFAULT NULL,
    `portfolio_url` VARCHAR(500) DEFAULT NULL,
    `spotify_url` VARCHAR(500) DEFAULT NULL,
    `apple_music_url` VARCHAR(500) DEFAULT NULL,
    `tidal_url` VARCHAR(500) DEFAULT NULL,
    `youtube_music_url` VARCHAR(500) DEFAULT NULL,
    `youtube_channel_url` VARCHAR(500) DEFAULT NULL,
    `instagram_url` VARCHAR(500) DEFAULT NULL,
    `bio` TEXT DEFAULT NULL,
    `genre` VARCHAR(100) DEFAULT NULL,
    `active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_user_id ON artist_profiles(user_id);
CREATE INDEX idx_active ON artist_profiles(active);