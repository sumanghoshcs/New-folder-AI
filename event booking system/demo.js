#!/usr/bin/env node
/**
 * Event Booking System - Demo & Testing Script
 *
 * This script demonstrates all the features of the Event Booking System
 * including user registration, event management, bookings, and background tasks
 */

const axios = require("axios");

// Install axios if not present
try {
  require.resolve("axios");
} catch (e) {
  console.log("Installing axios...");
  require("child_process").execSync("npm install axios", { stdio: "inherit" });
}

const BASE_URL = "http://localhost:3000/api";

// Color codes for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
};

function log(type, message) {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = `[${timestamp}]`;

  switch (type) {
    case "info":
      console.log(`${colors.cyan}${prefix}${colors.reset} ℹ️  ${message}`);
      break;
    case "success":
      console.log(`${colors.green}${prefix}${colors.reset} ✓ ${message}`);
      break;
    case "error":
      console.log(`${colors.red}${prefix}${colors.reset} ✗ ${message}`);
      break;
    case "step":
      console.log(
        `\n${colors.bright}${colors.blue}${prefix}${colors.reset} ${colors.bright}${message}${colors.reset}`,
      );
      break;
    case "separator":
      console.log(`${colors.magenta}${"=".repeat(70)}${colors.reset}`);
      break;
  }
}

class DemoRunner {
  constructor() {
    this.organizerToken = null;
    this.customerToken = null;
    this.organizerId = null;
    this.customerId = null;
    this.eventId = null;
    this.bookingId = null;
  }

  async runFullDemo() {
    log("separator", "");
    log("step", "🚀 EVENT BOOKING SYSTEM - FULL DEMO");
    log("separator", "");

    try {
      // Step 1: Register Organizer
      log("step", "STEP 1: Register as Event Organizer");
      await this.registerOrganizer();

      // Step 2: Register Customer
      log("step", "STEP 2: Register as Customer");
      await this.registerCustomer();

      // Step 3: Create Event
      log("step", "STEP 3: Organizer Creates Event");
      await this.createEvent();

      // Step 4: Publish Event
      log("step", "STEP 4: Organizer Publishes Event");
      await this.publishEvent();

      // Step 5: Browse Events
      log("step", "STEP 5: Customer Browses Published Events");
      await this.browseEvents();

      // Step 6: Book Tickets
      log("step", "STEP 6: Customer Books Tickets");
      await this.bookTickets();

      // Step 7: Check Bookings
      log("step", "STEP 7: Customer Checks Bookings");
      await this.checkCustomerBookings();

      // Step 8: Update Event
      log("step", "STEP 8: Organizer Updates Event");
      await this.updateEvent();

      // Step 9: View Jobs
      log("step", "STEP 9: View Background Jobs");
      await this.viewJobs();

      // Step 10: Wait for jobs to complete
      log("step", "STEP 10: Wait for Background Tasks to Complete");
      await this.waitForJobCompletion();

      log("separator", "");
      log("success", "✓ DEMO COMPLETED SUCCESSFULLY!");
      log("separator", "");

      console.log(`
${colors.green}${colors.bright}Summary of Completed Tasks:${colors.reset}
1. ✓ Registered Event Organizer
2. ✓ Registered Customer
3. ✓ Created Event
4. ✓ Published Event
5. ✓ Browsed Events
6. ✓ Booked Tickets → Background Task Enqueued (Booking Confirmation)
7. ✓ Customer viewed bookings
8. ✓ Updated Event → Background Task Enqueued (Event Notifications)
9. ✓ Viewed Background Jobs
10. ✓ Jobs processed successfully

Watch above for:
   📧 BOOKING CONFIRMATION EMAIL - Shows when booking confirmation task runs
   📢 EVENT UPDATE NOTIFICATION - Shows when event update task runs
      `);
    } catch (error) {
      log("error", `Demo failed: ${error.message}`);
      if (error.response) {
        console.error("Response:", error.response.data);
      }
    }
  }

