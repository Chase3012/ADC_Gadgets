# ADC Gadgets: System Flowchart Documentation
**Author:** ADC Gadgets Development Team  
**System Architecture:** Web Application (HTML5, Vanilla CSS, JavaScript, Node.js/Express, PostgreSQL)  
**Target Roles:** User (Customer Portal) & Administrator (Admin Dashboard)

---

## Executive Summary & Scope

This document provides formal flowcharts and process diagrams for the **ADC Gadgets Management & Customer Portal System**, structured specifically according to academic and system design guidelines.

### Scope Clarification (Important System Rule)
> **Note on Loan Requests:**
> There is **no online loan request or application form** on the customer website. All loan underwriting, credit verification, and contractual agreements are conducted **face-to-face at the branch or through an external partner platform**.
> 
> The Administrator's primary responsibility in the customer module is to **create the customer account** and **directly record/assign the verified device loan** onto the system.
> 
> - **Customer Portal (`src/user/`):** Customers browse products, view authentic Apple Database (AppleDB) hardware specifications, monitor their active loan balance/payment ledger (assigned by admin), and chat with live support.
> - **Admin Portal (`src/admin/`):** Administrators create user accounts, assign verified face-to-face loans, manage device inventory with AppleDB auto-sync, record customer payments in the ledger, handle customer support inquiries, and generate business reports.

---

## 1. High-Level System Architecture Flowchart

This diagram illustrates the separation of concerns between the Customer and Administrator, both interfacing with the centralized PostgreSQL database.

```mermaid
flowchart TB
    subgraph External["External / Face-to-Face Stage"]
        FTF[Customer Visits Branch / Partner Platform] --> AGREE[Face-to-Face Agreement & Credit Check]
    end

    subgraph AdminPortal["ADMIN PORTAL (Management Side)"]
        ALogin([Admin Login]) --> ADash[Admin Dashboard]
        ADash --> AUsers[User & Loan Management]
        ADash --> AInv[Inventory Management with AppleDB]
        ADash --> ALedger[Loan Ledger & Payments]
        ADash --> AComm[Customer Chat Desk]
        ADash --> ARep[Financial & Sales Reports]
        ADash --> AAdmin[Staff Admin Management]

        AGREE -.->|Walk-in Details| AUsers
        AUsers -->|Create Account & Assign Loan| DB[(Central PostgreSQL DB)]
        AInv -->|Stock, Pricing, Status| DB
        ALedger -->|Record Monthly Payments| DB
        AComm <-->|Real-time Inquiries| DB
        ARep <---|Fetch Analytics| DB
    end

    subgraph UserPortal["USER PORTAL (Customer Side)"]
        ULogin([Customer Login]) --> UHome[Customer Home Page]
        UHome --> UCatalog[Browse Devices Catalog]
        UHome --> UAccount[My Account & Loan Ledger]
        UHome --> USupport[Support FAQs & Live Chat]

        UCatalog --> UModal[View AppleDB Studio Specs]
        UAccount --> UTrack[View Remaining Balance & Due Dates]
        USupport <--> UChat[Message Staff in Real-time]

        DB -.->|Credentials Provided| ULogin
        DB --->|Fetch Active Loans & Balances| UAccount
        DB --->|Fetch Devices & Announcements| UHome
        DB <--->|Chat Thread Sync| USupport
    end

    classDef admin fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#fff;
    classDef user fill:#831843,stroke:#f472b6,stroke-width:2px,color:#fff;
    classDef ext fill:#1f2937,stroke:#9ca3af,stroke-width:2px,color:#fff;
    classDef db fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#fff;

    class ALogin,ADash,AUsers,AInv,ALedger,AComm,ARep,AAdmin admin;
    class ULogin,UHome,UCatalog,UAccount,USupport,UModal,UTrack,UCHat user;
    class FTF,AGREE ext;
    class DB db;
```

---

## 2. User Portal (Customer Side) Flowchart

The User Portal flowchart illustrates the end-to-end journey of a customer accessing their portal.

