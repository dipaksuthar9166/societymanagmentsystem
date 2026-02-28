# 📱💻 Mobile & Laptop Access Guide

## Backend Server Configuration

The backend is now configured to accept connections from both **mobile** and **laptop** on the same WiFi network.

### How It Works:

1. **Backend** listens on `0.0.0.0:5001` (all network interfaces)
2. **Frontend** automatically detects if you're on mobile or laptop
3. **Smart routing** ensures correct API connection

---

## 🚀 Quick Start

### Step 1: Start Backend
```bash
cd backend
npm start
```

**You'll see:**
```
Server running on port 5001
📱 Mobile Access: http://192.168.1.100:5001
💻 Laptop Access: http://localhost:5001
🌐 Network Access: http://192.168.1.100:5001
```

**Note:** Copy the IP address shown (e.g., `192.168.1.100`)

---

### Step 2: Start Frontend

**On Laptop:**
```bash
cd frontend
npm start
```
Access at: `http://localhost:5173`

**On Mobile:**
1. Make sure mobile is on **same WiFi** as laptop
2. Open browser on mobile
3. Go to: `http://192.168.1.100:5173` (use the IP from backend console)

---

## 🔧 Configuration

### Frontend Auto-Detection
The frontend automatically detects:
- **Laptop**: Uses `http://localhost:5001/api`
- **Mobile**: Uses `http://YOUR_IP:5001/api`

### Manual Override (if needed)
Edit `frontend/src/config.js`:
```javascript
export const API_BASE_URL = 'http://192.168.1.100:5001/api';
```

---

## 🛡️ Firewall Settings (Windows)

If mobile can't connect, allow port 5001 in Windows Firewall:

1. Open **Windows Defender Firewall**
2. Click **Advanced Settings**
3. Click **Inbound Rules** → **New Rule**
4. Select **Port** → Next
5. Enter **5001** → Next
6. **Allow the connection** → Next
7. Check all (Domain, Private, Public) → Next
8. Name: "Billing App Backend" → Finish

Repeat for port **5173** (frontend).

---

## 📱 Mobile Access Checklist

✅ Both devices on same WiFi  
✅ Backend running and showing IP  
✅ Firewall ports 5001 & 5173 allowed  
✅ Mobile browser accessing `http://YOUR_IP:5173`  

---

## 🐛 Troubleshooting

### Mobile shows "Network Error"
- Check if backend is running
- Verify IP address is correct
- Check firewall settings
- Try pinging laptop from mobile

### Backend not showing IP
- Restart backend server
- Check WiFi connection
- Try `ipconfig` (Windows) or `ifconfig` (Mac/Linux)

### Frontend not loading on mobile
- Check if port 5173 is allowed in firewall
- Try accessing `http://YOUR_IP:5173` directly
- Clear mobile browser cache

---

## 📝 Example Setup

**Laptop IP:** `192.168.1.100`

**Backend Console:**
```
📱 Mobile Access: http://192.168.1.100:5001
💻 Laptop Access: http://localhost:5001
```

**Access URLs:**
- Laptop: `http://localhost:5173`
- Mobile: `http://192.168.1.100:5173`

**API automatically connects to:**
- Laptop → `http://localhost:5001/api`
- Mobile → `http://192.168.1.100:5001/api`

---

## 🎯 Production Deployment

For production, update:
1. Backend: Set proper CORS origins
2. Frontend: Set production API URL
3. Use HTTPS with SSL certificates
4. Deploy on cloud (AWS, Heroku, etc.)

---

**Happy Coding! 🚀**
