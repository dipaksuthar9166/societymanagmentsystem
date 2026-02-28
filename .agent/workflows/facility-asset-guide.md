---
description: How to use Facility and Asset Management features
---

# Facility & Asset Management Guide

## 1. Facility Management (Booking System)
This module allows you to define common amenities (Clubhouse, Gym, Halls) and manage resident bookings.

### Setup Facilities
1. Go to **Facilities** tab in Admin Dashboard.
2. Click on **Amenities** tab (top right).
3. **Add New Facility**:
   - Enter Name (e.g., "Grand Hall").
   - Set Charge per Slot (e.g., ₹500).
   - Set Capacity.
   - Click "Create Facility".
4. These facilities will now be visible to users for booking.

### Manage Bookings
1. Go to **Facilities** tab -> **Requests**.
2. View pending booking requests from residents.
3. Click **Approve** or **Reject**.
4. Use **Calendar** tab to see confirmed bookings by date.

## 2. Asset Management (Inventory)
This module helps track society assets (Generators, Lifts, CCTV) and their maintenance history.

### Accessing
- Go to **Admin Dashboard** -> Click **Assets** in the sidebar.

### Features
1. **Add Asset**:
   - Click "Add Asset".
   - Enter details: Name, Category, Purchase Date, Warranty/AMC Expiry.
   - Set Status (Operational/Broken).
2. **Service Logs**:
   - Click on any asset card to view details.
   - Use the sidebar form to **Log Maintenance/Service**.
   - Enter description (e.g., "Annual Servicing"), Cost, and Technician Name.
   - This builds a "Service History" and tracks total spend on the asset.
3. **AMC Tracking**:
   - The system highlights assets with expiring AMCs in the list view.

**Note**: Please restart backend server (`npm start`) to enable the new API routes.