```mermaid
flowchart TD
    StartUser([Customer Starts]) --> VisitSite[Visit ADC Gadgets Website]
    VisitSite --> IsAuth{Logged In?}
    
    IsAuth -- No --> LoginPage[Navigate to login.html]
    LoginPage --> AuthChoice{Action}
    AuthChoice -- Sign In --> EnterCreds[Enter Email & Password]
    AuthChoice -- Forgot Pass --> ForgotPass[Request Password Reset Link]
    ForgotPass --> EnterCreds
    
    EnterCreds --> ValidateAuth{Credentials Valid?}
    ValidateAuth -- No --> AuthErr[Show Error: Invalid Credentials]
    AuthErr --> LoginPage
    ValidateAuth -- Yes --> GenSession[Generate Session & Store Token]
    GenSession --> Home[user-home.html]
    IsAuth -- Yes --> Home

    Home --> UserAction{Select Menu Navigation}

    %% Option A: Browse Catalog
    UserAction -- Browse Catalog --> Catalog[devices.html]
    Catalog --> FilterTab{Select Tab}
    FilterTab -- Available --> ShowAvail[Render In-Stock iPhones]
    FilterTab -- Upcoming --> ShowUpcom[Render Coming Soon iPhones]
    ShowAvail --> SearchDevice[Search by Model Name]
    ShowUpcom --> SearchDevice
    SearchDevice --> ClickCard[Click Device Card]
    ClickCard --> ViewModal[Open Product Specs Modal]
    ViewModal --> InspectSpecs[Inspect AppleDB Specs & Monthly SRP]
    InspectSpecs --> CloseModal[Close Modal or Inquire via Chat]
    CloseModal --> Home

    %% Option B: Account & Loan Ledger
    UserAction -- My Account --> AccountPage[account.html]
    AccountPage --> LoadLoans[Query Assigned Loans from DB]
    LoadLoans --> HasLoan{Has Active Loan?}
    HasLoan -- Yes --> DispLoan[Display Assigned Device, Total SRP, Paid Amount, Remaining Balance, Next Due Date]
    HasLoan -- No --> DispEmpty[Display: No Active Loans Assigned]
    DispLoan --> ViewSchedule[Inspect Monthly Amortization Schedule]
    ViewSchedule --> AccountPage
    AccountPage --> SecuritySettings[Change Password / Update Profile]
    AccountPage --> LogoutAction[Click Logout]
    LogoutAction --> ClearSession[Clear Local Storage & Session]
    ClearSession --> LoginPage

    %% Option C: Support & Live Chat
    UserAction -- Customer Support --> SupportPage[support.html / Chat Widget]
    SupportPage --> ReadFAQs[Browse Frequently Asked Questions]
    SupportPage --> OpenChat[Open Live Chat Widget]
    OpenChat --> SendMsg[Send Message or Payment Query to Admin]
    SendMsg --> WaitStaff[Wait for Staff Real-Time Response]
    WaitStaff --> ReceiveReply[Receive Notification & Staff Advice]
    ReceiveReply --> SupportPage
```

### Detailed Breakdown of User Pages

| Page File | Page Title | Primary Functional Role |
| :--- | :--- | :--- |
| `src/user/login.html` | User Login & Authentication | Authenticates customer credentials; initiates user session. |
| `src/user/user-home.html` | Customer Homepage | Showcases featured gadgets, latest announcements ticker, and quick navigation. |
| `src/user/devices.html` | Device Catalog & Search | Real-time search and filtering for in-stock and upcoming iPhone models; launches detailed AppleDB specs modal. |
| `src/user/account.html` | Customer Account & Ledger | Displays borrower profile, assigned device loans, remaining balance, amortization payment ledger, and logout. |
| `src/user/support.html` | Support FAQs & Live Chat | Provides store guidelines, branch info, payment channels, and live messaging with staff. |

---

## 3. Admin Portal (Management Side) Flowchart

The Admin Portal flowchart details administrative operations: customer account provisioning, inventory control, payment recording, live customer messaging, and financial reporting.

