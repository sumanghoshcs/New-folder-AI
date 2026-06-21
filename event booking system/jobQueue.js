const { get, all, run } = require('./database');
const { randomUUID } = require('crypto');

class JobQueue {
  constructor() {
    this.processing = false;
    this.processingInterval = null;
  }

  // Enqueue a new job
  async enqueueJob(type, payload) {
    
    const jobId = randomUUID();
    
    await run(
      `INSERT INTO jobs (id, type, payload, status) VALUES (?, ?, ?, 'pending')`,
      [jobId, type, JSON.stringify(payload)]
    );
    
    console.log(`[JOB ENQUEUED] ${type} - ID: ${jobId}`);
    return jobId;
  }

  // Start processing jobs
  startProcessing(interval = 2000) {
    if (this.processingInterval) {
      console.log('[JOB QUEUE] Already processing');
      return;
    }

    console.log('[JOB QUEUE] Started processing jobs');
    this.processingInterval = setInterval(() => {
      this.processNextJob();
    }, interval);
  }

  // Stop processing jobs
  stopProcessing() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log('[JOB QUEUE] Stopped processing');
    }
  }

  // Process the next pending job
  async processNextJob() {
    if (this.processing) return;

    try {
      const job = await get(
        `SELECT * FROM jobs WHERE status = 'pending' ORDER BY created_at ASC LIMIT 1`
      );

      if (!job) return;

      this.processing = true;

      // Mark as processing
      await run(
        `UPDATE jobs SET status = 'processing', started_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [job.id]
      );

      console.log(`\n[PROCESSING JOB] ${job.id} - Type: ${job.type}`);

      const payload = JSON.parse(job.payload);

      // Process based on job type
      if (job.type === 'booking_confirmation') {
        await this.processBookingConfirmation(payload);
      } else if (job.type === 'event_update_notification') {
        await this.processEventUpdateNotification(payload);
      }

      // Mark as completed
      await run(
        `UPDATE jobs SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [job.id]
      );

      console.log(`[JOB COMPLETED] ${job.id}\n`);
    } catch (error) {
      console.error('[JOB ERROR]', error);
      // Could mark job as failed here
    } finally {
      this.processing = false;
    }
  }

  // Handle booking confirmation task
  async processBookingConfirmation(payload) {
    const { bookingId, customerEmail, customerName, eventTitle, numberOfTickets } = payload;

    // Simulate sending email
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║              📧 BOOKING CONFIRMATION EMAIL                     ║
╠════════════════════════════════════════════════════════════════╣
║ TO: ${customerEmail.padEnd(60)}║
║ CUSTOMER: ${customerName.padEnd(54)}║
║ EVENT: ${eventTitle.substring(0, 54).padEnd(54)}║
║ TICKETS: ${numberOfTickets}                                                  ║
║ BOOKING ID: ${bookingId.substring(0, 50).padEnd(50)}║
║                                                                ║
║ Thank you for booking! Your tickets are confirmed.            ║
║ Check your email for ticket details.                          ║
╚════════════════════════════════════════════════════════════════╝
    `);
  }

  // Handle event update notification task
  async processEventUpdateNotification(payload) {
    const { eventId, eventTitle, organizerName } = payload;

    try {
      // Get all customers who booked this event
      const bookings = await all(
        `SELECT DISTINCT u.id, u.email, u.name FROM bookings b
         JOIN users u ON b.customer_id = u.id
         WHERE b.event_id = ? AND b.status = 'confirmed'`,
        [eventId]
      );

      if (bookings.length === 0) {
        console.log(`   ℹ️  No customers to notify for event: ${eventTitle}`);
        return;
      }

      console.log(`
╔════════════════════════════════════════════════════════════════╗
║           📢 EVENT UPDATE NOTIFICATION BROADCAST               ║
╠════════════════════════════════════════════════════════════════╣
║ EVENT: ${eventTitle.substring(0, 54).padEnd(54)}║
║ ORGANIZER: ${organizerName.substring(0, 50).padEnd(50)}║
║ NOTIFYING ${bookings.length.toString().padEnd(57)}║
║                                                                ║
║ Customers to notify:                                           ║
      `);

      for (const booking of bookings) {
        console.log(`║   ✓ ${booking.email.padEnd(57)}║`);
      }

      console.log(`║                                                                ║
║ Notification: "Event has been updated. Check details."       ║
╚════════════════════════════════════════════════════════════════╝
      `);
    } catch (error) {
      console.error('Error notifying customers:', error);
      throw error;
    }
  }

  // Get all jobs
  async getAllJobs() {
    return await all(`SELECT * FROM jobs ORDER BY created_at DESC`);
  }

  // Get job by ID
  async getJobById(jobId) {
    return await get(`SELECT * FROM jobs WHERE id = ?`, [jobId]);
  }
}

const jobQueue = new JobQueue();

module.exports = { jobQueue };
