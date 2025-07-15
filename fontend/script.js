// Lógica de registro
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const res = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    document.getElementById('message').textContent = data.message;
});

// Lógica de login
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    await loginUser(email, password);
});

async function loginUser(email, password) {
    const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (response.ok) {
        // Guardar token y rol en sessionStorage
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('role', data.role);
        // Redirigir según el rol
        if (data.role === 'admin') {
            window.location.href = 'panel_admin.html';
        } else {
            window.location.href = 'panel_artista.html';
        }
    } else {
        alert(data.message || 'Error al iniciar sesión');
    }
}
