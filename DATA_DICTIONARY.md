# 📚 Complete Data Dictionary - Society Management System (Nexus OS)

This document provides a detailed technical reference for the database schema.
**Database:** MongoDB
**ORM:** Mongoose

---

## 1. 👥 Users & Society Management

### 1.1 Users (`users`)
Stores all user profiles including Super Admins, Society Admins, Residents, and Staff.

| Field Name | Data Type | Constraints / Enum | Description |
|------------|-----------|--------------------|-------------|
| `_id` | ObjectId | PK | Unique Identifier |
| `name` | String | Required | Full Name |
| `email` | String | Unique, Required | Login Email |
| `password` | String | Required | Hashed Password |
| `role` | String | `superadmin`, `admin`, `user`, `guard`, `secretary`... | Access Level |
| `company` | ObjectId | Ref: `Company` | Society specific to the user |
| `flatNo` | String | - | Flat Number (e.g., A-101) |
| `isOwner` | Boolean | Default: `false` | `true` = Owner, `false` = Tenant |
| `status` | String | `active`, `inactive` | Account Status |
| `isVerified` | Boolean | Default: `false` | Email Verification Status |
| `profileImage` | String | URL | Profile Picture URL |
| `familyMembers` | Number | Default: 0 | Count of residents in unit |

### 1.2 Companies (`companies`)
Represents a Housing Society or Commercial Complex.

| Field Name | Data Type | Constraints / Enum | Description |
|------------|-----------|--------------------|-------------|
| `name` | String | Unique, Required | Society Name |
| `email` | String | Unique, Required | Official Society Email |
| `plan` | String | `Basic`, `Pro`, `Enterprise` | SaaS Subscription Tier |
| `ownerId` | ObjectId | Ref: `User` | User who created the society |
| `status` | String | `Active`, `Inactive`, `Suspended` | Account Status |
| `settings` | Object | Nested | Configs (`maxRooms`, `lateFeeRule`) |
| `paymentGateway` | Object | Nested | Razorpay Key/Secret |

### 1.3 Flats (`flats`)
Individual residential units.

| Field Name | Data Type | Constraints / Enum | Description |
|------------|-----------|--------------------|-------------|
| `societyId` | ObjectId | Required, Ref: `Company` | Parent Society |
| `flatNo` | String | Required | Unit Number |
| `block` | String | - | Wing/Block Name |
| `flatType` | String | `2BHK`, `3BHK`... | Unit Configuration |
| `status` | String | `Occupied`, `Vacant`, `Rented` | Occupancy Status |
| `tenantId` | ObjectId | Ref: `User` | Current Tenant (if any) |
| `ownerName` | String | - | Owner Name (for records) |
| `maintenanceAmount`| Number | Default: 0 | Monthly Dues |
| `legalDetails` | Object | Nested | `index2`, `propertyCard` info |

---

## 2. 💰 Finance Module

### 2.1 Invoices (`invoices`)
Monthly maintenance bills and ad-hoc charges.

| Field Name | Data Type | Constraints / Enum | Description |
|------------|-----------|--------------------|-------------|
| `societyId` | ObjectId | Required, Ref: `Company` | Issuing Society |
| `customerId` | ObjectId | Required, Ref: `User` | Payer |
| `items` | Array | Nested Object | List of `{name, price, qty}` |
| `totalAmount` | Number | Required | Final Payable Amount |
| `type` | String | `Maintenance`, `Rent`, `Adhoc` | Bill Category |
| `status` | String | `Paid`, `Pending`, `Overdue` | Payment Status |
| `dueDate` | Date | - | Payment Deadline |
| `penalty` | Number | Default: 0 | Late Fee amount |

### 2.2 Transactions (`transactions`)
Payment records (Online Gateway or Offline Cash/Cheque).

| Field Name | Data Type | Constraints / Enum | Description |
|------------|-----------|--------------------|-------------|
| `invoiceId` | ObjectId | Ref: `Invoice` | Linked Bill |
| `userId` | ObjectId | Ref: `User` | Payer |
| `amount` | Number | Required | Amount Paid |
| `paymentId` | String | Required (if online) | Razorpay Payment ID |
| `status` | String | `Success`, `Failed`, `Pending` | Transaction Outcome |
| `paymentMethod` | String | - | `UPI`, `Card`, `Netbanking` |

### 2.3 Expenses (`expenses`)
Society expenditure tracking.

| Field Name | Data Type | Constraints / Enum | Description |
|------------|-----------|--------------------|-------------|
| `title` | String | Required | Expense Name |
| `amount` | Number | Required | Cost Incurred |
| `category` | String | `Security`, `Cleaning`... | Expense Head |
| `paidTo` | String | Required | Vendor/Person Name |
| `date` | Date | Default: `now` | Date of Expense |

