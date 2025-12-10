-- ========================================
-- SCRIPT DE CONFIGURACIÓN COMPLETA - Musicalendaria
-- Para UniServerZ y MySQL/MariaDB
-- ========================================

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS musicalendaria CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE musicalendaria;

-- ========================================
-- TABLA USUARIOS (Principal)
-- ========================================
CREATE TABLE IF NOT EXISTS `usuarios` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) UNIQUE NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('artista', 'admin') NOT NULL DEFAULT 'artista',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `last_login` TIMESTAMP NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `login_attempts` INT DEFAULT 0,
    `locked_until` TIMESTAMP NULL,
    INDEX idx_usuarios_email (email),
    INDEX idx_usuarios_role (role),
    INDEX idx_usuarios_created_at (created_at)
);

-- ========================================
-- TABLA PERFILES DE ARTISTA
-- ========================================
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
    FOREIGN KEY (`user_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_active (artist_profiles.active)
);

-- ========================================
-- TABLA EVENTOS
-- ========================================
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
    FOREIGN KEY (`artist_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE,
    INDEX idx_event_date (event_date),
    INDEX idx_artist_id (artist_id),
    INDEX idx_status (events.status)
);

-- ========================================
-- TABLA DE AUDITORÍA
-- ========================================
CREATE TABLE IF NOT EXISTS `audit_log` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NULL,
    `action` VARCHAR(100) NOT NULL,
    `details` JSON,
    `ip_address` VARCHAR(45),
    `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_timestamp (timestamp)
);

-- ========================================
-- USUARIOS DE PRUEBA
-- ========================================

-- Insertar usuario administrador
INSERT IGNORE INTO `usuarios` (`name`, `email`, `password`, `role`) VALUES 
('Admin Principal', 'admin@test.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewLBe9v1sG2x1XyS', 'admin');

-- Insertar usuario artista de prueba
INSERT IGNORE INTO `usuarios` (`name`, `email`, `password`, `role`) VALUES 
('Artista Demo', 'artista@test.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewLBe9v1sG2x1XyS', 'artista');

-- Nota: Las contraseñas hasheadas corresponden a 'password123'

-- ========================================
-- EVENTOS DE EJEMPLO
-- ========================================

-- Obtener el ID del artista demo
SET @artista_demo_id = (SELECT id FROM usuarios WHERE email = 'artista@test.com');

-- Insertar eventos de ejemplo
INSERT IGNORE INTO `events` (`artist_id`, `title`, `description`, `event_date`, `venue`, `city`, `entry_type`, `price`, `status`) VALUES 
(@artista_demo_id, 'Noche de Rock Nacional', 'Una noche épica con los mejores covers de rock nacional', '2025-12-20 20:00:00', 'Estadio Luna Park', 'Buenos Aires', 'arancelado', 3500.00, 'activo'),
(@artista_demo_id, 'Acústico Bajo las Estrellas', 'Show íntimo al aire libre con repertorio original', '2025-12-25 21:30:00', 'Parque de la Música', 'Córdoba', 'gratuito', NULL, 'activo'),
(@artista_demo_id, 'Festival de Jazz Underground', 'Festival de jazz con artistas locales e internacionales', '2025-12-31 19:00:00', 'Centro Cultural', 'Mendoza', 'gorra', 2000.00, 'activo');

-- ========================================
-- PERFIL DE ARTISTA DE EJEMPLO
-- ========================================

INSERT IGNORE INTO `artist_profiles` (`user_id`, `bio`, `genre`, `spotify_url`, `instagram_url`, `website`) VALUES 
(@artista_demo_id, 'Artista emergente con un estilo único que fusiona rock, pop y música electrónica. Con más de 5 años de experiencia en la escena musical local.', 'Rock Pop Electrónico', 'https://open.spotify.com/artist/artist_demo', 'https://instagram.com/artist_demo', 'https://artistdemo.com');

-- ========================================
-- MENSAJE DE CONFIRMACIÓN
-- ========================================
SELECT 'Base de datos Musicalendaria configurada exitosamente!' as mensaje,
       (SELECT COUNT(*) FROM usuarios) as total_usuarios,
       (SELECT COUNT(*) FROM events) as total_eventos,
       (SELECT COUNT(*) FROM artist_profiles) as perfiles_artista;