# Event Booking System - Complete Backend API

A comprehensive RESTful backend system for managing event bookings with role-based access control, real-time notifications, and background job processing.

## 🎯 Overview

This system provides a complete event booking solution with support for two user types:

- **Event Organizers**: Create, manage, and update events
- **Customers**: Browse events and purchase tickets

## 🏗️ System Architecture

### Technology Stack

- **Runtime**: Node.js v20+
- **Framework**: Express.js
- **Database**: SQLite3 (lightweight, file-based)
- **Authentication**: JWT (JSON Web Tokens)
- **Job Queue**: Custom in-memory queue with async processing
- **Password Security**: bcryptjs (bcrypt hashing)

### Why These Choices?

1. **Node.js + Express**: Fast, lightweight, perfect for RESTful APIs with built-in middleware support
2. **SQLite**: File-based database eliminates setup complexity while providing full SQL capabilities
3. **JWT**: Stateless authentication that scales well and works perfectly for REST APIs
4. **bcryptjs**: Industry-standard password hashing with automatic salt generation
5. **Custom Job Queue**: Demonstrates background processing without external dependencies; perfect for learning
6. **UUID**: Ensures globally unique identifiers across distributed systems

## 📊 Database Schema

### Users Table

```sql
id (UUID PRIMARY KEY)
email (UNIQUE)
password_hash (bcrypted)
role (organizer | customer)
name
created_at
```

### Events Table

```sql
id (UUID PRIMARY KEY)
organizer_id (FK → Users)
title
description
date
location
total_tickets
available_tickets (updated when booking occurs)
price
status (draft | published | cancelled)
created_at
updated_at
```

### Bookings Table

```sql
id (UUID PRIMARY KEY)
event_id (FK → Events)
customer_id (FK → Users)
number_of_tickets
total_amount
status (confirmed | cancelled)
created_at
```

### Jobs Table (Background Task Queue)

```sql
id (UUID PRIMARY KEY)
type (booking_confirmation | event_update_notification)
payload (JSON)
status (pending | processing | completed | failed)
created_at
started_at
completed_at
```

## 🔌 API Endpoints

### Authentication

```
POST /api/auth/register
  Request:  { email, password, name, role: "organizer"|"customer" }
  Response: { token, user: { id, email, name, role } }

POST /api/auth/login
  Request:  { email, password }
  Response: { token, user: { id, email, name, role } }
```

### Event Management (Organizer Only)

```
POST /api/events
  Auth: Required (organizer role)
  Request:  { title, description, date, location, totalTickets, price }
  Response: { eventId, event }

GET /api/events/organizer/list
  Auth: Required (organizer role)
  Response: { events: [] }

GET /api/events/:id
  Auth: Required
  Response: { event }

PUT /api/events/:id
  Auth: Required (organizer role)
  Request:  { title?, description?, date?, location?, totalTickets?, price?, status? }
  Response: { message }
  Note:     Updates trigger event notification background task

DELETE /api/events/:id
  Auth: Required (organizer role)
  Response: { message }
```

### Event Browsing & Booking (Customer Only)

```
GET /api/events?search=keyword
  Auth: Required (customer role)
  Response: { events: [] }
  Note:     Only returns published events

POST /api/bookings
  Auth: Required (customer role)
  Request:  { eventId, numberOfTickets }
  Response: { bookingId, booking }
  Note:     Triggers booking confirmation background task

GET /api/bookings
  Auth: Required (customer role)
  Response: { bookings: [] }
```

### Background Jobs (Monitoring)

```
GET /api/jobs
  Auth: Required
  Response: { jobs: [] }

GET /api/jobs/:id
  Auth: Required
  Response: { job }
```

### Health Check

```
GET /api/health
  Response: { status, timestamp }
```

## 🔐 Security Features

### Authentication & Authorization

- **JWT Tokens**: All protected endpoints require a valid JWT token
- **Role-Based Access Control (RBAC)**:
  - Organizers can only access organizer endpoints
  - Customers can only access customer endpoints
- **Password Security**: bcryptjs with 10 salt rounds
- **Token Expiry**: 24-hour token lifetime

### Authorization Rules

- Organizers can only modify their own events
- Customers can only view/modify their own bookings
- Published events visible to all customers
- Event updates only trigger when authorized organizer modifies event

## 🔄 Background Task System

### Architecture

1. **Enqueue**: Task created with type and payload
2. **Process**: Background worker picks up pending tasks
3. **Execute**: Task-specific handler runs
4. **Complete**: Status updated, task logged

### Task Types

#### 1. Booking Confirmation

**Triggered**: When customer successfully books tickets
**Payload**:

```json
{
  "bookingId": "uuid",
  "customerEmail": "customer@example.com",
  "customerName": "Jane Doe",
  "eventTitle": "Tech Conference 2024",
  "numberOfTickets": 5
}
```

