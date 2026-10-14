# E-Commerce Order & Inventory Management System

A full-stack e-commerce application built using **Java, Spring Boot, React, and MySQL**. The application supports product browsing, shopping cart management, checkout, order processing, order tracking, and inventory management.

## Screenshots

### 1. Authentication
![Authentication](frontend/public/images/authentication.png)

### 2. Home Page
![Home Page](frontend/public/images/homepage.png)

### 3. Product Listing
![Product Listing](frontend/public/images/product-listing.png)

### 4. Product Details
![Product Details](frontend/public/images/product-details.png)

### 5. Checkout
![Checkout](frontend/public/images/checkout.png)

### 6. Order Confirmation
![Order Confirmation](frontend/public/images/order-confirmation.png)

### 7. Order Details
![Order Details](frontend/public/images/order-details.png)

### 8. Order Tracking
![Order Tracking](frontend/public/images/order-tracking.png)

## Key Features

- **Authentication:** User registration and login functionality.
- **Product Browsing:** View available products and product details.
- **Shopping Cart:** Add, remove, and manage selected products.
- **Checkout:** Submit orders through the checkout workflow.
- **Order Management:** View order confirmations and order details.
- **Order Tracking:** Check order status.
- **Inventory Management:** Manage product stock through the implemented inventory functionality.

## Technology Stack

| Technology | Purpose |
|---|---|
| Java | Backend programming |
| Spring Boot | REST APIs and business logic |
| React | Frontend user interface |
| MySQL | Relational database |
| Maven | Backend dependency management and build |

## System Architecture

```text
User
  |
  v
React Frontend
  |
  | HTTP Requests
  v
Spring Boot REST APIs
  |
  | Database Operations
  v
MySQL Database
```

- **Presentation Layer:** React handles the user interface and interactions.
- **Application Layer:** Spring Boot processes requests and business logic.
- **Data Layer:** MySQL stores application data.

## Project Structure

## Project Structure

```text
ecommerce-order-inventory/
├── backend/
│   ├── src/
│   ├── pom.xml
│   └── mvnw.cmd
├── ecommerce-frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   └── public/
│       └── images/
├── .gitignore
└── README.md
```

- **Backend:** Java, Spring Boot, REST APIs, JPA, and MySQL integration.
- **Frontend:** React application and user interface.
- **Images:** Existing public image assets under `frontend/public/images/`.

*Adjust the directory structure to match your actual project.*

## Prerequisites

- Java JDK compatible with the backend.
- Node.js and npm.
- MySQL Server.
- Git (optional).

## Installation and Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd ecommerce-order-inventory
```

### 2. Configure the Database

Create the database in MySQL if the name matches your backend configuration.

```sql
CREATE DATABASE ecommerce_db;
```

Configure the database URL, username, and password in the backend application configuration. Ensure that MySQL is running.

### 3. Start the Backend

Open a terminal in the backend directory containing `mvnw.cmd`.

```powershell
.\mvnw.cmd spring-boot:run
```

If the backend uses port `8080`, its base URL is:

`http://localhost:8080`

### 4. Start the Frontend

Open a separate terminal in the frontend directory containing `package.json`.

```bash
npm install
npm run dev
```

Open the local frontend URL displayed in the terminal. Ensure the frontend API configuration points to the running backend.

## API Testing

Use Postman or a similar API client to test the REST endpoints defined by the backend controllers.

Verify request methods, endpoint paths, request bodies, response formats, and authentication requirements against the actual implementation.

## Future Enhancements

- **Payment Gateway Integration:** Enable secure online payments and transaction verification.
- **Advanced Inventory Management:** Add low-stock alerts, automatic stock updates, and inventory movement history.
- **Admin Dashboard:** Enable administrators to manage products, categories, users, orders, and inventory.
- **Email Notifications:** Send order confirmations, payment updates, and shipping notifications.
- **Order Cancellation and Returns:** Support cancellation requests, product returns, and refund processing.
- **Performance Optimization:** Introduce Redis caching and optimize database queries.
- **Deployment and CI/CD:** Deploy the application to a cloud platform and automate testing and deployment.

## Author

**Motakatla Leela Vardhini**

B.Tech — Computer Science and Engineering
