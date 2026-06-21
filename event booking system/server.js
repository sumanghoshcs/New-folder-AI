const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const { randomUUID } = require("crypto");
require("dotenv").config();

const { initializeDatabase, get, all, run } = require("./database");
const {
  authenticateToken,
  requireOrganizer,
  requireCustomer,
  generateToken,
} = require("./auth");
const { jobQueue } = require("./jobQueue");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ======================== AUTH ENDPOINTS ========================

// Register endpoint
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!["organizer", "customer"].includes(role)) {
      return res
        .status(400)
        .json({ error: "Role must be organizer or customer" });
    }

    // Check if user already exists
    const existingUser = await get(`SELECT id FROM users WHERE email = ?`, [
      email,
    ]);
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const userId = randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);

    await run(
      `INSERT INTO users (id, email, password_hash, role, name) VALUES (?, ?, ?, ?, ?)`,
      [userId, email, passwordHash, role, name],
    );

    const token = generateToken(userId, email, role);

    res.status(201).json({
      message: "User registered successfully",
      userId,
      token,
      user: { id: userId, email, name, role },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await get(`SELECT * FROM users WHERE email = ?`, [email]);

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken(user.id, user.email, user.role);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ======================== ORGANIZER ENDPOINTS ========================

// Create event (organizer only)
app.post(
  "/api/events",
  authenticateToken,
  requireOrganizer,
  async (req, res) => {
    try {
      const { title, description, date, location, totalTickets, price } =
        req.body;

      if (!title || !date || !location || !totalTickets || !price) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const eventId = randomUUID();

      await run(
        `INSERT INTO events (id, organizer_id, title, description, date, location, total_tickets, available_tickets, price, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
        [
          eventId,
          req.user.id,
          title,
          description,
          date,
          location,
          totalTickets,
          totalTickets,
          price,
        ],
      );

      res.status(201).json({
        message: "Event created successfully",
        eventId,
        event: {
          id: eventId,
          title,
          description,
          date,
          location,
          totalTickets,
          price,
          status: "draft",
        },
      });
    } catch (error) {
      console.error("Create event error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Get organizer's events
app.get(
  "/api/events/organizer/list",
  authenticateToken,
  requireOrganizer,
  async (req, res) => {
    try {
      const events = await all(
        `SELECT * FROM events WHERE organizer_id = ? ORDER BY created_at DESC`,
        [req.user.id],
      );

      res.json({ events });
    } catch (error) {
      console.error("Get events error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Get event details
app.get("/api/events/:id", authenticateToken, async (req, res) => {
  try {
    const event = await get(`SELECT * FROM events WHERE id = ?`, [
      req.params.id,
    ]);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ event });
  } catch (error) {
    console.error("Get event error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update event (organizer only)
app.put(
  "/api/events/:id",
  authenticateToken,
  requireOrganizer,
  async (req, res) => {
    try {
      const event = await get(`SELECT * FROM events WHERE id = ?`, [
        req.params.id,
      ]);

      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      if (event.organizer_id !== req.user.id) {
        return res
          .status(403)
          .json({ error: "Not authorized to update this event" });
      }

      const {
        title,
        description,
        date,
        location,
        totalTickets,
        price,
        status,
      } = req.body;

      const updateFields = [];
      const updateValues = [];

      if (title !== undefined) {
        updateFields.push("title = ?");
        updateValues.push(title);
      }
      if (description !== undefined) {
        updateFields.push("description = ?");
        updateValues.push(description);
      }
      if (date !== undefined) {
        updateFields.push("date = ?");
        updateValues.push(date);
      }
      if (location !== undefined) {
        updateFields.push("location = ?");
        updateValues.push(location);
      }
      if (totalTickets !== undefined) {
        updateFields.push("total_tickets = ?");
        updateValues.push(totalTickets);
      }
      if (price !== undefined) {
        updateFields.push("price = ?");
        updateValues.push(price);
      }
      if (status !== undefined) {
        updateFields.push("status = ?");
        updateValues.push(status);
      }

      updateFields.push("updated_at = CURRENT_TIMESTAMP");
      updateValues.push(req.params.id);

      await run(
        `UPDATE events SET ${updateFields.join(", ")} WHERE id = ?`,
        updateValues,
      );

      // Enqueue event update notification job
      const organizer = await get(`SELECT name FROM users WHERE id = ?`, [
        req.user.id,
      ]);
      await jobQueue.enqueueJob("event_update_notification", {
        eventId: req.params.id,
        eventTitle: title || event.title,
        organizerName: organizer.name,
      });

      res.json({
        message: "Event updated successfully and notifications queued",
      });
    } catch (error) {
      console.error("Update event error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Delete event (organizer only)
app.delete(
  "/api/events/:id",
  authenticateToken,
  requireOrganizer,
  async (req, res) => {
    try {
      const event = await get(`SELECT * FROM events WHERE id = ?`, [
        req.params.id,
      ]);

      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      if (event.organizer_id !== req.user.id) {
        return res
          .status(403)
          .json({ error: "Not authorized to delete this event" });
      }

      await run(`DELETE FROM events WHERE id = ?`, [req.params.id]);

      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      console.error("Delete event error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// ======================== CUSTOMER ENDPOINTS ========================

// Browse all published events
app.get("/api/events", authenticateToken, requireCustomer, async (req, res) => {
  try {
    const { search } = req.query;
    let query = `SELECT * FROM events WHERE status = 'published'`;
    const params = [];

    if (search) {
      query += ` AND (title LIKE ? OR description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY date ASC`;

    const events = await all(query, params);

    res.json({ events });
  } catch (error) {
    console.error("Browse events error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Book tickets (customer only)
app.post(
  "/api/bookings",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      const { eventId, numberOfTickets } = req.body;

      if (!eventId || !numberOfTickets) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const event = await get(`SELECT * FROM events WHERE id = ?`, [eventId]);

      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      if (event.available_tickets < numberOfTickets) {
        return res.status(400).json({ error: "Not enough tickets available" });
      }

      const totalAmount = event.price * numberOfTickets;
      const bookingId = randomUUID();

      // Create booking
      await run(
        `INSERT INTO bookings (id, event_id, customer_id, number_of_tickets, total_amount, status)
       VALUES (?, ?, ?, ?, ?, 'confirmed')`,
        [bookingId, eventId, req.user.id, numberOfTickets, totalAmount],
      );

      // Update available tickets
      await run(
        `UPDATE events SET available_tickets = available_tickets - ? WHERE id = ?`,
        [numberOfTickets, eventId],
      );

      // Enqueue booking confirmation job
      const customer = await get(`SELECT email, name FROM users WHERE id = ?`, [
        req.user.id,
      ]);
      await jobQueue.enqueueJob("booking_confirmation", {
        bookingId,
        customerEmail: customer.email,
        customerName: customer.name,
        eventTitle: event.title,
        numberOfTickets,
      });

      res.status(201).json({
        message: "Booking successful",
        bookingId,
        booking: {
          id: bookingId,
          eventId,
          numberOfTickets,
          totalAmount,
          status: "confirmed",
        },
      });
    } catch (error) {
      console.error("Book tickets error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Get customer's bookings
app.get(
  "/api/bookings",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      const bookings = await all(
        `SELECT b.*, e.title as eventTitle, e.date, e.location FROM bookings b
       JOIN events e ON b.event_id = e.id
       WHERE b.customer_id = ? ORDER BY b.created_at DESC`,
        [req.user.id],
      );

      res.json({ bookings });
    } catch (error) {
      console.error("Get bookings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// ======================== JOB/ADMIN ENDPOINTS ========================

// Get all jobs
app.get("/api/jobs", authenticateToken, async (req, res) => {
  try {
    const jobs = await jobQueue.getAllJobs();
    res.json({ jobs });
  } catch (error) {
    console.error("Get jobs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get job by ID
app.get("/api/jobs/:id", authenticateToken, async (req, res) => {
  try {
    const job = await jobQueue.getJobById(req.params.id);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json({ job });
  } catch (error) {
    console.error("Get job error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ======================== HEALTH CHECK ========================

app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// ======================== SERVER STARTUP ========================

async function startServer() {
  try {
    console.log("\n🚀 Initializing Event Booking System...\n");

    // Initialize database
    await initializeDatabase();
    console.log("✓ Database initialized");

    // Start job queue processing
    jobQueue.startProcessing(3000);
    console.log("✓ Job queue started");

    // Start server
    app.listen(PORT, () => {
      console.log(`\n✓ Server running on http://localhost:${PORT}`);
      console.log("\n📚 API Documentation:");
      console.log("   POST   /api/auth/register           - Register new user");
      console.log("   POST   /api/auth/login              - Login user");
      console.log(
        "   POST   /api/events                  - Create event (organizer)",
      );
      console.log(
        "   GET    /api/events/organizer/list   - List organizer events",
      );
      console.log("   GET    /api/events/:id              - Get event details");
      console.log(
        "   PUT    /api/events/:id              - Update event (organizer)",
      );
      console.log(
        "   DELETE /api/events/:id              - Delete event (organizer)",
      );
      console.log(
        "   GET    /api/events                  - Browse published events (customer)",
      );
      console.log(
        "   POST   /api/bookings                - Book tickets (customer)",
      );
      console.log(
        "   GET    /api/bookings                - Get customer bookings",
      );
      console.log("   GET    /api/jobs                    - List all jobs");
      console.log("   GET    /api/jobs/:id                - Get job details\n");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
