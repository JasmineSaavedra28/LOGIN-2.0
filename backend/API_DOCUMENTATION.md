# API Documentation - Musicalendaria v2.0

## Overview

Musicalendaria provides a RESTful API for managing musical events, user authentication, and administrative functions. This documentation covers all available endpoints, request/response formats, authentication requirements, and error handling.

**Base URL:** `http://localhost:3001/api`  
**Authentication:** JWT Bearer tokens  
**Content-Type:** `application/json`  
**API Version:** 2.0.0  

---

## Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Token Expiration
- JWT tokens expire after 1 hour
- Expired tokens will return 401 Unauthorized
- Clients should implement token refresh logic

### Rate Limiting
- **Authentication endpoints:** 5 requests per 15 minutes
- **General API:** 100 requests per 15 minutes
- Exceeding limits returns 429 Too Many Requests

---

## Error Responses

All errors follow a consistent format:

```json
{
    "message": "Descriptive error message",
    "error": "Additional error details (development only)",
    "code": "ERROR_CODE"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

---

## Authentication Endpoints

### POST /auth/register

Register a new user in the system.

**Request Body:**
```json
{
    "name": "Artist Name",
    "email": "artist@example.com",
    "password": "securePassword123",
    "role": "artista"
}
```

**Parameters:**
- `name` (string, required) - User's full name
- `email` (string, required) - Valid email address (must be unique)
- `password` (string, required) - Minimum 6 characters
- `role` (string, optional) - Either "artista" or "admin" (default: "artista")

**Success Response (201):**
```json
{
    "message": "Usuario registrado exitosamente",
    "user": {
        "id": 1,
        "name": "Artist Name",
        "email": "artist@example.com",
        "role": "artista"
    }
}
```

**Error Responses:**
- `400` - Validation error (missing fields, invalid email, weak password)
- `409` - User already exists

**Rate Limit:** 5 requests per 15 minutes

---

### POST /auth/login

Authenticate user and receive JWT token.

**Request Body:**
```json
{
    "email": "artist@example.com",
    "password": "securePassword123"
}
```

**Parameters:**
- `email` (string, required) - Registered email address
- `password` (string, required) - User's password

**Success Response (200):**
```json
{
    "message": "Login exitoso",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": 1,
        "name": "Artist Name",
        "email": "artist@example.com",
        "role": "artista"
    }
}
```

**Error Responses:**
- `400` - Missing email or password
- `401` - Invalid credentials
- `423` - Account locked (too many failed attempts)

**Rate Limit:** 5 requests per 15 minutes

---

### GET /auth/profile

Get current user's profile information.

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Success Response (200):**
```json
{
    "id": 1,
    "name": "Artist Name",
    "email": "artist@example.com",
    "role": "artista",
    "created_at": "2025-12-11T08:00:00.000Z"
}
```

**Error Responses:**
- `401` - Invalid or missing token
- `404` - User not found

---

## Events Endpoints

### GET /events

Retrieve all active events with optional filtering.

**Query Parameters:**
- `genre` (string, optional) - Filter by musical genre
- `modality` (string, optional) - Filter by entry type (gratuito, gorra, arancelado, beneficio)
- `date` (string, optional) - Filter by date (YYYY-MM-DD)
- `search` (string, optional) - Search in title and venue

**Example Request:**
```http
GET /api/events?genre=rock&search=jazz&limit=10&offset=0
```

**Success Response (200):**
```json
[
    {
        "id": 1,
        "title": "Rock Night Festival",
        "description": "Una noche épica de rock nacional",
        "event_date": "2025-12-20T20:00:00.000Z",
        "venue": "Estadio Luna Park",
        "city": "Buenos Aires",
        "entry_type": "arancelado",
        "price": 3500.00,
        "status": "activo",
        "artist_id": 1,
        "artist_name": "Artist Name"
    },
    {
        "id": 2,
        "title": "Jazz Under the Stars",
        "description": "Intimate acoustic show",
        "event_date": "2025-12-25T21:30:00.000Z",
        "venue": "Parque de la Música",
        "city": "Córdoba",
        "entry_type": "gratuito",
        "price": null,
        "status": "activo",
        "artist_id": 1,
        "artist_name": "Artist Name"
    }
]
```

**Pagination:**
- Response includes `total` header with total count
- Use `limit` and `offset` for pagination
- Default: limit=50, offset=0

---

### POST /events

Create a new event (Artist only).

**Headers:**
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
    "title": "Concert Title",
    "description": "Event description and details",
    "event_date": "2025-12-30T20:00:00.000Z",
    "venue": "Venue Name",
    "city": "City Name",
    "entry_type": "arancelado",
    "price": 2500.00,
    "ticket_url": "https://ticketmaster.com/event/123",
    "flyer_url": "https://example.com/flyer.jpg"
}
```

