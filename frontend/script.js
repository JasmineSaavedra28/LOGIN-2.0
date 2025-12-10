// ========================================
// MANEJO DE AUTENTICACIÓN
// ========================================

// Lógica de registro
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

// Lógica de login
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

// Logout
function logout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        apiService.logout();
    }
}

// ========================================
// GESTIÓN DE EVENTOS - PANEL DE ARTISTA
// ========================================

class EventManager {
    constructor() {
        this.api = apiService;
        this.init();
    }

    async init() {
        await this.loadMyEvents();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Formulario de creación de eventos
        const eventForm = document.getElementById('eventForm');
        if (eventForm) {
            eventForm.addEventListener('submit', (e) => this.handleCreateEvent(e));
        }

        // Botón para mostrar formulario de nuevo evento
        const showEventFormBtn = document.getElementById('showEventForm');
        if (showEventFormBtn) {
            showEventFormBtn.addEventListener('click', () => this.showEventForm());
        }

        // Botón para cancelar formulario
        const cancelEventBtn = document.getElementById('cancelEvent');
        if (cancelEventBtn) {
            cancelEventBtn.addEventListener('click', () => this.hideEventForm());
        }
    }

    async loadMyEvents() {
        const container = document.getElementById('my-events-container');
        if (!container) return;

        try {
            const response = await this.api.getMyEvents();
            this.renderEvents(response);
        } catch (error) {
            console.error('Error cargando eventos:', error);
            container.innerHTML = '<p class="error">Error al cargar tus eventos.</p>';
        }
    }

    renderEvents(events) {
        const container = document.getElementById('my-events-container');
        if (!container) return;

        container.innerHTML = '';

        if (events.length === 0) {
            container.innerHTML = '<p class="no-events">No tienes eventos creados. ¡Crea tu primer evento!</p>';
            return;
        }

        events.forEach(event => {
            const eventCard = this.createEventCard(event);
            container.appendChild(eventCard);
        });
    }