**Action**: Displays formatted confirmation email in console with booking details

#### 2. Event Update Notification

**Triggered**: When organizer updates an event
**Payload**:

```json
{
  "eventId": "uuid",
  "eventTitle": "Tech Conference 2024",
  "organizerName": "John Organizer"
}
```

**Action**:

1. Queries all customers who booked this event
2. For each customer, logs notification message
3. Console displays all recipients

### Job Processing Flow

```
┌─────────────────┐
│  Task Enqueued  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Pending Status  │
└────────┬────────┘
         │ (every 3 seconds)
         ▼
┌─────────────────┐
│Processing Status│
└────────┬────────┘
         │
         ▼
┌──────────────────┐
│ Execute Handler  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│Completed Status  │
└──────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- Node.js v20+
- npm or yarn

### Installation

1. **Clone/Download the repository**

```bash
cd event-booking-system
```

2. **Install dependencies**

```bash
npm install
```

### Running the Server

```bash
npm start
```

Expected output:

```
🚀 Initializing Event Booking System...

✓ Database initialized
✓ Job queue started

✓ Server running on http://localhost:3000

📚 API Documentation:
   POST   /api/auth/register           - Register new user
   POST   /api/auth/login              - Login user
   ...
```

### Running the Demo

In a **separate terminal**:

```bash
node demo.js
```

This will:

1. Register an organizer and customer
2. Create and publish an event
3. Book tickets
4. Update event (triggering notifications)
5. Display background task execution in real-time

## 📝 Example Usage

### 1. Register as Organizer

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "organizer@example.com",
    "password": "securePassword123",
    "name": "John Event Manager",
    "role": "organizer"
  }'
```

Response:

```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "organizer@example.com",
    "name": "John Event Manager",
    "role": "organizer"
  }
}
```

### 2. Create Event (as Organizer)

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ORGANIZER_TOKEN" \
  -d '{
    "title": "Annual Tech Summit 2024",
    "description": "Cutting-edge tech discussions and networking",
    "date": "2024-12-15",
    "location": "San Francisco Convention Center",
    "totalTickets": 500,
    "price": 149.99
  }'
```

### 3. Publish Event

```bash
curl -X PUT http://localhost:3000/api/events/EVENT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ORGANIZER_TOKEN" \
  -d '{ "status": "published" }'
```

### 4. Register as Customer

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "securePassword123",
    "name": "Jane Buyer",
    "role": "customer"
  }'
```

### 5. Browse Published Events

```bash
curl -X GET http://localhost:3000/api/events \
  -H "Authorization: Bearer YOUR_CUSTOMER_TOKEN"
```

### 6. Book Tickets (as Customer)

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CUSTOMER_TOKEN" \
  -d '{
    "eventId": "EVENT_ID",
    "numberOfTickets": 2
  }'
```

**Console Output** (Booking Confirmation Task):

```
╔════════════════════════════════════════════════════════════════╗
║              📧 BOOKING CONFIRMATION EMAIL                     ║
╠════════════════════════════════════════════════════════════════╣
║ TO: customer@example.com                                       ║
║ CUSTOMER: Jane Buyer                                           ║
║ EVENT: Annual Tech Summit 2024                                 ║
║ TICKETS: 2                                                     ║
║ BOOKING ID: 550e8400-e29b-41d4-a716-446655440000             ║
║                                                                ║
║ Thank you for booking! Your tickets are confirmed.            ║
║ Check your email for ticket details.                          ║
╚════════════════════════════════════════════════════════════════╝
```

### 7. Update Event (Triggers Notifications)

```bash
curl -X PUT http://localhost:3000/api/events/EVENT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ORGANIZER_TOKEN" \
  -d '{ "description": "Updated: Now includes VIP lounge access!" }'
