# 📊 Complete Project UML Diagrams

This document contains a comprehensive set of UML diagrams for the **Society Management System (Nexus OS)**. These diagrams cover structure, behavior, and interactions within the system.

> **Note:** You can view these diagrams visually by installing the **"Markdown Preview Mermaid Support"** extension in VS Code.

---

## 1. 🏗️ Class Diagram (Structural)
Represents the database schema and relationships between active entities.

```mermaid
classDiagram
    %% Core Relationships
    Company "1" -- "*" User : has members
    Company "1" -- "*" Flat : contains
    Company "1" -- "*" Asset : owns
    Company "1" -- "*" Facility : manages

    %% User Relationships
    User "1" -- "*" Complaint : raises
    User "1" -- "*" Visitor : invites
    User "1" -- "*" Invoice : receives
    User "1" -- "*" ParkingBooking : reserves

    class Company {
        +String name
        +String plan
        +Object settings
        +createNotices()
    }

    class User {
        +String name
        +String role
        +String flatNo
        +login()
        +payBill()
    }

    class Flat {
        +String flatNo
        +String status
        +String type
    }

    class Invoice {
        +Number amount
        +String status
        +Date dueDate
    }

    class Visitor {
        +String name
        +String type
        +String approvalStatus
    }
```

---

## 2. 👤 Use Case Diagram (Functional)
Shows the interactions between different actors (Users) and the system.

```mermaid
usecaseDiagram
    actor "Super Admin" as SA
    actor "Society Admin" as Admin
    actor "Resident" as User
    actor "Security Guard" as Guard

    package "Nexus OS System" {
        usecase "Manage Societies" as UC1
        usecase "Manage Users & Flats" as UC2
        usecase "Generate Bills & Expenses" as UC3
        usecase "Pay Maintenance" as UC4
        usecase "Book Amenities" as UC5
        usecase "Approve Visitors" as UC6
        usecase "Log Entry/Exit" as UC7
        usecase "Raise Complaints" as UC8
        usecase "View Analytics" as UC9
    }

    SA --> UC1
    SA --> UC9
    
    Admin --> UC2
    Admin --> UC3
    Admin --> UC9
    
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC8
    
    Guard --> UC7
    Guard --> UC6
```

---

## 3. 🔄 Sequence Diagram: Visitor Entry Flow
Detailed flow of how a visitor entry is processed and approved.

```mermaid
sequenceDiagram
    participant V as Visitor
    participant G as Guard App
    participant S as Server
    participant R as Resident App
    
    V->>G: Arrives at Gate
    G->>S: Input Visitor Details (Name, Photo, Flat)
    S->>S: Generate Entry Request
    S-->>R: Send Notification (Approve/Deny?)
    
    alt Resident Approves
        R->>S: Click "Approve"
        S-->>G: Update Status: "APPROVED"
        G->>V: Allow Entry
    else Resident Denies
        R->>S: Click "Deny"
        S-->>G: Update Status: "DENIED"
        G->>V: Block Entry
    end
```

---

## 4. 🔄 Sequence Diagram: Bill Payment Flow
Process of paying maintenance bills via Razorpay.

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Razorpay
    participant DB

    User->>Frontend: Click "Pay Now"
    Frontend->>Backend: Create Order Request
    Backend->>Razorpay: Generate Order ID
    Razorpay-->>Backend: Return Order ID
    Backend-->>Frontend: Send Order ID
    
    Frontend->>Razorpay: Open Payment Gateway
    User->>Razorpay: Enter Card/UPI Details
    Razorpay-->>Frontend: Payment Success
    
    Frontend->>Backend: Verify Payment Signature
    Backend->>DB: Update Invoice Status to "PAID"
    Backend->>DB: Log Transaction
    Backend-->>Frontend: Payment Confirmed
    Frontend-->>User: Show Success Receipt
```

---

## 5. 🚦 State Diagram: Complaint Lifecycle
The different states a complaint ticket goes through.

```mermaid
stateDiagram-v2
    [*] --> Pending
    Pending --> InProgress : Admin Assigns Worker
    InProgress --> Resolved : Worker Completes Job
    Resolved --> Closed : Resident Verifies
    Resolved --> Reopened : Resident Unsatisfied
    Reopened --> InProgress
    Closed --> [*]
```

---

## 6. 🚦 State Diagram: Invoice Status
Lifecycle of a monthly maintenance bill.

```mermaid
stateDiagram-v2
    [*] --> Generated
    Generated --> Pending : Bill Issued
    Pending --> Overdue : Due Date Passed
    Pending --> Paid : Full Payment Received
    Overdue --> Paid : Payment + Penalty Received
    Paid --> [*]
```

---

## 7. 🏃 Activity Diagram: Facility Booking
Step-by-step workflow for booking a common amenity (e.g., Clubhouse).

```mermaid
flowchart TD
    Start([User Logs In]) --> Browse[Browse Facilities]
    Browse --> Select[Select Facility & Slot]
    Select --> Check{Slot Available?}
    
    Check -- No --> Error[Show 'Already Booked']
    Error --> Select
    
    Check -- Yes --> Payment{Is Paid Amenity?}
    
    Payment -- Yes --> Gateway[Proceed to Payment]
    Gateway --> Success[Booking Confirmed]
    
    Payment -- No --> Request[Send Request to Admin]
    Request --> AdminCheck{Admin Approval}
    
    AdminCheck -- Approve --> Success
    AdminCheck -- Reject --> End([Booking Cancelled])
    
    Success --> End