    createEventCard(event) {
        const card = document.createElement('div');
        card.className = 'event-card';
        
        const eventDate = new Date(event.event_date).toLocaleDateString('es-ES', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        const priceText = event.price ? ` - $${event.price}` : '';
        const ticketText = event.ticket_url ? ' | Entradas disponibles' : '';

        card.innerHTML = `
            <div class="event-header">
                <h3>${event.title}</h3>
                <span class="event-status ${event.status}">${event.status}</span>
            </div>
            <div class="event-details">
                <p><strong>📅 Fecha:</strong> ${eventDate}</p>
                <p><strong>📍 Lugar:</strong> ${event.venue}</p>
                <p><strong>🏙️ Ciudad:</strong> ${event.city}</p>
                <p><strong>🎫 Entrada:</strong> ${event.entry_type}${priceText}${ticketText}</p>
                ${event.description ? `<p><strong>📝 Descripción:</strong> ${event.description}</p>` : ''}
            </div>
            <div class="event-actions">
                <button onclick="eventManager.editEvent(${event.id})" class="btn-edit">✏️ Editar</button>
                <button onclick="eventManager.deleteEvent(${event.id})" class="btn-delete">🗑️ Eliminar</button>
            </div>
        `;

        return card;
    }

    showEventForm(eventId = null) {
        const form = document.getElementById('eventForm');
        const title = document.getElementById('eventFormTitle');
        
        if (eventId) {
            title.textContent = 'Editar Evento';
            this.loadEventForEdit(eventId);
        } else {
            title.textContent = 'Crear Nuevo Evento';
            form.reset();
            form.dataset.eventId = '';
        }
        
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });
    }

    hideEventForm() {
        const form = document.getElementById('eventForm');
        form.style.display = 'none';
        form.reset();
        form.dataset.eventId = '';
    }

    async loadEventForEdit(eventId) {
        try {
            const response = await this.api.getEventById(eventId);
            const event = response.event;
            
            // Llenar el formulario con los datos del evento
            document.getElementById('eventTitle').value = event.title;
            document.getElementById('eventDescription').value = event.description || '';
            document.getElementById('eventDate').value = event.event_date.split('T')[0];
            document.getElementById('eventTime').value = event.event_date.split('T')[1].substring(0, 5);
            document.getElementById('eventVenue').value = event.venue;
            document.getElementById('eventCity').value = event.city;
            document.getElementById('eventEntryType').value = event.entry_type;
            document.getElementById('eventPrice').value = event.price || '';
            document.getElementById('eventTicketUrl').value = event.ticket_url || '';
            document.getElementById('eventFlyerUrl').value = event.flyer_url || '';
            document.getElementById('eventStatus').value = event.status;
            
            document.getElementById('eventForm').dataset.eventId = eventId;
        } catch (error) {
            console.error('Error cargando evento para editar:', error);
            alert('Error al cargar el evento para editar.');
        }
    }

    async handleCreateEvent(e) {
        e.preventDefault();
        
        const form = e.target;
        const eventId = form.dataset.eventId;
        
        const eventData = {
            title: document.getElementById('eventTitle').value,
            description: document.getElementById('eventDescription').value,
            event_date: `${document.getElementById('eventDate').value}T${document.getElementById('eventTime').value}`,
            venue: document.getElementById('eventVenue').value,
            city: document.getElementById('eventCity').value,
            entry_type: document.getElementById('eventEntryType').value,
            price: document.getElementById('eventPrice').value || null,
            ticket_url: document.getElementById('eventTicketUrl').value || null,
            flyer_url: document.getElementById('eventFlyerUrl').value || null,
            status: document.getElementById('eventStatus').value
        };

        try {
            if (eventId) {
                // Actualizar evento existente
                await this.api.updateEvent(eventId, eventData);
                alert('Evento actualizado exitosamente');
            } else {
                // Crear nuevo evento
                await this.api.createEvent(eventData);
                alert('Evento creado exitosamente');
            }
            
            await this.loadMyEvents();
            this.hideEventForm();
        } catch (error) {
            console.error('Error guardando evento:', error);
            alert('Error al guardar el evento: ' + error.message);
        }
    }

    async editEvent(eventId) {
        this.showEventForm(eventId);
    }

    async deleteEvent(eventId) {
        if (!confirm('¿Estás seguro de que quieres eliminar este evento?')) {
            return;
        }

        try {
            await this.api.deleteEvent(eventId);
            await this.loadMyEvents();
            alert('Evento eliminado exitosamente');
        } catch (error) {
            console.error('Error eliminando evento:', error);
            alert('Error al eliminar el evento: ' + error.message);
        }
    }
}

// ========================================
// GESTIÓN DE PERFILES - PANEL DE ARTISTA
// ========================================

class ProfileManager {
    constructor() {
        this.api = apiService;
        this.init();
    }

    async init() {
        await this.loadMyProfile();
        this.setupProfileListeners();
    }