---

## 3. 🏟️ Facilities & Amenities

### 3.1 Facilities (`facilities`)
Common areas like Gym, Pool, Clubhouse.

| Field Name | Data Type | Constraints / Enum | Description |
|------------|-----------|--------------------|-------------|
| `name` | String | Required | Facility Name |
| `chargePerSlot` | Number | Default: 0 | Booking Cost |
| `slotDurationHours`| Number | Default: 1 | Duration per booking |
| `isActive` | Boolean | Default: `true` | Availability |

### 3.2 FacilityBookings (`facilitybookings`)
Reservations made by residents.

| Field Name | Data Type | Constraints / Enum | Description |
|------------|-----------|--------------------|-------------|
| `facilityId` | ObjectId | Ref: `Facility` | Targeted Facility |
| `bookedBy` | ObjectId | Ref: `User` | Resident |
| `date` | Date | Required | Booking Date |
| `startTime` | String | - | "10:00 AM" |
| `status` | String | `Approved`, `Pending`, `Rejected`| Admin Approval Status |
| `paymentStatus` | String | `Paid`, `Pending` | If charge applies |

### 3.3 ParkingSlots (`parkingslots`)
Inventory of parking spaces.

| Field Name | Data Type | Constraints / Enum | Description |
|------------|-----------|--------------------|-------------|
| `slotNumber` | String | Unique, Required | Slot Label (P-1) |
| `type` | String | `Visitor`, `Resident`, `EV` | Slot Category |
| `isOccupied` | Boolean | Default: `false` | Live Status |
| `currentBooking` | ObjectId | Ref: `ParkingBooking` | Active Session |

### 3.4 ParkingBookings (`parkingbookings`)
Short-term visitor parking sessions.

| Field Name | Data Type | Constraints / Enum | Description |
|------------|-----------|--------------------|-------------|
| `vehicleNumber` | String | Required | Car Plate |
| `slot` | ObjectId | Ref: `ParkingSlot` | Assigned Slot |
| `totalCost` | Number | Required | Calculated Fee |
| `status` | String | `Active`, `Completed` | Session Status |

### 3.5 Assets (`assets`)
Physical inventory (Generators, Motors).

| Field Name | Data Type | Constraints / Enum | Description |
|------------|-----------|--------------------|-------------|
| `name` | String | Required | Asset Name |
| `category` | String | `Electronics`, `Infrastructure`| Type |
| `amcExpiry` | Date | - | Maintenance Contract End |
| `serviceHistory` | Array | Nested Object | Logs of repairs |

---

## 4. 🛡️ Security & Gate

### 4.1 Visitors (`visitors`)
Gate entry logs.

| Field Name | Data Type | Constraints / Enum | Description |
|------------|-----------|--------------------|-------------|
| `name` | String | Required | Visitor Name |
| `mobile` | String | Required | Phone Validated |
| `visitorType` | String | `Guest`, `Delivery`, `Service`| Purpose |
| `hostFlatId` | ObjectId | Ref: `Flat` | Destination Unit |
| `status` | String | `In`, `Out`, `Denied` | Current State |
| `approvalStatus` | String | `Pending`, `Approved` | Resident Action |

### 4.2 Parcels (`parcels`)
Package collection at Gate.

| Field Name | Data Type | Constraints / Enum | Description |
|------------|-----------|--------------------|-------------|
| `flatNo` | String | Required | Recipient Unit |
| `courierName` | String | Required | Amazon, DHL, etc. |
| `status` | String | `At Gate`, `Collected` | Delivery Status |
| `image` | String | URL | Photo of package |

### 4.3 Cameras (`cameras`)
CCTV Stream Configuration.

| Field Name | Data Type | Constraints / Enum | Description |
|------------|-----------|--------------------|-------------|
| `name` | String | Required | Camera Location |
| `streamUrl` | String | Required | RTSP/HLS URL |
| `type` | String | `Static`, `PTZ` | Camera Model |
| `isPublic` | Boolean | Default: `false` | Visible to Residents? |

### 4.4 Alerts (`alerts`)
Emergency SOS signals.

| Field Name | Data Type | Constraints / Enum | Description |
|------------|-----------|--------------------|-------------|
| `type` | String | `Medical`, `Fire`, `SOS` | Alert Category |
| `userId` | ObjectId | Ref: `User` | Panic Button Presser |
| `location` | Object | `{lat, lng}` | GPS Coordinates |
| `status` | String | `Active`, `Resolved` | Lifecycle |

---

## 5. 📢 Communication

### 5.1 Notices (`notices`)
Digital Notice Board.