```mermaid
flowchart TD
    StartAdmin([Administrator Starts]) --> AdminLogin[admin/login.html]
    AdminLogin --> EnterAdminCreds[Enter Admin Email & Password]
    EnterAdminCreds --> CheckAdminAuth{Role & Credentials Valid?}
    
    CheckAdminAuth -- No --> AdminDenied[Display Access Denied]
    AdminDenied --> AdminLogin
    CheckAdminAuth -- Yes --> AdminDash[admin/dashboard.html]

    AdminDash --> ViewKPIs[Inspect KPIs: Total Revenue, Active Loans, Overdue Accounts, Low Stock]
    AdminDash --> AdminMenu{Select Admin Module}

    %% Module 1: User & Loan Provisioning
    AdminMenu -- User & Loan Management --> UserLoanModule[admin/manage-users.html & user-loan.html]
    UserLoanModule --> UserActionChoice{Customer Workflow}
    
    UserActionChoice -- Create User & Assign Loan --> EnterCustomerDetails[Input Customer Name, Email, Phone, Address]
    EnterCustomerDetails --> SelectPhoneModel[Select In-Stock Device from Inventory]
    SelectPhoneModel --> SetLoanTerms[Set SRP, Downpayment & Term: 6, 12, or 24 Mos]
    SetLoanTerms --> CalcAmort[System Computes Monthly Amortization & Due Dates]
    CalcAmort --> SaveCustomerLoan[Commit to DB: User Account + Active Loan Record]
    SaveCustomerLoan --> NotifyClient[Provide Generated Credentials to Customer]
    
    UserActionChoice -- View Customers --> ListClients[Filter & Search Existing Borrowers]
    ListClients --> EditCustomer[Update Contact Info / Status]

    %% Module 2: Inventory Management
    AdminMenu -- Inventory Management --> InvModule[admin/inventory.html]
    InvModule --> InvAction{Inventory Task}
    
    InvAction -- Add Device via AppleDB --> SearchADB[Type iPhone Model in AppleDB Search]
    SearchADB --> AutoPopulate[Auto-Fill Identifier, Soc Chip, Colors, Official Studio Render]
    AutoPopulate --> SetPricingStock[Enter SRP, Monthly Factor, Initial Stock, Status]
    SetPricingStock --> SaveDevice[Insert New Device into DB]
    
    InvAction -- Update Stock / Price --> SelectDeviceRow[Locate Device Row in Inventory Table]
    SelectDeviceRow --> OpenEditModal[Edit Stock Quantity, Status or Price]
    OpenEditModal --> SaveEdit[Update Database]
    
    InvAction -- Remove Discontinued --> DeletePrompt[Confirm Delete Device]
    DeletePrompt --> RemoveDevice[Delete / Archive Device]

    %% Module 3: Loan Ledger & Payments
    AdminMenu -- Loan Ledger & Collections --> LedgerModule[admin/loan-ledger.html]
    LedgerModule --> FindCustomerAccount[Search Customer by Name, Email, or Loan ID]
    FindCustomerAccount --> OpenPaymentModal[Click 'Record Payment']
    OpenPaymentModal --> InputPayment[Enter Amount Paid, Payment Date, Method: Cash/GCash/Bank]
    InputPayment --> ProcessLedger[System Deducts from Remaining Balance & Updates Due Date]
    ProcessLedger --> GenReceipt[Generate Official Payment Ledger Entry]

    %% Module 4: Live Customer Support
    AdminMenu -- Customer Communication --> CommModule[admin/communication.html]
    CommModule --> CheckInbox[View Active Chat Threads]
    CheckInbox --> SelectConversation[Select Customer Conversation]
    SelectConversation --> ReadUserInquiry[Read Inquiry: Product Stock, Payment Confirmation]
    ReadUserInquiry --> SendStaffReply[Type & Send Staff Reply]

    %% Module 5: Financial Reports
    AdminMenu -- Business Reports --> ReportsModule[admin/reports.html]
    ReportsModule --> SelectReportRange[Select Date Range & Report Category]
    SelectReportRange --> RenderCharts[Generate Revenue, Loan Disbursements, and Inventory Turnover]
    RenderCharts --> ExportReport[Export Report to CSV or PDF]

    %% Module 6: Admin Staff Management
    AdminMenu -- Admin Staff Control --> AdminMgtModule[admin/manage-admins.html]
    AdminMgtModule --> ManageStaff[Create New Staff Account or Revoke Access]
```

### Detailed Breakdown of Admin Pages

| Page File | Page Title | Primary Functional Role |
| :--- | :--- | :--- |
| `src/admin/login.html` | Administrator Login | Authenticates administrator credentials and grants administrative role session. |
| `src/admin/dashboard.html` | Executive Dashboard | Overview of operational health: gross collections, active loans, low inventory alerts, and quick actions. |
| `src/admin/manage-users.html` & `user-loan.html` | User & Loan Provisioning | Form to create customer accounts and directly bind verified face-to-face device loan contracts. |
| `src/admin/inventory.html` | Inventory & AppleDB Control | Catalog management integrated with AppleDB for real-time specification auto-population, stock count, and status toggles. |
| `src/admin/loan-ledger.html` | Loan Ledger & Payment Tracking | Recording borrower monthly installments; updates balance, payment dates, and payment channel tracking. |
| `src/admin/communication.html` | Live Customer Support Desk | Centralized customer messaging desk to reply to live customer queries. |
| `src/admin/reports.html` | Financial & Business Analytics | Revenue metrics, collection efficiency, loan duration breakdown, and inventory analytics. |
| `src/admin/manage-admins.html` | Administrator Access Control | Manages staff accounts, security permissions, and system administration roles. |

---

## 4. Specific Process Flowcharts

