# Quick API Testing Commands

## Before Running Tests

```bash
# Terminal 1: Start the server
npm start

# Terminal 2: Run the automated demo (shows everything)
node demo.js

# OR Manual testing with curl commands below
```

## 1. Register Organizer

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "organizer@test.com",
    "password": "password123",
    "name": "Event Manager",
    "role": "organizer"
  }'
```

**Save the token from response as**: `ORGANIZER_TOKEN`

## 2. Register Customer

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "password": "password123",
    "name": "Ticket Buyer",
    "role": "customer"
  }'
```

**Save the token from response as**: `CUSTOMER_TOKEN`

## 3. Create Event (Organizer Only)

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ORGANIZER_TOKEN" \
  -d '{
    "title": "Tech Conference 2024",
    "description": "Annual technology conference",
    "date": "2024-12-20",
    "location": "San Francisco",
    "totalTickets": 100,
    "price": 99.99
  }'
```

**Save the eventId from response**

## 4. Get Organizer Events

```bash
curl -X GET http://localhost:3000/api/events/organizer/list \
  -H "Authorization: Bearer ORGANIZER_TOKEN"
```

## 5. Get Event Details

```bash
curl -X GET http://localhost:3000/api/events/EVENT_ID \
  -H "Authorization: Bearer ORGANIZER_TOKEN"
```

## 6. Publish Event

```bash
curl -X PUT http://localhost:3000/api/events/EVENT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ORGANIZER_TOKEN" \
  -d '{ "status": "published" }'
```

**Watch server terminal for job logs!**

## 7. Browse Events (Customer Only)

```bash
curl -X GET "http://localhost:3000/api/events?search=tech" \
  -H "Authorization: Bearer CUSTOMER_TOKEN"
```

## 8. Book Tickets (Customer Only)

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer CUSTOMER_TOKEN" \
  -d '{
    "eventId": "EVENT_ID",
    "numberOfTickets": 3
  }'
```

**Watch server terminal for booking confirmation job!**

## 9. Get Customer Bookings

```bash
curl -X GET http://localhost:3000/api/bookings \
  -H "Authorization: Bearer CUSTOMER_TOKEN"
```

## 10. View All Jobs

```bash
curl -X GET http://localhost:3000/api/jobs \
  -H "Authorization: Bearer ORGANIZER_TOKEN"
```

## 11. Get Specific Job

```bash
curl -X GET http://localhost:3000/api/jobs/JOB_ID \
  -H "Authorization: Bearer ORGANIZER_TOKEN"
```

## 12. Health Check

```bash
curl http://localhost:3000/api/health
```

---

## Expected Console Output When Tasks Run

### Booking Confirmation Output

```
[PROCESSING JOB] - Type: booking_confirmation

╔════════════════════════════════════════════════════════════════╗
║              📧 BOOKING CONFIRMATION EMAIL                     ║
╠════════════════════════════════════════════════════════════════╣
║ TO: customer@test.com                                          ║
║ CUSTOMER: Ticket Buyer                                         ║
║ EVENT: Tech Conference 2024                                    ║
║ TICKETS: 3                                                     ║
║ BOOKING ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx              ║
╚════════════════════════════════════════════════════════════════╝

[JOB COMPLETED]
```

### Event Update Notification Output

```
[PROCESSING JOB] - Type: event_update_notification

╔════════════════════════════════════════════════════════════════╗
║           📢 EVENT UPDATE NOTIFICATION BROADCAST               ║
╠════════════════════════════════════════════════════════════════╣
║ EVENT: Tech Conference 2024                                    ║
║ ORGANIZER: Event Manager                                       ║
║ NOTIFYING 3                                                    ║
║                                                                ║
║ Customers to notify:                                           ║
║   ✓ customer@test.com                                          ║
║   ✓ other1@test.com                                            ║
║   ✓ other2@test.com                                            ║
║                                                                ║
║ Notification: "Event has been updated. Check details."        ║
╚════════════════════════════════════════════════════════════════╝

[JOB COMPLETED]
```

---

## Troubleshooting

**Port already in use?**

```bash
# Change port in .env file
echo "PORT=3001" >> .env
npm start
```

**Token expired?**
Re-run the login/register command to get a new token

**Database locked?**

```bash
# Delete and recreate the database
del eventbooking.db
npm start
```

**Jobs not processing?**
Check that the server terminal shows "Job queue started"
