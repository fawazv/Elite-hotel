# Elite-Hotel Management System

![Elite Hotel Banner](https://via.placeholder.com/1200x300?text=Elite+Hotel+Management+System)

## 🏨 Project Title & High-Level Summary
**Elite-Hotel** is a production-grade, full-stack hotel management platform built using a **Microservices Architecture**. It provides a comprehensive solution for managing hotel operations, including guest reservations, room inventory, housekeeping assignments, billing, and real-time communication.

Designed for scalability and maintainability, the system decouples core domains into independent services that communicate asynchronously via **RabbitMQ** and synchronously via an **API Gateway**. The frontend delivers a premium user experience with **React 19**, **Three.js** visualizations, and a responsive **Tailwind CSS** design.

## 🏗️ Architecture Overview

The application follows a distributed microservices pattern. A central **API Gateway** acts as the single entry point for all client requests, routing them to the appropriate backend service. Services share data and events asynchronously using a message broker.

### Microservices Pattern
- **Database-per-Service**: Each service manages its own data to ensure loose coupling.
- **API Gateway Pattern**: Handles routing, rate limiting, and security headers.
- **Event-Driven Architecture**: Uses RabbitMQ for inter-service communication (e.g., "Reservation Created" event triggers "Notification Service").

### System Architecture Diagram

```mermaid
graph TD
    Client["Client Application (React/Vite)"] -->|HTTP/REST| Gateway["API Gateway (Express)"]
    
    subgraph "Backend Infrastructure"
        Gateway -->|/api/auth| Auth[Auth Service]
        Gateway -->|/api/users| User[User Service]
        Gateway -->|/api/rooms| Room[Room Service]
        Gateway -->|/api/guests| Guest[Guest Service]
        Gateway -->|/api/reservations| Reserve[Reservation Service]
        Gateway -->|/api/payments| Pay[Payment Service]
        Gateway -->|/api/billing| Bill[Billing Service]
        Gateway -->|/api/housekeeping| House[Housekeeping Service]
        Gateway -->|/api/communication| Comm[Communication Service]
        Gateway -->|/api/notifications| Notif[Notification Service]
        
        Auth & User & Room & Guest & Reserve & Pay & Bill & House & Comm & Notif <-->|Events/AMQP| MQ[RabbitMQ Message Broker]
    end

    subgraph "Data Layer"
        Auth <--> DB1[("Auth DB")]
        User <--> DB2[("User DB")]
        Room <--> DB3[("Room DB")]
        Guest <--> DB4[("Guest DB")]
        Reserve <--> DB5[("Reservation DB")]
        Pay <--> DB6[("Payment DB")]
        Bill <--> DB7[("Billing DB")]
        House <--> DB8[("Housekeeping DB")]
        Comm <--> DB9[("Communication DB")]
        Notif <--> DB10[("Notification DB")]
    end

    classDef service fill:#f9f,stroke:#333,stroke-width:2px;
    classDef infra fill:#dfd,stroke:#333,stroke-width:2px;
    class Auth,User,Room,Guest,Reserve,Pay,Bill,House,Comm,Notif service;
    class MQ,Gateway infra;
```


## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Language**: TypeScript
- **State Management**: Redux Toolkit, Redux Persist
- **Server State**: TanStack Query (React Query)
- **Styling**: Tailwind CSS 4, Radix UI Primitives, Lucide Icons
- **Graphics/3D**: Three.js, React Three Fiber, React Three Drei, Spline
- **Forms**: React Hook Form, Zod
- **Real-time**: Socket.io-client

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Gateway**: `http-proxy-middleware`, `express-rate-limit`
- **Security**: Helmet, CORS, JSON Web Tokens (JWT)
- **Communication**: RabbitMQ (Message Broker)

### Databases & Tools
- **Database**: MongoDB (Mongoose ODM)
- **DevOps**: Docker, Docker Compose
- **Linting**: ESLint, Prettier

## 🚀 Key Features

### General Features
- **Role-Based Access Control (RBAC)**: secure access for Guests, Staff, and Admins.
- **Real-Time Notifications**: Instant updates via email and push notifications.
- **Interactive Dashboards**: Data visualization using Recharts.
- **3D Room Previews**: Immersive room exploration using Three.js.

### Service-Specific Features

| Service | Responsibility | Key Features |
| :--- | :--- | :--- |
| **Auth Service** | Authentication & Security | Login, Register, OTP Verification, Failed Login Tracking, Security Settings. |
| **User Service** | User Management | Profile Management, Global System Settings, User Data Backups, Analytics. |
| **Room Service** | Inventory Management | Room CRUD, Room Type Management, Availability Checking, Room Analytics. |
| **Reservation Service** | Booking Engine | Reservation Lifecycle (Book, Cancel, Check-in/out), User Booking History. |
| **Guest Service** | Guest Profiles | Guest Identity Management, specialized Guest History and Preferences. |
| **Payment Service** | Transaction Processing | Stripe Integration, Payment Intent Management, Webhook Handling. |
| **Billing Service** | Invoicing | Invoice Generation, Dispute Management, Financial Reporting. |
| **Housekeeping Service** | Operations | Cleaning Schedules, Staff Assignment, Room Status Updates (Clean/Dirty). |
| **Communication Service** | Engagement | Real-time Video Chat, AI Chatbot integration, Message History. |
| **Notification Service** | Alerts | Centralized notification handling (Email, SMS, System alerts) via event consumption. |

## 💻 Getting Started / Installation

### Prerequisites
- **Node.js**: v18+
- **Docker**: Desktop installed and running
- **RabbitMQ**: (Handled via Docker)

### Option 1: Docker (Recommended)
This runs the entire stack (Gateway, All Services, RabbitMQ) in containers.

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/elite-hotel.git
    cd elite-hotel
    ```

2.  **Environment Setup**
    Ensure all `.env` files are present in `backend/services/*/.env`. (See Environment Configuration below).

3.  **Run with Docker Compose**
    ```bash
    docker-compose up --build
    ```
    *This creates containers for RabbitMQ (`5672`), API Gateway (`4000`), and all microservices.*

4.  **Access the Application**
    - Application/API Gateway: `http://localhost:4000`
    - Frontend: Start the frontend locally (see below).

### Option 2: Manual Installation (Local Dev)
If you want to run services individually without Docker (except RabbitMQ, which is best run via Docker).

1.  **Start RabbitMQ**
    ```bash
    docker run -d --hostname my-rabbit --name elite-rabbit -p 15672:15672 -p 5672:5672 rabbitmq:3-management
    ```

2.  **Install & Start API Gateway**
    ```bash
    cd backend/api-gateway
    npm install
    npm run dev
    ```

3.  **Install & Start a Service (e.g., Auth)**
    ```bash
    cd backend/services/authService
    npm install
    npm run dev
    ```
    *Repeat for other services.*

4.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    *Frontend will run on port `5173`.*

## ⚙️ Environment Configuration

Each service requires a `.env` file in its root directory (`backend/services/<service-name>/.env`).

### Common Variables
| Variable | Description | Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Service Port | `4001` (Auth), `4002` (User), etc. |
| `MONGO_URI` | MongoDB Connection String | `mongodb+srv://user:pass@cluster...` |
| `RABBITMQ` | RabbitMQ Connection URL | `amqp://localhost:5672` (Local) or `amqp://rabbitmq` (Docker) |
| `ACCESS_TOKEN_SECRET` | JWT Signing Key | `your_secure_secret` |
| `REFRESH_TOKEN_SECRET` | JWT Refresh Key | `your_refresh_secret` |

### Specific Service Variables
- **API Gateway**: `AUTH_API_BASE_URL`, `USER_API_BASE_URL` (Points to service URLs).
- **Payment Service**: `STRIPE_SECRET_KEY`.
- **Auth Service**: `NODEMAILER_EMAIL`, `NODEMAILER_PASSKEY`.

## 📡 API Documentation

All API requests are routed through the API Gateway at `http://localhost:4000`.

**Base URL**: `/api`

| Endpoint | Target Service | Description |
| :--- | :--- | :--- |
| `/api/auth` | Auth Service | Login, Verify OTP, Refresh Token |
| `/api/users` | User Service | Get Profile, Update Settings |
| `/api/rooms` | Room Service | Browse Rooms, Check Availability |
| `/api/reservations` | Reservation Service | Create Booking, Cancel Booking |
| `/api/payments` | Payment Service | Process Transaction |
| `/api/housekeeping` | Housekeeping Service | Assign Task, Update Status |
| `/api/communication` | Communication Service | Start Video Chat, Chatbot |

*(Note: Swagger documentation is currently in progress. Please refer to `backend/services/<service>/src/routes` for exact payloads.)*

## 📂 Folder Structure

```text
Elite-Hotel/
├── docker-compose.yml          # Orchestration for all services
├── frontend/                   # React Client Application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── services/           # API integration
│   │   └── store/              # Redux slices
├── backend/
│   ├── api-gateway/            # Central Entry Point (Express Proxy)
│   └── services/               # Microservices
│       ├── authService/        # Authentication Logic
│       ├── billingService/     # Invoicing & Disputes
│       ├── communicationService/ # Video & Chat
│       ├── guestService/       # Guest Management
│       ├── houseKeepingService/# Cleaning Operations
│       ├── notificationService/# Email & SMS
│       ├── paymentService/     # Stripe Integration
│       ├── reservationService/ # Booking Management
│       ├── roomService/        # Room Inventory
│       └── userService/        # User Accounts
```

## 🤝 Contributing

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the ISC License.