| Field Name | Data Type | Constraints / Enum | Description |
|------------|-----------|--------------------|-------------|
| `title` | String | Required | Header |
| `content` | String | Required | Body Text |
| `postedBy` | ObjectId | Ref: `User` (Admin) | Author |
| `isActive` | Boolean | Default: `true` | Visible? |

### 5.2 Polls (`polls`)
Decision making.

| Field Name | Data Type | Constraints / Enum | Description |
|------------|-----------|--------------------|-------------|
| `title` | String | Required | Question |
| `options` | Array | Nested `{text, votes}` | Choices |
| `type` | String | `YesNo`, `Option` | Format |
| `votes` | Array | Nested `{user, optionIndex}` | Records |

### 5.3 Messages (`messages`)
Internal Chat (Society WhatsApp).

| Field Name | Data Type | Constraints / Enum | Description |
|------------|-----------|--------------------|-------------|
| `sender` | ObjectId | Ref: `User` | From |
| `receiver` | ObjectId | Ref: `User` | To |
| `content` | String | Required | Text Body |
| `messageType` | String | `text`, `image` | Format |

### 5.4 Calls (`calls`)
WebRTC Call Logs.

| Field Name | Data Type | Constraints / Enum | Description |
|------------|-----------|--------------------|-------------|
| `caller` | ObjectId | Ref: `User` | Initiator |
| `callType` | String | `audio`, `video` | Mode |
| `duration` | Number | Seconds | Length |
| `status` | String | `missed`, `ended` | Outcome |

---

## 6. 🛠️ Support & Services

### 6.1 Complaints (`complaints`)
Resident Helpdesk.

| Field Name | Data Type | Constraints / Enum | Description |
|------------|-----------|--------------------|-------------|
| `title` | String | Required | Issue Summary |
| `category` | String | `Plumbing`, `Electric` | Trade |
| `status` | String | `Pending`, `Resolved` | Progress |
| `workerDetails` | Object | Nested `{name, phone}` | Assigned Staff |

### 6.2 ServiceProviders (`serviceproviders`)
Daily Help (Maids, Drivers).

| Field Name | Data Type | Constraints / Enum | Description |
|------------|-----------|--------------------|-------------|
| `name` | String | Required | Staff Name |
| `role` | String | `Maid`, `Cook`, `Driver` | Profession |
| `ratings` | Array | Nested `{user, rating}` | Feedback |
| `isVerified` | Boolean | Default: `false` | Security Check |

### 6.3 Vendors (`vendors`)
Contracted Agencies.

| Field Name | Data Type | Constraints / Enum | Description |
|------------|-----------|--------------------|-------------|
| `company` | ObjectId | Ref: `Company` | Society |
| `name` | String | Required | Vendor Name |
| `serviceType` | String | `Security`, `Cleaning` | Contract Type |
| `monthlyCost` | Number | - | Retainer Fee |

---

## 7. ⚙️ System Config

### 7.1 GlobalConfig (`globalconfigs`)
Super Admin Settings.

| Field Name | Data Type | Constraints / Enum | Description |
|------------|-----------|--------------------|-------------|
| `currency` | String | Default: `INR` | System Currency |
| `maintenanceMode`| Boolean| Default: `false` | System Lock |
| `lateFeeDaily` | Number | Default: 50 | Standard Fine |

### 7.2 Plans (`plans`)
SaaS Packages.

| Field Name | Data Type | Constraints / Enum | Description |
|------------|-----------|--------------------|-------------|
| `name` | String | Unique | Plan Name |
| `price` | Number | Required | Cost |
| `maxRooms` | Number | - | Unit Limit |

### 7.3 SmartAutomation (`smartautomations`)
Trigger rules.

| Field Name | Data Type | Constraints / Enum | Description |
|------------|-----------|--------------------|-------------|
| `trigger` | String | `PAYMENT_FAILED`... | Event |
| `type` | String | `Email`, `WhatsApp` | Action Channel |
| `isActive` | Boolean | Default: `true` | Enabled? |

---

## 8. 📊 Logs & Testing

### 8.1 ActivityLog (`activitylogs`)
Audit Trail.

| Field Name | Data Type | Constraints / Enum | Description |
|------------|-----------|--------------------|-------------|
| `user` | ObjectId | Ref: `User` | Actor |
| `action` | String | `LOGIN`, `DELETE` | Event Type |
| `ipAddress` | String | - | Source |

### 8.2 VisitorAnalytics (`visitoranalytics`)
Web Traffic Stats.

| Field Name | Data Type | Constraints / Enum | Description |
|------------|-----------|--------------------|-------------|
| `ip` | String | Required | User IP |
| `path` | String | - | Page URL |
| `device` | String | - | Mobile/Desktop |

