# Activity Logging & Real-time Notification System

## Overview
This system tracks all user activities and notifies admins in real-time through Socket.io, browser notifications, and a beautiful live activity feed.

---

## 🎯 Features

✅ **Real-time Updates** - Socket.io integration for instant notifications  
✅ **Browser Push Notifications** - Critical alerts even when tab is inactive  
✅ **Category Filtering** - Filter by INFO, SUCCESS, WARNING, CRITICAL  
✅ **Unread Badges** - Visual indicators for new activities  
✅ **Dark Mode Support** - Beautiful UI in both light and dark themes  
✅ **Time Ago Formatting** - Human-readable timestamps  
✅ **Auto-logging** - Middleware automatically logs important actions  

---

## 📦 Installation

### 1. Install Socket.io Dependencies

```bash
# Backend
cd backend
npm install socket.io

# Frontend
cd frontend
npm install socket.io-client
```

### 2. Update server.js to enable Socket.io

Add this to your `backend/server.js`:

```javascript
const http = require('http');
const socketIo = require('socket.io');

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true
    }
});

// Make io globally available
global.io = io;

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join society room
    socket.on('joinSociety', (societyId) => {
        socket.join(`society_${societyId}`);
        console.log(`Socket ${socket.id} joined society_${societyId}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Use server instead of app for listening
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

### 3. Add Activity Routes

In `backend/server.js`, add:

```javascript
const activityRoutes = require('./routes/activities');
app.use('/api/activities', activityRoutes);
```

---

## 🔧 Usage Examples

### Example 1: Log User Login

```javascript
const { logActivity } = require('../utils/activityLogger');

// In your login controller
await logActivity({
    userId: user._id,
    societyId: user.society,
    action: 'LOGIN',
    category: 'INFO',
    description: `${user.name} logged in`,
    metadata: { role: user.role },
    req
});
```

### Example 2: Log Payment Success

```javascript
await logActivity({
    userId: req.user._id,
    societyId: req.user.society,
    action: 'PAYMENT_SUCCESS',
    category: 'SUCCESS',
    description: `${req.user.name} paid ₹${amount} for ${month}`,
    metadata: {
        amount,
        month,
        invoiceId: invoice._id,
        paymentMethod: 'Online'
    },
    req
});
```

### Example 3: Log Emergency Alert (CRITICAL)

```javascript
await logActivity({
    userId: req.user._id,
    societyId: req.user.society,
    action: 'EMERGENCY_ALERT',
    category: 'CRITICAL',
    description: `🚨 EMERGENCY from ${req.user.flatNumber} - ${message}`,
    metadata: {
        flatNumber: req.user.flatNumber,
        message,
        location: req.user.flatNumber
    },
    req
});
```

### Example 4: Log Document Download

```javascript
await logActivity({
    userId: req.user._id,
    societyId: req.user.society,
    action: 'DOCUMENT_DOWNLOADED',
    category: 'INFO',
    description: `${req.user.name} downloaded ${documentName}`,
    metadata: {
        documentId,
        documentName,
        documentType
    },
    req
});
```

---

## 🎨 Frontend Integration

### Add to Admin Dashboard Header

```javascript
import LiveActivityFeed from '../components/LiveActivityFeed';

// In your AdminDashboard.jsx header
<header className="...">
    <div className="flex items-center gap-4">
        {/* Other header items */}
        
        {/* Live Activity Feed */}
        <LiveActivityFeed token={user.token} user={user} />
        
        {/* Profile dropdown, etc */}
    </div>
</header>
```

---

## 📊 Activity Categories

| Category | Use Case | Color | Example |
|----------|----------|-------|---------|
| **INFO** | General activities | Blue | Login, Profile update |
| **SUCCESS** | Successful operations | Green | Payment success, Booking confirmed |
| **WARNING** | Important notices | Amber | Payment pending, Document expiring |
| **CRITICAL** | Urgent alerts | Red | Emergency SOS, Payment failed |

---

## 🔔 Browser Notifications

The system automatically requests notification permission and shows browser notifications for **CRITICAL** activities.

To test:
1. Allow notifications when prompted
2. Trigger a critical activity (e.g., Emergency Alert)
3. Even if the tab is inactive, you'll see a desktop notification

---

## 🎯 Action Types

Available action types (from ActivityLog model):

**Authentication:**
- LOGIN, LOGOUT, PASSWORD_CHANGE

**Payments:**
- PAYMENT_INITIATED, PAYMENT_SUCCESS, PAYMENT_FAILED

**Documents:**
- DOCUMENT_UPLOADED, DOCUMENT_DOWNLOADED, DOCUMENT_DELETED

**Complaints:**
- COMPLAINT_CREATED, COMPLAINT_UPDATED, COMPLAINT_RESOLVED

**Emergency:**
- EMERGENCY_ALERT, SOS_TRIGGERED

**Facility:**
- FACILITY_BOOKED, FACILITY_CANCELLED

**Gate Pass:**
- GATE_PASS_CREATED, GATE_PASS_USED

**Admin Actions:**
- INVOICE_GENERATED, USER_CREATED, NOTICE_PUBLISHED, EXPENSE_ADDED

---

## 🚀 Quick Start Checklist

- [ ] Install socket.io dependencies
- [ ] Update server.js with Socket.io setup
- [ ] Add activity routes to server.js
- [ ] Import LiveActivityFeed in AdminDashboard
- [ ] Add logActivity calls to important actions
- [ ] Test real-time updates
- [ ] Test browser notifications
- [ ] Test filtering and mark as read

---

## 🎨 UI Preview

The Live Activity Feed features:
- **Bell icon** with unread badge in header
- **Dropdown panel** with smooth animations
- **Filter tabs** for quick category switching
- **Activity cards** with icons, descriptions, and timestamps
- **Mark all as read** functionality
- **Real-time updates** with pulse animations
- **Dark mode** support

---

## 📝 Example: Complete Payment Flow

```javascript
// In your payment controller

// 1. Log payment initiation
await logActivity({
    userId: req.user._id,
    societyId: req.user.society,
    action: 'PAYMENT_INITIATED',
    category: 'INFO',
    description: `${req.user.name} initiated payment of ₹${amount}`,
    metadata: { amount, invoiceId },
    req
});

// ... process payment ...

// 2. Log success or failure
if (paymentSuccess) {
    await logActivity({
        userId: req.user._id,
        societyId: req.user.society,
        action: 'PAYMENT_SUCCESS',
        category: 'SUCCESS',
        description: `✅ ${req.user.name} successfully paid ₹${amount}`,
        metadata: { amount, invoiceId, transactionId },
        req
    });
} else {
    await logActivity({
        userId: req.user._id,
        societyId: req.user.society,
        action: 'PAYMENT_FAILED',
        category: 'WARNING',
        description: `❌ Payment failed for ${req.user.name} - ₹${amount}`,
        metadata: { amount, invoiceId, error: errorMessage },
        req
    });
}
```

---

## 🔒 Security Notes

- Activity logs are **society-scoped** (users only see their society's activities)
- Only **Admins** can view the activity feed
- IP addresses and user agents are logged for audit purposes
- Socket.io rooms are **society-specific** for data isolation

---

## 🎉 Benefits

1. **Real-time Monitoring** - Admins see activities instantly
2. **Audit Trail** - Complete history of all actions
3. **Quick Response** - Critical alerts trigger immediate notifications
4. **User Insights** - Track user behavior and engagement
5. **Compliance** - Maintain logs for regulatory requirements

---

## 📞 Support

For issues or questions, refer to the main project documentation or contact the development team.

**Happy Monitoring! 🚀**