**Parameters:**
- `title` (string, required) - Event title (max 255 chars)
- `description` (string, optional) - Event description
- `event_date` (datetime, required) - Future date and time (ISO 8601)
- `venue` (string, required) - Venue name (max 255 chars)
- `city` (string, required) - City name (max 100 chars)
- `entry_type` (enum, required) - Entry type: "gratuito", "gorra", "arancelado", "beneficio"
- `price` (decimal, optional) - Ticket price (required if entry_type is "arancelado")
- `ticket_url` (string, optional) - External ticket purchase URL
- `flyer_url` (string, optional) - Event poster image URL

**Success Response (201):**
```json
{
    "message": "Evento creado exitosamente",
    "event": {
        "id": 3,
        "title": "Concert Title",
        "description": "Event description and details",
        "event_date": "2025-12-30T20:00:00.000Z",
        "venue": "Venue Name",
        "city": "City Name",
        "entry_type": "arancelado",
        "price": 2500.00,
        "status": "activo",
        "artist_id": 1,
        "created_at": "2025-12-11T08:00:00.000Z"
    }
}
```

**Error Responses:**
- `400` - Validation error (missing required fields, invalid date, past date)
- `401` - Invalid token
- `403` - Only artists can create events
- `422` - Unprocessable entity (business logic error)

---

### PUT /events/:id

Update an existing event.

**Headers:**
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (integer, required) - Event ID

**Request Body:**
```json
{
    "title": "Updated Concert Title",
    "description": "Updated description",
    "venue": "New Venue Name",
    "city": "New City",
    "entry_type": "gratuito",
    "price": null
}
```

**Validation Rules:**
- Only the event owner or admin can update
- Event date cannot be changed to a past date
- Only specified fields will be updated

**Success Response (200):**
```json
{
    "message": "Evento actualizado exitosamente",
    "event": {
        "id": 3,
        "title": "Updated Concert Title",
        "description": "Updated description",
        "event_date": "2025-12-30T20:00:00.000Z",
        "venue": "New Venue Name",
        "city": "New City",
        "entry_type": "gratuito",
        "price": null,
        "status": "activo",
        "artist_id": 1,
        "updated_at": "2025-12-11T08:05:00.000Z"
    }
}
```

**Error Responses:**
- `401` - Invalid token
- `403` - Insufficient permissions (not event owner)
- `404` - Event not found
- `409` - Conflict (event date conflict)

---

### DELETE /events/:id

Delete an event.

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Path Parameters:**
- `id` (integer, required) - Event ID

**Success Response (200):**
```json
{
    "message": "Evento eliminado exitosamente"
}
```

**Error Responses:**
- `401` - Invalid token
- `403` - Insufficient permissions (not event owner or admin)
- `404` - Event not found

---

### GET /events/my-events

Get events created by the authenticated artist.

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `status` (string, optional) - Filter by status: "activo", "cancelado", "postponed"
- `limit` (integer, optional) - Number of results (default: 50)
- `offset` (integer, optional) - Offset for pagination (default: 0)

**Success Response (200):**
```json
[
    {
        "id": 1,
        "title": "My Rock Concert",
        "event_date": "2025-12-20T20:00:00.000Z",
        "venue": "Club Example",
        "city": "Buenos Aires",
        "entry_type": "arancelado",
        "price": 3500.00,
        "status": "activo",
        "created_at": "2025-12-10T10:00:00.000Z"
    }
]
```

**Error Responses:**
- `401` - Invalid token
- `403` - Only artists can access this endpoint

---

## Artist Profile Endpoints

### GET /profile