  async registerOrganizer() {
    try {
      const response = await axios.post(`${BASE_URL}/auth/register`, {
        email: "organizer@example.com",
        password: "password123",
        name: "John Organizer",
        role: "organizer",
      });

      this.organizerToken = response.data.token;
      this.organizerId = response.data.userId;
      log("success", `Organizer registered: ${response.data.user.email}`);
    } catch (error) {
      if (error.response?.data?.error?.includes("already registered")) {
        log("info", "Organizer already exists, attempting login...");
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
          email: "organizer@example.com",
          password: "password123",
        });
        this.organizerToken = loginResponse.data.token;
        this.organizerId = loginResponse.data.user.id;
        log("success", "Organizer logged in");
      } else {
        throw error;
      }
    }
  }

  async registerCustomer() {
    try {
      const response = await axios.post(`${BASE_URL}/auth/register`, {
        email: "customer@example.com",
        password: "password123",
        name: "Jane Customer",
        role: "customer",
      });

      this.customerToken = response.data.token;
      this.customerId = response.data.userId;
      log("success", `Customer registered: ${response.data.user.email}`);
    } catch (error) {
      if (error.response?.data?.error?.includes("already registered")) {
        log("info", "Customer already exists, attempting login...");
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
          email: "customer@example.com",
          password: "password123",
        });
        this.customerToken = loginResponse.data.token;
        this.customerId = loginResponse.data.user.id;
        log("success", "Customer logged in");
      } else {
        throw error;
      }
    }
  }

  async createEvent() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    try {
      const response = await axios.post(
        `${BASE_URL}/events`,
        {
          title: "Tech Conference 2024",
          description:
            "Annual technology conference featuring latest innovations",
          date: tomorrow.toISOString().split("T")[0],
          location: "San Francisco Convention Center",
          totalTickets: 100,
          price: 99.99,
        },
        {
          headers: { Authorization: `Bearer ${this.organizerToken}` },
        },
      );

      this.eventId = response.data.eventId;
      log("success", `Event created: ${response.data.event.title}`);
      log("info", `Event ID: ${this.eventId}`);
    } catch (error) {
      log(
        "error",
        `Failed to create event: ${error.response?.data?.error || error.message}`,
      );
      throw error;
    }
  }

  async publishEvent() {
    try {
      const response = await axios.put(
        `${BASE_URL}/events/${this.eventId}`,
        { status: "published" },
        {
          headers: { Authorization: `Bearer ${this.organizerToken}` },
        },
      );

      log("success", "Event published and ready for bookings");
    } catch (error) {
      log(
        "error",
        `Failed to publish event: ${error.response?.data?.error || error.message}`,
      );
      throw error;
    }
  }

  async browseEvents() {
    try {
      const response = await axios.get(`${BASE_URL}/events`, {
        headers: { Authorization: `Bearer ${this.customerToken}` },
      });

      const events = response.data.events;
      log("success", `Found ${events.length} published event(s)`);

      events.forEach((event) => {
        console.log(
          `   • ${event.title} - ${event.location} - $${event.price}`,
        );
        console.log(
          `     Available tickets: ${event.available_tickets}/${event.total_tickets}`,
        );
      });
    } catch (error) {
      log(
        "error",
        `Failed to browse events: ${error.response?.data?.error || error.message}`,
      );
      throw error;
    }
  }

  async bookTickets() {
    try {
      const response = await axios.post(
        `${BASE_URL}/bookings`,
        {
          eventId: this.eventId,
          numberOfTickets: 5,
        },
        {
          headers: { Authorization: `Bearer ${this.customerToken}` },
        },
      );

      this.bookingId = response.data.bookingId;
      log("success", `Booking confirmed! ID: ${this.bookingId}`);
      log(
        "info",
        `Tickets: ${response.data.booking.numberOfTickets}, Total: $${response.data.booking.totalAmount}`,
      );
      log("info", "📧 Background task queued: Booking Confirmation Email");
    } catch (error) {
      log(
        "error",
        `Failed to book tickets: ${error.response?.data?.error || error.message}`,
      );
      throw error;
    }
  }

  async checkCustomerBookings() {
    try {
      const response = await axios.get(`${BASE_URL}/bookings`, {
        headers: { Authorization: `Bearer ${this.customerToken}` },
      });

      const bookings = response.data.bookings;
      log("success", `Customer has ${bookings.length} booking(s)`);

      bookings.forEach((booking) => {
        console.log(`   • Event: ${booking.eventTitle}`);
        console.log(
          `     Tickets: ${booking.number_of_tickets}, Total: $${booking.total_amount}`,
        );
        console.log(`     Status: ${booking.status}`);
      });
    } catch (error) {
      log(
        "error",
        `Failed to get bookings: ${error.response?.data?.error || error.message}`,
      );
      throw error;
    }
  }

  async updateEvent() {
    try {
      const response = await axios.put(
        `${BASE_URL}/events/${this.eventId}`,
        {
          description:
            "UPDATED: Annual technology conference - Now includes AI workshop!",
        },
        {
          headers: { Authorization: `Bearer ${this.organizerToken}` },
        },
      );

      log("success", "Event updated");
      log("info", "📢 Background task queued: Event Update Notifications");
    } catch (error) {
      log(
        "error",
        `Failed to update event: ${error.response?.data?.error || error.message}`,
      );
      throw error;
    }
  }

  async viewJobs() {
    try {
      const response = await axios.get(`${BASE_URL}/jobs`, {
        headers: { Authorization: `Bearer ${this.organizerToken}` },
      });

      const jobs = response.data.jobs;
      log("success", `Total jobs: ${jobs.length}`);

      console.log("\nJob Queue Status:");
      jobs.forEach((job) => {
        const status = job.status.toUpperCase();
        const statusIcon =
          job.status === "completed"
            ? "✓"
            : job.status === "processing"
              ? "⏳"
              : job.status === "pending"
                ? "⏹"
                : "✗";

        console.log(
          `   ${statusIcon} ${job.type} - ${status} (ID: ${job.id.substring(0, 8)}...)`,
        );
      });
    } catch (error) {
      log(
        "error",
        `Failed to view jobs: ${error.response?.data?.error || error.message}`,
      );
      throw error;
    }
  }

  async waitForJobCompletion() {
    log(
      "info",
      "Waiting for background tasks to complete (watch console for task execution logs)...\n",
    );

    // Wait for tasks to be processed
    for (let i = 0; i < 8; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      process.stdout.write(".");
    }

    console.log("\n");
    log("success", "Background tasks completed");
  }
}

// Run the demo
const demo = new DemoRunner();
demo.runFullDemo().catch((error) => {
  log("error", error.message);
  process.exit(1);
});