    setupProfileListeners() {
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
        }
    }

    async loadMyProfile() {
        try {
            const response = await this.api.getMyProfile();
            if (response.hasProfile) {
                this.populateProfileForm(response.profile);
            }
        } catch (error) {
            console.error('Error cargando perfil:', error);
            // El perfil no existe, está bien
        }
    }

    populateProfileForm(profile) {
        document.getElementById('photoUrl').value = profile.photo_url || '';
        document.getElementById('phone').value = profile.phone || '';
        document.getElementById('website').value = profile.website || '';
        document.getElementById('portfolioUrl').value = profile.portfolio_url || '';
        document.getElementById('spotifyUrl').value = profile.spotify_url || '';
        document.getElementById('appleMusicUrl').value = profile.apple_music_url || '';
        document.getElementById('tidalUrl').value = profile.tidal_url || '';
        document.getElementById('youtubeMusicUrl').value = profile.youtube_music_url || '';
        document.getElementById('youtubeChannelUrl').value = profile.youtube_channel_url || '';
        document.getElementById('instagramUrl').value = profile.instagram_url || '';
        document.getElementById('bio').value = profile.bio || '';
        document.getElementById('genre').value = profile.genre || '';
    }

    async handleProfileUpdate(e) {
        e.preventDefault();
        
        const profileData = {
            photo_url: document.getElementById('photoUrl').value || null,
            phone: document.getElementById('phone').value || null,
            website: document.getElementById('website').value || null,
            portfolio_url: document.getElementById('portfolioUrl').value || null,
            spotify_url: document.getElementById('spotifyUrl').value || null,
            apple_music_url: document.getElementById('appleMusicUrl').value || null,
            tidal_url: document.getElementById('tidalUrl').value || null,
            youtube_music_url: document.getElementById('youtubeMusicUrl').value || null,
            youtube_channel_url: document.getElementById('youtubeChannelUrl').value || null,
            instagram_url: document.getElementById('instagramUrl').value || null,
            bio: document.getElementById('bio').value || null,
            genre: document.getElementById('genre').value || null
        };

        try {
            await this.api.createOrUpdateProfile(profileData);
            alert('Perfil actualizado exitosamente');
        } catch (error) {
            console.error('Error actualizando perfil:', error);
            alert('Error al actualizar el perfil: ' + error.message);
        }
    }
}

// ========================================
// CARTELEERA PÚBLICA CON FILTROS
// ========================================

class BillboardManager {
    constructor() {
        this.api = apiService;
        this.allEvents = [];
        this.filteredEvents = [];
        this.currentFilters = {
            search: '',
            genre: 'all',
            modality: 'all',
            date: 'all'
        };
        this.init();
    }

    async init() {
        await this.loadEvents();
        this.setupFilterListeners();
        this.setupMobileMenu();
    }

    async loadEvents() {
        const loading = document.getElementById('loading');
        const container = document.getElementById('cartelera-container');
        const noEvents = document.getElementById('noEvents');
        
        // Mostrar loading
        loading.style.display = 'flex';
        container.style.display = 'none';
        noEvents.style.display = 'none';

        try {
            const response = await this.api.getPublicEvents();
            this.allEvents = response.events || [];
            this.filteredEvents = [...this.allEvents];
            
            this.renderEvents();
            this.updateResultsCount();
        } catch (error) {
            console.error('Error al cargar eventos:', error);
            container.innerHTML = '<p class="error">Error al cargar los eventos. Por favor, intenta de nuevo más tarde.</p>';
        } finally {
            loading.style.display = 'none';
            container.style.display = 'grid';
        }
    }