```

**Console Output** (Event Update Notification Task):

```
╔════════════════════════════════════════════════════════════════╗
║           📢 EVENT UPDATE NOTIFICATION BROADCAST               ║
╠════════════════════════════════════════════════════════════════╣
║ EVENT: Annual Tech Summit 2024                                 ║
║ ORGANIZER: John Event Manager                                 ║
║ NOTIFYING 2                                                    ║
║                                                                ║
║ Customers to notify:                                           ║
║   ✓ jane@example.com                                           ║
║   ✓ bob@example.com                                            ║
║                                                                ║
║ Notification: "Event has been updated. Check details."        ║
╚════════════════════════════════════════════════════════════════╝
```

## 📊 Design Decision Documentation

### 1. Database Choice: SQLite

**Decision**: Use SQLite instead of PostgreSQL/MySQL
**Rationale**:

- Zero setup/installation required
- File-based storage simplifies deployment
- Full SQL support for complex queries
- Sufficient for learning and prototype systems
- Can be easily replaced with PostgreSQL in production

### 2. Authentication: JWT

**Decision**: Implement JWT tokens instead of session-based auth
**Rationale**:

- Stateless authentication scales horizontally
- Works perfectly for REST APIs
- No server-side session storage needed
- Industry standard for microservices
- Easy to test and implement

### 3. Job Queue: In-Memory Custom Implementation

**Decision**: Build custom queue instead of using external tools (Redis, RabbitMQ)
**Rationale**:

- Demonstrates understanding of async processing
- No external dependencies/services needed
- Perfect for learning background task concepts
- Uses Node.js Event Loop and Promises
- In production: would migrate to Bull/Redis or similar

### 4. Password Hashing: bcryptjs

**Decision**: Use bcryptjs for password hashing
**Rationale**:

- Industry standard with proven security
- Automatic salt generation
- Configurable work factor (10 iterations)
- Resistant to rainbow table attacks
- Easy to implement and verify

### 5. API Design: RESTful with Role-Based Endpoints

**Decision**: Different endpoints for organizers vs customers
**Rationale**:

- Clear separation of concerns
- Middleware authorization is cleaner
- Easier to maintain and extend
- Prevents accidental cross-role access
- Better for API documentation

### 6. Error Handling: Consistent Response Format

**Decision**: All errors return { error: string } format
**Rationale**:

- Predictable for API consumers
- Easy to parse on client side
- Includes appropriate HTTP status codes
- Enables proper error handling workflow

### 7. Job Processing: Polling-based

**Decision**: Use setInterval polling instead of event-based
**Rationale**:

- Simpler to implement and understand
- No complex event emitter patterns needed
- Works well for smaller task volumes
- Easy to pause/resume/monitor
- In production: would use more sophisticated approaches

## 🧪 Testing the System

### Automated Demo

```bash
npm start                    # Terminal 1 - Start server
node demo.js                # Terminal 2 - Run demo
```

Watch the console for:

- ✓ User registrations
- ✓ Event creation and publishing
- ✓ Ticket bookings
- ✓ Background task execution
- 📧 Email confirmation logs
- 📢 Notification broadcasts

### Manual Testing with cURL

**Check Health**:

```bash
curl http://localhost:3000/api/health
```

**View Jobs**:

```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/jobs
```

## 📂 Project Structure

```
event-booking-system/
├── server.js           # Express app & all API routes
├── database.js         # SQLite setup & helpers
├── auth.js            # JWT & RBAC middleware
├── jobQueue.js        # Background job processor
├── demo.js            # Automated demo script
├── package.json       # Dependencies
└── README.md          # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file (optional):

```
PORT=3000
JWT_SECRET=your-secret-key-here
```

If not set, defaults are used:

- PORT: 3000
- JWT_SECRET: event-booking-secret-key-2024

## 🚨 Error Handling

All endpoints follow consistent error response pattern:

```json
{
  "error": "Description of what went wrong"
}
```

Common HTTP Status Codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (missing token)
- `403`: Forbidden (wrong role or unauthorized resource)
- `404`: Not Found
- `500`: Server Error

## 🎓 Learning Outcomes

This project demonstrates:

- ✓ RESTful API design principles
- ✓ Role-based access control (RBAC)
- ✓ JWT authentication implementation
- ✓ Database design and SQL queries
- ✓ Background job processing
- ✓ Error handling patterns
- ✓ Async/Promise-based Node.js
- ✓ Express.js middleware patterns
- ✓ Security best practices

## 🚀 Future Enhancements

1. **Database**: Migrate to PostgreSQL for production
2. **Job Queue**: Replace with Bull/Redis for scalability
3. **Email Service**: Integration with SendGrid/AWS SES
4. **SMS Notifications**: Twilio integration for SMS alerts
5. **Payment Processing**: Stripe integration for ticket payments
6. **Event Search**: Full-text search with Elasticsearch
7. **Admin Dashboard**: Web UI for system monitoring
8. **Rate Limiting**: Prevent API abuse
9. **WebSockets**: Real-time event updates
10. **Caching**: Redis caching for frequently accessed events

## 📝 Notes

- Database file (`eventbooking.db`) is created automatically on first run
- All timestamps in ISO 8601 format
- IDs use UUID v4 format for global uniqueness
- Tokens expire after 24 hours
- Event dates are stored as date strings (YYYY-MM-DD format)

## 📄 License

MIT License - Feel free to use this for learning and development

## 👤 Author

Created as a comprehensive learning project demonstrating full-stack backend development with Node.js

---

**Questions or Issues?**
Refer to the code comments or the design decisions section above for detailed explanations of implementation choices.
