# Event Booking System - Architecture & Design Plan

## 1. System Overview

A RESTful API backend for managing event bookings with two user roles:

- **Event Organizers**: Create, update, and manage events
- **Customers**: Browse events and book tickets

## 2. Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite (lightweight, file-based)
- **Authentication**: JWT (JSON Web Tokens)
- **Job Queue**: Node-queue (simple in-memory queue for background tasks)
- **Email Service**: Simulated with console logs

## 3. Database Schema

### Users Table

- `id` (UUID)
- `email` (unique)
- `password_hash` (bcrypt)
- `role` (organizer | customer)
- `name`
- `created_at`

### Events Table

- `id` (UUID)
- `organizer_id` (FK to Users)
- `title`
- `description`
- `date`
- `location`
- `total_tickets`
- `available_tickets`
- `price`
- `status` (draft | published | cancelled)
- `created_at`
- `updated_at`

### Bookings Table

- `id` (UUID)
- `event_id` (FK to Events)
- `customer_id` (FK to Users)
- `number_of_tickets`
- `total_amount`
- `status` (confirmed | cancelled)
- `created_at`

### Jobs Queue Table

- `id` (UUID)
- `type` (booking_confirmation | event_update_notification)
- `payload` (JSON)
- `status` (pending | processing | completed | failed)
- `created_at`
- `started_at`
- `completed_at`

## 4. API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user (role: organizer or customer)
- `POST /api/auth/login` - Login and get JWT token

### Event Organizer APIs (require organizer role)

- `POST /api/events` - Create new event
- `GET /api/events` - List organizer's events
- `GET /api/events/:id` - Get event details
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Customer APIs (require customer role)

- `GET /api/events` - Browse all published events (with search/filter)
- `POST /api/bookings` - Book tickets for an event
- `GET /api/bookings` - Get customer's bookings

### Admin/Status APIs

- `GET /api/jobs` - List background jobs
- `GET /api/jobs/:id` - Get job details

## 5. Background Task Flow

### Task 1: Booking Confirmation

1. Customer books tickets → Booking created
2. Job enqueued with type: "booking_confirmation"
3. Job processor:
   - Retrieves booking details
   - Logs: "📧 Booking Confirmation Email sent to {customer_email}"
   - Marks job as completed
4. Console output shows task execution

### Task 2: Event Update Notification

1. Organizer updates event → Event updated
2. Job enqueued with type: "event_update_notification"
3. Job processor:
   - Queries all customers who booked this event
   - For each customer: Logs notification
   - Marks job as completed
4. Console output shows all notifications sent

## 6. Security & Authorization

- JWT tokens with role claim
- Middleware to check authorization based on user role
- Organizers can only modify their own events
- Customers can only view their own bookings

## 7. Error Handling

- Consistent error response format
- Validation for all inputs
- Appropriate HTTP status codes

## 8. Implementation Timeline

1. Setup project (Express, SQLite, dependencies)
2. Database schema & migrations
3. Auth system (register, login, JWT)
4. Event CRUD APIs
5. Booking APIs
6. Background job queue
7. Testing & debugging
8. Documentation
9. Video recording

## 9. Demo Scenarios

1. Register as organizer and create events
2. Register as customer and view events
3. Customer books tickets → see booking confirmation log
4. Organizer updates event → see customer notifications in console
5. Verify job queue and task execution
