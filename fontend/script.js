// Lógica de registro (para register.html)
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role')?.value || 'artista';

        const result = await apiService.register({ name, email, password, role });
        apiService.showMessage('message', result.message, 'success');
        e.target.reset();
        
        // Redirigir a la página de login después del registro
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        
    } catch (error) {
        apiService.showMessage('message', error.message, 'error');
    }
});

// Lógica de login (para login.html)
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const result = await apiService.login({ email, password });
        
        sessionStorage.setItem('token', result.token);
        sessionStorage.setItem('role', result.user.role);
        sessionStorage.setItem('user', JSON.stringify(result.user));
        
        apiService.showMessage('message', result.message, 'success');
        
        setTimeout(() => {
            apiService.redirectByRole(result.user.role);
        }, 1000);
        
    } catch (error) {
        apiService.showMessage('message', error.message, 'error');
    }
});

// --- Lógica para la Cartelera (para index.html) ---

/**
 * Carga y muestra los eventos públicos en la cartelera.
 */
async function loadPublicEvents() {
    const container = document.getElementById('cartelera-container');
    if (!container) return; // No hacer nada si no estamos en la página de la cartelera

    try {
        const events = await apiService.getPublicEvents();

        if (events.length === 0) {
            container.innerHTML = '<p>No hay eventos próximos en este momento.</p>';
            return;
        }

        // Limpiar el contenedor
        container.innerHTML = '';

        // Crear y añadir la tarjeta de cada evento
        events.forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.className = 'card';

            // Formatear la fecha para que sea más legible
            const eventDate = new Date(event.event_date).toLocaleDateString('es-ES', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });

            eventCard.innerHTML = `
                <h3>${event.title}</h3>
                <p><strong>Artista:</strong> ${event.artist_name}</p>
                <p><strong>Fecha:</strong> ${eventDate}</p>
                <p><strong>Lugar:</strong> ${event.venue}</p>
                <p><strong>Ciudad:</strong> ${event.city}</p>
                <p>${event.description}</p>
            `;
            container.appendChild(eventCard);
        });

    } catch (error) {
        container.innerHTML = '<p>Error al cargar los eventos. Por favor, intenta de nuevo más tarde.</p>';
        console.error('Error al cargar eventos:', error);
    }
}

// Ejecutar la carga de eventos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Solo cargar eventos si estamos en la página principal (index.html)
    if (document.getElementById('cartelera-container')) {
        loadPublicEvents();
    }
});