Get the authenticated artist's complete profile.

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Success Response (200):**
```json
{
    "user_id": 1,
    "photo_url": "https://example.com/photo.jpg",
    "phone": "+54 11 1234-5678",
    "website": "https://artistwebsite.com",
    "portfolio_url": "https://portfolio.com/artist",
    "spotify_url": "https://open.spotify.com/artist/123",
    "apple_music_url": "https://music.apple.com/artist/123",
    "tidal_url": "https://tidal.com/artist/123",
    "youtube_music_url": "https://music.youtube.com/channel/123",
    "youtube_channel_url": "https://youtube.com/channel/123",
    "instagram_url": "https://instagram.com/artist",
    "bio": "Artist biography and description",
    "genre": "Rock, Pop",
    "active": true,
    "created_at": "2025-12-11T08:00:00.000Z",
    "updated_at": "2025-12-11T08:00:00.000Z"
}
```

**Error Responses:**
- `401` - Invalid token
- `403` - Only artists can access profile endpoints
- `404` - Profile not found

---

### PUT /profile

Update the authenticated artist's profile.

**Headers:**
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
    "bio": "Updated artist biography",
    "genre": "Electronic, House",
    "website": "https://newwebsite.com",
    "spotify_url": "https://open.spotify.com/artist/456",
    "instagram_url": "https://instagram.com/newartist",
    "phone": "+54 11 9876-5432"
}
```

**Parameters:**
All fields are optional. Only provided fields will be updated.

**URL Validation:**
- URLs must be valid HTTP/HTTPS URLs
- Spotify, Apple Music, YouTube URLs are validated for correct format

**Success Response (200):**
```json
{
    "message": "Perfil actualizado exitosamente",
    "profile": {
        "user_id": 1,
        "bio": "Updated artist biography",
        "genre": "Electronic, House",
        "website": "https://newwebsite.com",
        "spotify_url": "https://open.spotify.com/artist/456",
        "instagram_url": "https://instagram.com/newartist",
        "phone": "+54 11 9876-5432",
        "active": true,
        "updated_at": "2025-12-11T08:10:00.000Z"
    }
}
```

**Error Responses:**
- `400` - Invalid URL format or validation error
- `401` - Invalid token
- `403` - Only artists can update profiles

---

## Administrative Endpoints

### GET /admin/stats

Get system-wide statistics (Admin only).

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Success Response (200):**
```json
{
    "users": {
        "total": 25,
        "artists": 20,
        "admins": 5,
        "active_last_30_days": 15
    },
    "events": {
        "total": 45,
        "active": 32,
        "canceled": 8,
        "postponed": 5
    },
    "system": {
        "uptime": "2 days, 5 hours",
        "total_requests": 15420,
        "average_response_time": "245ms"
    },
    "recent_activity": {
        "new_users_today": 3,
        "events_created_today": 7,
        "login_attempts_today": 89
    }
}
```

**Error Responses:**
- `401` - Invalid token
- `403` - Admin access required

---

### GET /admin/logs

Get system audit logs (Admin only).

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `limit` (integer, optional) - Number of logs to retrieve (default: 100, max: 1000)
- `offset` (integer, optional) - Offset for pagination (default: 0)
- `action` (string, optional) - Filter by action type
- `user_id` (integer, optional) - Filter by specific user
- `date_from` (string, optional) - Filter from date (YYYY-MM-DD)
- `date_to` (string, optional) - Filter to date (YYYY-MM-DD)

**Example Request:**
```http
GET /api/admin/logs?action=USER_LOGIN&limit=50&date_from=2025-12-01
```

**Success Response (200):**
```json
[
    {
        "id": 1001,
        "user_id": 1,
        "action": "USER_LOGIN",
        "details": {
            "email": "artist@example.com",
            "success": true
        },
        "ip_address": "192.168.1.100",
        "timestamp": "2025-12-11T08:05:00.000Z"
    },
    {
        "id": 1000,
        "user_id": 1,
        "action": "EVENT_CREATE",
        "details": {
            "event_id": 3,
            "title": "Concert Title"
        },
        "ip_address": "192.168.1.100",
        "timestamp": "2025-12-11T08:00:00.000Z"
    }
]
```

**Action Types:**
- `USER_REGISTER` - New user registration
- `USER_LOGIN` - User login attempt
- `EVENT_CREATE` - New event created
- `EVENT_UPDATE` - Event modified
- `EVENT_DELETE` - Event deleted
- `PROFILE_UPDATE` - Profile updated
- `ADMIN_ACTION` - Administrative action

**Error Responses:**
- `401` - Invalid token
- `403` - Admin access required

---

### GET /admin/export/:type

Export system data as CSV (Admin only).

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Path Parameters:**
- `type` (string, required) - Export type: "users" or "events"

**Query Parameters:**
- `format` (string, optional) - Export format: "csv" (default) or "json"
- `date_from` (string, optional) - Filter data from date
- `date_to` (string, optional) - Filter data to date

**Example Request:**
```http
GET /api/admin/export/users?format=csv&date_from=2025-12-01
```

**Success Response (200):**
```csv
id,name,email,role,created_at,last_login
1,Artist Name,artist@example.com,artista,2025-12-11T08:00:00.000Z,2025-12-11T08:05:00.000Z
2,Admin User,admin@example.com,admin,2025-12-10T10:00:00.000Z,2025-12-11T07:30:00.000Z
```

**Headers:**
- `Content-Type: text/csv` for CSV format
- `Content-Type: application/json` for JSON format
- `Content-Disposition: attachment; filename="export_type_date.csv"`

**Error Responses:**
- `400` - Invalid export type
- `401` - Invalid token
- `403` - Admin access required
- `422` - Export too large or invalid parameters

---

### GET /admin/users

Get all users with pagination (Admin only).

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `role` (string, optional) - Filter by role: "artista" or "admin"
- `active` (boolean, optional) - Filter by active status
- `limit` (integer, optional) - Number of users (default: 50)
- `offset` (integer, optional) - Offset for pagination (default: 0)
- `search` (string, optional) - Search in name or email

**Success Response (200):**
```json
{
    "users": [
        {
            "id": 1,
            "name": "Artist Name",
            "email": "artist@example.com",
            "role": "artista",
            "is_active": true,
            "created_at": "2025-12-11T08:00:00.000Z",
            "last_login": "2025-12-11T08:05:00.000Z",
            "events_count": 3
        }
    ],
    "pagination": {
        "total": 25,
        "limit": 50,
        "offset": 0,
        "has_more": false
    }
}
```

---

### PUT /admin/users/:id/status

Update user status (Admin only).

**Headers:**
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (integer, required) - User ID

**Request Body:**
```json
{
    "is_active": false,
    "reason": "User violated terms of service"
}
```

**Parameters:**
- `is_active` (boolean, required) - User active status
- `reason` (string, optional) - Reason for status change

**Success Response (200):**
```json
{
    "message": "Usuario actualizado exitosamente",
    "user": {
        "id": 1,
        "name": "Artist Name",
        "email": "artist@example.com",
        "is_active": false,
        "updated_at": "2025-12-11T08:15:00.000Z"
    }
}
```

---

## Health Check

### GET /health

Check API server status.

**Success Response (200):**
```json
{
    "status": "OK",
    "timestamp": "2025-12-11T08:00:00.000Z",
    "uptime": 7200,
    "version": "2.0.0",
    "environment": "development"
}
```

**Response Headers:**
- `X-Response-Time` - Server response time in milliseconds
- `X-Request-ID` - Unique request identifier

---

## Webhooks (Future Feature)

*Note: Webhooks are planned for version 2.5*

### POST /webhooks/event-updated
*Planned endpoint for external integrations*

---

## SDK Examples

### JavaScript/Node.js

```javascript
class MusicalendariaAPI {
    constructor(baseURL = 'http://localhost:3001/api') {
        this.baseURL = baseURL;
        this.token = null;
    }

