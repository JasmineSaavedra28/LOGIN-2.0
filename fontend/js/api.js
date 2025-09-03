// Configuración de la API
const API_BASE_URL = 'http://localhost:3001/api';

// Clase para manejar las llamadas a la API de forma segura
class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // Función para sanitizar datos antes de enviarlos
    sanitizeData(data) {
        if (typeof data === 'string') {
            return data.trim().replace(/[<>]/g, '');
        }
        if (typeof data === 'object') {
            const sanitized = {};
            for (const [key, value] of Object.entries(data)) {
                sanitized[key] = this.sanitizeData(value);
            }
            return sanitized;
        }
        return data;
    }

    // Función para mostrar mensajes de forma segura
    showMessage(elementId, message, type = 'info') {
        const element = document.getElementById(elementId);
        if (element) {
            // Usar textContent en lugar de innerHTML para prevenir XSS
            element.textContent = message;
            element.className = `message ${type}`;
            element.style.display = 'block';
        }
    }

    // Función para hacer requests HTTP seguros
    async makeRequest(endpoint, options = {}) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            const defaultOptions = {
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            };

            // Agregar token de autorización si existe
            const token = sessionStorage.getItem('token');
            if (token) {
                defaultOptions.headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(url, {
                ...defaultOptions,
                ...options
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error en la solicitud');
            }

            return data;
        } catch (error) {
            console.error('Error en API request:', error);
            throw error;
        }
    }

    // Método para registro
    async register(userData) {
        const sanitizedData = this.sanitizeData(userData);
        return await this.makeRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(sanitizedData)
        });
    }

    // Método para login
    async login(credentials) {
        const sanitizedData = this.sanitizeData(credentials);
        return await this.makeRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(sanitizedData)
        });
    }

    // Método para obtener perfil del usuario
    async getProfile() {
        return await this.makeRequest('/auth/profile');
    }

    // Método para verificar si el usuario está autenticado
    isAuthenticated() {
        const token = sessionStorage.getItem('token');
        return !!token;
    }

    // Método para cerrar sesión
    logout() {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('role');
        sessionStorage.removeItem('user');
        window.location.href = 'index.html';
    }

    // Método para redirigir según el rol
    redirectByRole(role) {
        switch (role) {
            case 'admin':
                window.location.href = 'panel_admin.html';
                break;
            case 'artista':
                window.location.href = 'panel_artista.html';
                break;
            default:
                window.location.href = 'index.html';
        }
    }

    // Método para obtener los eventos públicos
    async getPublicEvents() {
        return await this.makeRequest('/events');
    }
}

// Exportar la instancia del servicio
const apiService = new ApiService(); 