    setupFilterListeners() {
        // Búsqueda
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilters.search = e.target.value.toLowerCase();
                this.applyFilters();
            });
        }

        // Filtros de género
        const genreFilters = document.getElementById('genreFilters');
        if (genreFilters) {
            genreFilters.addEventListener('click', (e) => {
                if (e.target.classList.contains('filter-pill')) {
                    this.setActiveFilter('genreFilters', e.target);
                    this.currentFilters.genre = e.target.dataset.filter;
                    this.applyFilters();
                }
            });
        }

        // Filtros de modalidad
        const modalityFilters = document.getElementById('modalityFilters');
        if (modalityFilters) {
            modalityFilters.addEventListener('click', (e) => {
                if (e.target.classList.contains('filter-pill')) {
                    this.setActiveFilter('modalityFilters', e.target);
                    this.currentFilters.modality = e.target.dataset.filter;
                    this.applyFilters();
                }
            });
        }

        // Filtros de fecha
        const dateFilters = document.getElementById('dateFilters');
        if (dateFilters) {
            dateFilters.addEventListener('click', (e) => {
                if (e.target.classList.contains('filter-pill')) {
                    this.setActiveFilter('dateFilters', e.target);
                    this.currentFilters.date = e.target.dataset.filter;
                    this.applyFilters();
                }
            });
        }

        // Limpiar filtros
        const clearFiltersBtn = document.getElementById('clearFilters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }
    }

    setActiveFilter(containerId, activeButton) {
        const container = document.getElementById(containerId);
        container.querySelectorAll('.filter-pill').forEach(btn => {
            btn.classList.remove('active');
        });
        activeButton.classList.add('active');
    }

    applyFilters() {
        this.filteredEvents = this.allEvents.filter(event => {
            // Filtro de búsqueda
            const matchesSearch = !this.currentFilters.search || 
                event.title.toLowerCase().includes(this.currentFilters.search) ||
                event.artist_name.toLowerCase().includes(this.currentFilters.search) ||
                (event.description && event.description.toLowerCase().includes(this.currentFilters.search));

            // Filtro de género (si está disponible en los datos)
            const matchesGenre = this.currentFilters.genre === 'all' || 
                (event.genre && event.genre.toLowerCase() === this.currentFilters.genre.toLowerCase());

            // Filtro de modalidad
            const matchesModality = this.currentFilters.modality === 'all' || 
                event.entry_type.toLowerCase() === this.currentFilters.modality.toLowerCase();

            // Filtro de fecha
            const matchesDate = this.currentFilters.date === 'all' || 
                this.matchesDateFilter(event.event_date, this.currentFilters.date);

            return matchesSearch && matchesGenre && matchesModality && matchesDate;
        });

        this.renderEvents();
        this.updateResultsCount();
    }

    matchesDateFilter(eventDate, filter) {
        const event = new Date(eventDate);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const eventDay = new Date(event.getFullYear(), event.getMonth(), event.getDate());
        
        const diffTime = eventDay.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (filter) {
            case 'today':
                return diffDays === 0;
            case 'weekend':
                const dayOfWeek = event.getDay();
                return dayOfWeek === 0 || dayOfWeek === 6; // Domingo o Sábado
            case 'week':
                return diffDays >= 0 && diffDays <= 7;
            case 'month':
                return diffDays >= 0 && diffDays <= 30;
            default:
                return true;
        }
    }

    renderEvents() {
        const container = document.getElementById('cartelera-container');
        const noEvents = document.getElementById('noEvents');
        
        if (!container) return;

        container.innerHTML = '';

        if (this.filteredEvents.length === 0) {
            container.style.display = 'none';
            noEvents.style.display = 'block';
            return;
        }

        container.style.display = 'grid';
        noEvents.style.display = 'none';

        this.filteredEvents.forEach(event => {
            const eventCard = this.createModernEventCard(event);
            container.appendChild(eventCard);
        });
    }

    createModernEventCard(event) {
        const card = document.createElement('div');
        card.className = 'event-card fade-in';
        
        const eventDate = new Date(event.event_date);
        const dateFormatted = eventDate.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Determinar badges
        const badges = [];
        if (event.entry_type === 'gratuito') {
            badges.push('<span class="badge success">Gratis</span>');
        }
        if (event.price && event.price > 0) {
            badges.push('<span class="badge warning">Arancelado</span>');
        }

        // Determinar precio
        let priceText = 'Precio a consultar';
        if (event.entry_type === 'gratuito') {
            priceText = 'Entrada gratuita';
        } else if (event.price) {
            priceText = `$${event.price}`;
        }

        card.innerHTML = `
            <div class="event-image">
                ${event.flyer_url ? 
                    `<img src="${event.flyer_url}" alt="${event.title}" onerror="this.parentElement.innerHTML='<div class=\"event-image-placeholder\">🎵</div>'">` :
                    '<div class="event-image-placeholder">🎵</div>'
                }
                <div class="event-badges">
                    ${badges.join('')}
                </div>
            </div>
            <div class="event-content">
                <h3 class="event-title">${event.title}</h3>
                <p class="event-artist">por ${event.artist_name}</p>
                
                <div class="event-meta">
                    <div class="meta-item">
                        <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        ${dateFormatted}
                    </div>
                    <div class="meta-item">
                        <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        ${event.venue}
                    </div>
                    <div class="meta-item">
                        <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9,22 9,12 15,12 15,22"></polyline>
                        </svg>
                        ${event.city}
                    </div>
                </div>
                
                ${event.description ? `<p class="event-description">${event.description}</p>` : ''}
                
                <div class="event-footer">
                    <div class="event-price">${priceText}</div>
                    ${event.ticket_url ? 
                        `<a href="${event.ticket_url}" target="_blank" class="btn-primary">Comprar Entradas</a>` :
                        `<button class="btn-primary" onclick="showEventInfo('${event.id}')">Más Info</button>`
                    }
                </div>
            </div>
        `;

        return card;
    }

    updateResultsCount() {
        const resultsCount = document.getElementById('resultsCount');
        if (resultsCount) {
            const count = this.filteredEvents.length;
            const total = this.allEvents.length;
            
            if (count === total) {
                resultsCount.textContent = `${total} eventos encontrados`;
            } else {
                resultsCount.textContent = `${count} de ${total} eventos`;
            }
        }
    }

    clearAllFilters() {
        // Reset filtros
        this.currentFilters = {
            search: '',
            genre: 'all',
            modality: 'all',
            date: 'all'
        };

        // Reset UI
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = '';

        // Reset botones activos
        ['genreFilters', 'modalityFilters', 'dateFilters'].forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.querySelectorAll('.filter-pill').forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.dataset.filter === 'all') {
                        btn.classList.add('active');
                    }
                });
            }
        });

        // Aplicar filtros (mostrar todos)
        this.applyFilters();
    }

    setupMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const nav = document.querySelector('.nav');
        
        if (mobileMenuBtn && nav) {
            mobileMenuBtn.addEventListener('click', () => {
                nav.classList.toggle('mobile-open');
                mobileMenuBtn.classList.toggle('active');
            });
        }
    }
}