    setToken(token) {
        this.token = token;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { Authorization: `Bearer ${this.token}` })
            },
            ...options
        };

        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API Error');
        }

        return data;
    }

    // Authentication
    async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        this.token = data.token;
        return data;
    }

    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    // Events
    async getEvents(filters = {}) {
        const params = new URLSearchParams(filters);
        return this.request(`/events?${params}`);
    }

    async createEvent(eventData) {
        return this.request('/events', {
            method: 'POST',
            body: JSON.stringify(eventData)
        });
    }

    async updateEvent(id, eventData) {
        return this.request(`/events/${id}`, {
            method: 'PUT',
            body: JSON.stringify(eventData)
        });
    }

    async deleteEvent(id) {
        return this.request(`/events/${id}`, {
            method: 'DELETE'
        });
    }

    // Profile
    async getProfile() {
        return this.request('/profile');
    }

    async updateProfile(profileData) {
        return this.request('/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }
}

// Usage example
const api = new MusicalendariaAPI();

// Login
const loginResult = await api.login('artist@example.com', 'password123');

// Get events
const events = await api.getEvents({ genre: 'rock' });

// Create event
const newEvent = await api.createEvent({
    title: 'My Concert',
    event_date: '2025-12-30T20:00:00.000Z',
    venue: 'Club Example',
    city: 'Buenos Aires',
    entry_type: 'arancelado',
    price: 2500.00
});
```

### Python

```python
import requests
import json

class MusicalendariaAPI:
    def __init__(self, base_url='http://localhost:3001/api'):
        self.base_url = base_url
        self.token = None
        self.session = requests.Session()
    
    def set_token(self, token):
        self.token = token
        self.session.headers.update({
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        })
    
    def request(self, endpoint, method='GET', data=None):
        url = f'{self.base_url}{endpoint}'
        
        if method.upper() == 'GET':
            response = self.session.get(url)
        elif method.upper() == 'POST':
            response = self.session.post(url, json=data)
        elif method.upper() == 'PUT':
            response = self.session.put(url, json=data)
        elif method.upper() == 'DELETE':
            response = self.session.delete(url)
        
        response.raise_for_status()
        return response.json()
    
    def login(self, email, password):
        data = self.request('/auth/login', 'POST', {
            'email': email,
            'password': password
        })
        self.set_token(data['token'])
        return data
    
    def get_events(self, filters=None):
        if filters:
            params = '&'.join([f'{k}={v}' for k, v in filters.items()])
            endpoint = f'/events?{params}'
        else:
            endpoint = '/events'
        return self.request(endpoint)
    
    def create_event(self, event_data):
        return self.request('/events', 'POST', event_data)

# Usage example
api = MusicalendariaAPI()

# Login
login_result = api.login('artist@example.com', 'password123')

# Get events
events = api.get_events({'genre': 'rock'})

# Create event
new_event = api.create_event({
    'title': 'My Concert',
    'event_date': '2025-12-30T20:00:00.000Z',
    'venue': 'Club Example',
    'city': 'Buenos Aires',
    'entry_type': 'arancelado',
    'price': 2500.00
})
```

---

## Rate Limiting Details

### Authentication Endpoints
- **Limit:** 5 requests per 15 minutes
- **Scope:** IP address
- **Headers:** 
  - `X-RateLimit-Limit: 5`
  - `X-RateLimit-Remaining: 3`
  - `X-RateLimit-Reset: 1640995200`

### General API Endpoints
- **Limit:** 100 requests per 15 minutes
- **Scope:** IP address + authenticated user
- **Headers:** 
  - `X-RateLimit-Limit: 100`
  - `X-RateLimit-Remaining: 87`
  - `X-RateLimit-Reset: 1640995200`

### Rate Limit Response (429)
```json
{
    "message": "Demasiadas solicitudes, inténtalo de nuevo más tarde",
    "retry_after": 900
}
```

---

## Changelog

### Version 2.0.0 (Current)
- Initial API release
- Authentication with JWT
- Events CRUD operations
- Artist profile management
- Administrative endpoints
- Rate limiting implementation
- Comprehensive error handling

### Planned for Version 2.5
- Webhooks for event notifications
- Advanced filtering options
- Bulk operations
- API versioning support

### Planned for Version 3.0
- GraphQL endpoint
- Real-time subscriptions
- Advanced analytics API
- Integration endpoints

---

## Support

For API support and questions:
- **Documentation:** This file
- **Examples:** SDK examples above
- **Status:** Check `/health` endpoint
- **Issues:** Contact system administrator

---

**Last Updated:** December 11, 2025  
**API Version:** 2.0.0  
**Musicalendaria Platform Version:** 2.0.0