# 📖 Event Booking System - File Navigation Guide

## 🎯 START HERE

**If you just downloaded this project, read in this order:**

1. **SYSTEM_OVERVIEW.txt** ← Start here! Quick visual overview
2. **PROJECT_READY.md** ← Complete checklist and next steps
3. **VIDEO_GUIDE.md** ← Instructions for recording demo
4. **README.md** ← Full technical documentation

---

## 📂 File Organization

### 🚀 GETTING STARTED (Quick Start)

```
SYSTEM_OVERVIEW.txt    - Visual overview of entire system
PROJECT_READY.md       - What's implemented and ready to record
VIDEO_GUIDE.md         - Step-by-step video recording instructions
start.bat              - Quick start script for Windows
```

### 📚 CORE BACKEND (Production Code)

```
server.js              - Main Express app with all 13 API endpoints
database.js            - SQLite database setup and initialization
auth.js               - JWT authentication and RBAC middleware
jobQueue.js           - Background job processor
demo.js               - Automated end-to-end demonstration
```

### 📖 DOCUMENTATION (Reference)

```
README.md             - Complete system documentation with design decisions
API_TESTING.md        - Quick API reference and curl examples
IMPLEMENTATION_SUMMARY.md - Feature checklist and design details
PLAN.md              - Initial project planning document
```

### ⚙️ CONFIGURATION (Settings)

```
package.json          - npm dependencies and scripts
package-lock.json     - Locked dependency versions
.env                  - Environment variables (PORT, JWT_SECRET)
```

### 💾 DATA (Generated)

```
eventbooking.db       - SQLite database (auto-created on first run)
node_modules/         - npm packages (auto-installed)
```

---

## 🎬 VIDEO RECORDING WORKFLOW

**Quick Path to Recording:**

```
1. Open SYSTEM_OVERVIEW.txt         ← Understand what to show
   └─ Read the visual overview

2. Open VIDEO_GUIDE.md              ← Get recording script
   └─ Follow the step-by-step timing

3. Terminal 1: npm start            ← Start server
   └─ Verify startup messages

4. Terminal 2: node demo.js         ← Run demonstration
   └─ Verify background tasks execute

5. Record your screen                ← Capture the demo
   └─ Ensure face is visible
   └─ Speak in English

6. Submit link via Google Form       ← Complete submission
   └─ https://forms.gle/ER387znmXfN4MvzdA
```

---

## 📋 Documentation Quick Links

### For System Understanding

- **README.md** - Full architecture, all endpoints, design decisions
- **PLAN.md** - Initial project planning and goals
- **IMPLEMENTATION_SUMMARY.md** - Feature verification checklist

### For Video Recording

- **VIDEO_GUIDE.md** - Complete recording script with timing
- **SYSTEM_OVERVIEW.txt** - Visual system overview
- **PROJECT_READY.md** - Next steps and checklist

### For API Testing

- **API_TESTING.md** - Curl commands, examples, and troubleshooting
- **README.md** (API Section) - Detailed endpoint documentation

### For Code Review

- **server.js** - Main implementation
- **jobQueue.js** - Background task processor
- **auth.js** - Security implementation
- **database.js** - Database schema

---

## 🔧 Common Tasks

### "How do I start the system?"

```bash
npm start
# See VIDEO_GUIDE.md for next steps
```

### "How do I run the demo?"

```bash
# Terminal 1: npm start (if not already running)
# Terminal 2: node demo.js
# Watch server terminal for background tasks
```

### "How do I test individual APIs?"

```bash
# See API_TESTING.md for curl command examples
# Contains all 13 endpoints with examples
```

### "How do I record the video?"

```bash
# 1. Read VIDEO_GUIDE.md
# 2. Follow the script
# 3. Record with face visible
# 4. Duration 2-5 minutes
```

### "Where is the database?"

```
eventbooking.db (auto-created on first run)
Contains: users, events, bookings, jobs tables
```

### "What if something breaks?"

```
1. Delete eventbooking.db
2. Run: npm start (creates fresh database)
3. Run: node demo.js (tests everything)
```

---

## 📊 Project Statistics

| Item                | Count  | Status      |
| ------------------- | ------ | ----------- |
| API Endpoints       | 13     | ✅ Complete |
| Database Tables     | 4      | ✅ Complete |
| Background Tasks    | 2      | ✅ Complete |
| Documentation Files | 7      | ✅ Complete |
| Code Files          | 5      | ✅ Complete |
| Total Project Size  | ~45 KB | ✅ Compact  |

---

## ✅ Verification Checklist

Before recording your video:

- [ ] Read SYSTEM_OVERVIEW.txt
- [ ] Read VIDEO_GUIDE.md
- [ ] `npm start` works without errors
- [ ] `node demo.js` completes successfully
- [ ] Background tasks display in server terminal
- [ ] Camera/microphone working
- [ ] Screen recording software ready
- [ ] Recording duration will be 2-5 minutes

---

## 🎓 What You'll Demonstrate

1. **User Registration** - Both organizer and customer
2. **Event Management** - Create, publish, and update events
3. **Ticket Booking** - Customer books tickets for event
4. **Background Task 1** - Booking confirmation email (console log)
5. **Background Task 2** - Event update notifications (console log)
6. **Job Queue** - View all jobs and their status
7. **Database** - Show SQLite with all data

---

## 📝 File Purpose Summary

| File             | Purpose                   | Size    |
| ---------------- | ------------------------- | ------- |
| server.js        | Main API implementation   | 13.6 KB |
| database.js      | Database layer            | 3.3 KB  |
| auth.js          | Security & authentication | 1.4 KB  |
| jobQueue.js      | Background task processor | 6.2 KB  |
| demo.js          | Automated demonstration   | 12.2 KB |
| README.md        | Full documentation        | 16.4 KB |
| VIDEO_GUIDE.md   | Recording instructions    | 4.9 KB  |
| API_TESTING.md   | API reference             | 6.0 KB  |
| PROJECT_READY.md | Checklist & next steps    | 11.3 KB |

---

## 🎯 Next Steps

1. **Read:** SYSTEM_OVERVIEW.txt (2 min read)
2. **Understand:** VIDEO_GUIDE.md (3 min read)
3. **Setup:** Terminal with `npm start`
4. **Demo:** Terminal with `node demo.js`
5. **Record:** Follow VIDEO_GUIDE.md script
6. **Submit:** Google Form link

**Total time to video:** ~20 minutes
**Video duration:** 2-5 minutes
**Submission:** Google Form (link in docs)

---

## ❓ Quick Help

**Q: Where do I find the API documentation?**
A: README.md has complete API reference with examples

**Q: How do background tasks work?**
A: jobQueue.js processes jobs; see README.md for detailed explanation

**Q: Can I modify the code?**
A: Yes! Customize event names, user details, etc.

**Q: What if I have errors?**
A: See API_TESTING.md "Troubleshooting" section

**Q: How long should the video be?**
A: 2-5 minutes (ideal 3-4 minutes)

---

## 🚀 You're Ready!

Everything is implemented, tested, and documented.

**Next action:** Open SYSTEM_OVERVIEW.txt and start!

---

_For detailed questions, refer to README.md_
_For recording questions, refer to VIDEO_GUIDE.md_
_For API questions, refer to API_TESTING.md_