```

---

## 8. 🧩 Component Diagram (Architecture)
High-level architectural view of the Nexus OS tech stack.

```mermaid
componentDiagram
    package "Frontend Client" {
        [React App (Vite)]
        [Socket.io Client]
    }
    
    package "Backend Server" {
        [Express API]
        [Socket.io Server]
        [Auth Middleware]
    }
    
    package "Data Layer" {
        [MongoDB Atlas]
        [File Storage (Multer)]
    }
    
    package "External Services" {
        [Razorpay Gateway]
        [Nodemailer (SMTP)]
    }

    [React App (Vite)] --> [Express API] : HTTP/REST
    [React App (Vite)] <..> [Socket.io Server] : WebSocket (Real-time)
    [Express API] --> [MongoDB Atlas] : Mongoose
    [Express API] --> [Razorpay Gateway] : Payments
    [Express API] --> [Nodemailer (SMTP)] : Emails
```

---

## 9. 🏃 Activity Diagram with Swimlanes (Full Workflow)
Divided into Superadmin, Admin, User (Resident), and Main Gate (Guard) roles.

```mermaid
flowchart TD
    %% Define Swimlanes using subgraphs
    subgraph Superadmin
        SA_Start([Start]) --> SA1[Create Society Profile]
        SA1 --> SA2[Review & Approve Admin Account]
    end

    subgraph Admin
        SA2 --> A1[Manage Member Registration]
        A1 --> A2[Generate Monthly Maintenance Bills]
    end

    subgraph User
        U1[Login to Resident Portal] --> U2[Pay Maintenance Bill]
        U2 --> U3[Raise 'Visitor Entry' Request]
    end

    subgraph "Main Gate (Guard)"
        U3 --> G1[Receive Visitor Notification]
        G1 --> G2{Verify with Resident}
        G2 -- Authorized --> G3[Mark Entry Time]
        G3 --> G4[Mark Exit Time]
        G2 -- Denied --> G5[Deny Entry]
        
        G4 --> End([End])
        G5 --> End
    end

    %% Formatting
    style SA_Start fill:#f9f,stroke:#333,stroke-width:2px
    style End fill:#f9f,stroke:#333,stroke-width:2px
    style Superadmin fill:#f5f5f5,stroke:#333,stroke-width:1px
    style Admin fill:#e3f2fd,stroke:#333,stroke-width:1px
    style User fill:#f1f8e9,stroke:#333,stroke-width:1px
    style "Main Gate (Guard)" fill:#fff3e0,stroke:#333,stroke-width:1px
```

---

## 10. 📊 Detailed System Activity Diagram (Comprehensive Workflow)
This diagram provides a deep dive into the business logic across all four major roles.

```mermaid
flowchart TD
    %% Superadmin Workflow
    subgraph "Super Admin (System Owner)"
        SA1([Superadmin Login]) --> SA2[Dashboard: View All Societies]
        SA2 --> SA3{Action?}
        SA3 -- "New Society" --> SA4[Register New Society]
        SA3 -- "Review Admin" --> SA5[Verify Admin Documents]
        SA5 --> SA6{Approve?}
        SA6 -- Yes --> SA7[Activate Admin Account]
        SA6 -- No --> SA8[Reject & Notify]
        SA4 --> SA9[Setup Subscription Plan]
    end

    %% Admin Workflow
    subgraph "Society Admin (Manager)"
        A1([Admin Login]) --> A2[Setup Building Master: Blocks/Flats]
        A2 --> A3[Register Residents/Members]
        A3 --> A4[Configure Maintenance Charges]
        A4 --> A5[Generate Monthly Invoices]
        A5 --> A6[Manage Notice Board]
        A6 --> A7[Monitor Complaints/Helpdesk]
    end

    %% User Workflow
    subgraph "User (Resident)"
        U1([User Login]) --> U2[View Personal Dashboard]
        U2 --> U3{Resident Activity?}
        U3 -- "Payments" --> U4[Check Pending Invoices]
        U4 --> U5[Pay via Razorpay]
        U5 --> U6{Payment Success?}
        U6 -- Yes --> U7[Download Receipt]
        U6 -- No --> U4
        
        U3 -- "Visitor App" --> U8[Create Pre-Approve Visitor Request]
        U8 --> U9[Share QR Code/Entry Pass]
        
        U3 -- "Support" --> U10[Raise Maintenance Complaint]
    end

    %% Main Gate Workflow
    subgraph "Main Gate (Guard)"
        G1([Visitor/Vehicle Arrives]) --> G2{Has Entry Pass/QR?}
        
        G2 -- Yes --> G3[Scan QR Code]
        G3 --> G4[System Validates Request]
        G4 --> G5[Mark Entry Time]
        
        G2 -- No --> G6[Gather Visitor Details & Photo]
        G6 --> G7[Send Real-time Notification to Resident]
        G7 --> G8{Resident Approval?}
        G8 -- Approved --> G5
        G8 -- Denied --> G9[Deny Entry]
        
        G5 --> G10[Monitor Society Premises]
        G10 --> G11[Mark Exit Time]
    end

    %% Global Connections
    SA7 -.-> A1
    A5 -.-> U4
    U9 -.-> G1
    U10 -.-> A7
    G7 -.-> U2

    %% Styles
    style SA1 fill:#d1c4e9,stroke:#512da8
    style A1 fill:#bbdefb,stroke:#1976d2
    style U1 fill:#c8e6c9,stroke:#388e3c
    style G1 fill:#ffecb3,stroke:#ffa000
    style SA7 fill:#81c784,stroke:#388e3c
    style G5 fill:#81c784,stroke:#388e3c
    style G9 fill:#e57373,stroke:#d32f2f
```


