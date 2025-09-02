// Importar el servicio de API
// Nota: En un entorno real, esto se haría con módulos ES6

// Lógica de registro
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role')?.value || 'artista';

        const result = await apiService.register({ name, email, password, role });
        
        // Mostrar mensaje de éxito de forma segura
        apiService.showMessage('message', result.message, 'success');
        
        // Limpiar formulario
        e.target.reset();
        
        // Redirigir después de un breve delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        
    } catch (error) {
        // Mostrar mensaje de error de forma segura
        apiService.showMessage('message', error.message, 'error');
    }
});

// Lógica de login
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const result = await apiService.login({ email, password });
        
        // Guardar datos del usuario de forma segura
        sessionStorage.setItem('token', result.token);
        sessionStorage.setItem('role', result.user.role);
        sessionStorage.setItem('user', JSON.stringify(result.user));
        
        // Mostrar mensaje de éxito
        apiService.showMessage('message', result.message, 'success');
        
        // Redirigir según el rol
        setTimeout(() => {
            apiService.redirectByRole(result.user.role);
        }, 1000);
        
    } catch (error) {
        // Mostrar mensaje de error de forma segura
        apiService.showMessage('message', error.message, 'error');
    }
});

// Función para verificar autenticación al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // Si el usuario ya está autenticado, redirigir
    if (apiService.isAuthenticated()) {
        const role = sessionStorage.getItem('role');
        apiService.redirectByRole(role);
    }
});
