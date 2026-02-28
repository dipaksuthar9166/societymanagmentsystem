---
description: How to use the new Billing and Finance Automation features
---

# Billing & Finance System Guide

The system now includes automated maintenance invoicing, penalty management, and comprehensive financial tracking.

## 1. Automated Maintenance Invoicing
- **Setup**: 
    1. Go to **Flat Management** (Rooms Tab) in the Admin Dashboard.
    2. Edit each flat to set the correct `Maintenance Amount`.
    3. Ensure flats have an assigned "Occupant" (Tenanted or Owner).
- **Automation**: 
    - On the **1st of every month** (00:00 AM), the system automatically generates invoices for all occupied flats based on their set Maintenance Amount.
    - Invoices appear in the **Billing** tab.

## 2. Fine & Penalty Management
- **Configuration**:
    1. Go to **Profile** tab in the Admin Dashboard.
    2. Scroll to **Finance & Penalty Rules** (Admin Only).
    3. Enable "Late Fees" and set a "Daily Fine Amount" (e.g., ₹50).
    4. Click "Update Society Rules".
- **Automation**:
    - The system runs a check **Daily at 01:00 AM**.
    - Any invoice that is `Pending` and past its `Due Date` will automatically have the fine added to its Total Amount.
    - Fines accumulate daily until paid.
    - Users/Admin can see the penalty breakdown in the Invoice details.

## 3. Online Payment Tracking & Dues List
- **Dues List**: 
    - Go to **Defaulters** tab to see a categorized list of members with pending dues (Mild, Moderate, Chronic).
    - Send reminders via WhatsApp/SMS directly from this screen.
- **Payment Tracking**:
    - Go to **Billing** tab to see "Recent Invoices".
    - Mark payments as `PAID` manually (if Cash/Cheque) using the "Mark Paid" button.
    - (Future) Online payments differ status automatically.

## 4. Expense Tracker
- Go to **Expense Tracker** tab.
- Record daily expenses (Security, Cleaning, Repairs).
- View total monthly outflow and download vouchers.

**IMPORTANT**: 
For the automation to start working, please **RESTART your Backend Server** (`npm start` in backend folder).