// Función global para limpiar filtros
function clearAllFilters() {
    if (window.billboardManager) {
        window.billboardManager.clearAllFilters();
    }
}

// Función global para mostrar info del evento
function showEventInfo(eventId) {
    // Aquí se podría implementar un modal con más información
    alert('Funcionalidad de información detallada próximamente');
}

// ========================================
// PANEL DEL ARTISTA EN INDEX
// ========================================

class ArtistIndexPanel {
    constructor() {
        this.apiService = apiService;
        this.init();
    }

    async init() {
        // Verificar si el usuario está autenticado y es artista
        if (!this.apiService.isAuthenticated()) {
            return;
        }

        const role = sessionStorage.getItem('role');
        if (role !== 'artista') {
            return;
        }

        // Mostrar panel del artista
        await this.loadArtistPanel();
        this.setupEventListeners();
    }

    async loadArtistPanel() {
        try {
            // Obtener información del usuario
            const user = JSON.parse(sessionStorage.getItem('user'));
            
            // Mostrar panel y cargar datos
            document.getElementById('artistPanelSection').style.display = 'block';
            document.getElementById('artistName').textContent = user?.name || 'Artista';
            
            // Cargar estadísticas
            await this.loadArtistStats();
            
            // Cargar eventos del artista
            await this.loadArtistEvents();
            
        } catch (error) {
            console.error('Error cargando panel del artista:', error);
        }
    }

    async loadArtistStats() {
        try {
            // Simular estadísticas del artista
            const stats = {
                activeEvents: Math.floor(Math.random() * 5) + 1,
                upcomingEvents: Math.floor(Math.random() * 3) + 1,
                totalViews: Math.floor(Math.random() * 500) + 100
            };

            document.getElementById('activeEventsCount').textContent = stats.activeEvents;
            document.getElementById('upcomingEventsCount').textContent = stats.upcomingEvents;
            document.getElementById('totalViews').textContent = stats.totalViews.toLocaleString();
            
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
        }
    }