### Sub-Flow A: Customer Account Creation & Direct Loan Assignment (Face-to-Face Agreement)

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer
    actor Admin as Admin Staff
    participant System as Admin Portal (manage-users.html)
    participant Database as PostgreSQL DB
    participant UserPortal as User Portal (account.html)

    Customer->>Admin: Completes physical loan agreement at branch / external platform
    Customer->>Admin: Submits physical documents (Valid ID, Proof of Income)
    Admin->>System: Opens 'Create User & Assign Loan' Modal
    Admin->>System: Enters Full Name, Email, Contact, Address
    Admin->>System: Selects iPhone Model & Sets Terms (e.g., 24 Months, SRP, Downpayment)
    System->>System: Calculates Monthly Amortization & Schedule
    Admin->>System: Clicks 'Submit Account & Loan'
    System->>Database: INSERT into users table (Credentials & Profile)
    System->>Database: INSERT into loans table (Device, Principal, Monthly, Balance)
    System->>Database: UPDATE devices table (Deduct 1 from Stock)
    Database-->>System: Confirmation Success
    System-->>Admin: Displays Generated User Credentials
    Admin->>Customer: Hands over device & provides login credentials
    Customer->>UserPortal: Customer logs in to view active loan balance & schedule
```

---

### Sub-Flow B: Payment Collection & Ledger Update Process

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer
    actor Admin as Admin Cashier
    participant Ledger as Loan Ledger (loan-ledger.html)
    participant Database as PostgreSQL DB
    participant CustomerView as Customer Portal (account.html)

    Customer->>Admin: Pays Monthly Installment (Cash, GCash, or Bank Transfer)
    Admin->>Ledger: Searches Customer Name or Loan Account #
    Ledger-->>Admin: Displays Outstanding Balance & Next Due Date
    Admin->>Ledger: Clicks 'Record Payment' & enters Amount Paid + Payment Mode
    Admin->>Ledger: Confirms Transaction
    Ledger->>Database: INSERT into payments table (Amount, Mode, Timestamp)
    Ledger->>Database: UPDATE loans table (Reduce remaining_balance, Advance due_date)
    Database-->>Ledger: Transaction Saved
    Ledger-->>Admin: Generates Updated Ledger Receipt
    Admin->>Customer: Issues Official Acknowledgment Receipt
    Customer->>CustomerView: Refreshes account.html to see updated paid balance immediately
```

---

### Sub-Flow C: AppleDB Inventory Management Process

```mermaid
flowchart TD
    A([Admin in inventory.html]) --> B[Click 'Add Device']
    B --> C[Type Model Name in AppleDB Search e.g. iPhone 17]
    C --> D{Model Found in AppleDB?}
    D -- Yes --> E[Auto-Fetch: AppleDB Identifier, A-Series SoC, Colors, Official Studio Render]
    D -- No --> F[Manually Enter Specifications & Upload Custom Image]
    E --> G[Enter Unit SRP & Stock Count]
    F --> G
    G --> H[Select Availability Status: Available vs Upcoming]
    H --> I[Click 'Save Device']
    I --> J[Write Record to PostgreSQL Database]
    J --> K[Automatic Notification: Announcement Created if Upcoming or New Arrival]
    K --> L([Product Instantly Visible in User Catalog])
```

---

### Sub-Flow D: Real-Time Customer Support Chat Process

```mermaid
flowchart LR
    subgraph CustomerSide["Customer (support.html)"]
        U1[Open Live Chat Widget] --> U2[Type Question e.g. Color Availability]
        U2 --> U3[Send Message]
        U4[Receive Staff Response] <--- U5[Notification Ding & Bubble]
    end

    subgraph ServerSide["Backend Server"]
        U3 --> S1[Express / WebSocket Handler]
        S1 --> S2[(Save to messages DB)]
        S2 --> S3[Broadcast to Admin Session]
        A2 --> S4[Save Staff Reply to DB]
        S4 --> S5[Push to Customer Session]
        S5 --> U4
    end

    subgraph AdminSide["Admin (communication.html)"]
        S3 --> A1[Customer Thread Highlights Red / Badge]
        A1 --> A2[Admin Types Guidance / Store Info & Clicks Send]
    end
```

---

## 5. Summary of System Roles & Permissions Matrix

| Feature / Module | Customer (User Portal) | Administrator (Admin Portal) |
| :--- | :---: | :---: |
| **Browse Device Catalog with AppleDB Renders** | Read-Only | Full Control (Add, Edit, Stock, Delete) |
| **View Device Specifications (SoC, Camera, Display)** | Read-Only | Auto-Populate & Edit |
| **Account Creation** | Login to assigned account | Direct Creation & Role Assignment |
| **Device Loan Registration** | View Assigned Loan Only | Direct Binding from Face-to-Face Agreement |
| **Payment Ledger** | View Personal Ledger & Balance | Record Payments, Manage Ledger Entries |
| **Live Support Chat** | Send Inquiries to Staff | View Unified Inbox & Reply to All Clients |
| **Business Analytics & Financial Reports** | No Access | Full View, Filter, and Export (CSV/PDF) |
| **Admin Staff Accounts** | No Access | Super Admin Management |

---
*End of Documentation. Generated for academic submission and system architecture review.*