    async loadArtistEvents() {
        try {
            // Simular eventos del artista
            const mockEvents = [
                {
                    id: 1,
                    title: 'Noche de Rock Nacional',
                    date: '2025-12-15',
                    time: '21:00',
                    venue: 'Club de Rock',
                    city: 'Buenos Aires',
                    status: 'activo'
                },
                {
                    id: 2,
                    title: 'Acústico en el Café',
                    date: '2025-12-20',
                    time: '20:30',
                    venue: 'Café Central',
                    city: 'Córdoba',
                    status: 'activo'
                }
            ];

            this.displayArtistEvents(mockEvents);
            
        } catch (error) {
            console.error('Error cargando eventos del artista:', error);
            this.showNoArtistEvents();
        }
    }

    displayArtistEvents(events) {
        const container = document.getElementById('artistEventsContainer');
        const noEventsDiv = document.getElementById('noArtistEvents');
        
        if (!events || events.length === 0) {
            this.showNoArtistEvents();
            return;
        }

        noEventsDiv.style.display = 'none';
        container.style.display = 'grid';
        
        container.innerHTML = events.map(event => `
            <div class="artist-event-card">
                <div class="artist-event-header">
                    <h4 class="artist-event-title">${this.escapeHtml(event.title)}</h4>
                    <span class="artist-event-status status-${event.status}">${this.getStatusText(event.status)}</span>
                </div>
                <div class="artist-event-details">
                    <p><strong>📅 ${this.formatDate(event.date)}</strong></p>
                    <p><strong>🕐 ${event.time}</strong></p>
                    <p>📍 ${this.escapeHtml(event.venue)} - ${this.escapeHtml(event.city)}</p>
                </div>
                <div class="artist-event-actions">
                    <button class="btn-edit-event" onclick="editArtistEvent(${event.id})">✏️ Editar</button>
                    <button class="btn-view-event" onclick="viewArtistEvent(${event.id})">👁️ Ver</button>
                </div>
            </div>
        `).join('');
    }

    showNoArtistEvents() {
        document.getElementById('artistEventsContainer').style.display = 'none';
        document.getElementById('noArtistEvents').style.display = 'block';
    }

    setupEventListeners() {
        // Botón de crear evento rápido
        const quickAddEvent = document.getElementById('quickAddEvent');
        if (quickAddEvent) {
            quickAddEvent.addEventListener('click', () => {
                window.open('panel_artista.html', '_blank');
            });
        }

        // Botón de editar perfil rápido
        const quickEditProfile = document.getElementById('quickEditProfile');
        if (quickEditProfile) {
            quickEditProfile.addEventListener('click', () => {
                window.open('panel_artista.html', '_blank');
            });
        }

        // Botón de ver mis eventos
        const quickViewMyEvents = document.getElementById('quickViewMyEvents');
        if (quickViewMyEvents) {
            quickViewMyEvents.addEventListener('click', () => {
                window.open('panel_artista.html', '_blank');
            });
        }

        // Botón de crear primer evento
        const createFirstEvent = document.getElementById('createFirstEvent');
        if (createFirstEvent) {
            createFirstEvent.addEventListener('click', () => {
                window.open('panel_artista.html', '_blank');
            });
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    getStatusText(status) {
        const statusMap = {
            'activo': 'Activo',
            'cancelado': 'Cancelado',
            'postponed': 'Pospuesto'
        };
        return statusMap[status] || status;
    }
}

// Funciones globales para manejar eventos del artista
function editArtistEvent(eventId) {
    window.open(`panel_artista.html?edit=${eventId}`, '_blank');
}

function viewArtistEvent(eventId) {
    // Aquí se podría implementar un modal o redirigir a una vista detallada
    alert(`Ver detalles del evento ${eventId} - Funcionalidad próximamente`);
}

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticación en páginas protegidas
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('panel_artista.html') && !apiService.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    // Inicializar gestores según la página
    if (currentPage.includes('panel_artista.html')) {
        window.eventManager = new EventManager();
        window.profileManager = new ProfileManager();
    } else if (currentPage.includes('index.html') || currentPage === '/' || currentPage.endsWith('/')) {
        window.billboardManager = new BillboardManager();
        window.artistIndexPanel = new ArtistIndexPanel();
    }
});