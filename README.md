# 🎭 Cocha Vive - Frontend

**Cocha Vive** is an interactive platform designed for the management and promotion of cultural events in Cochabamba. This repository contains the client-side code (Frontend) built with the latest Angular standards.

---

## 🚀 Key Technologies

* **Framework:** [Angular 21](https://angular.dev/) (Utilizing Standalone Components and the new Control Flow syntax).
* **Runtime Environment:** [Node.js v22.13.1](https://nodejs.org/).
* **Styling:** Bootstrap 5 & [AOS (Animate On Scroll)](https://michalsnik.github.io/aos/) for smooth UI transitions.
* **Icons:** Bootstrap Icons.

---

## 🛠️ Prerequisites

Ensure you have the following installed before starting:

* **Node.js:** Version 22.x or higher.
* **Angular CLI:** Version 21.x or higher (`npm install -g @angular/cli`).
* **Backend Support:** This frontend consumes an API built with **Spring Boot (Java 25)** and **PostgreSQL**.

---

## 📦 Installation & Setup

1. **Clone the repository:**
```bash
git clone https://github.com/your-username/cocha-vive-front.git
cd cocha-vive-front

```


2. **Install dependencies:**
```bash
npm install

```


3. **Environment Configuration:**
Ensure the API endpoint is correctly configured in your environment files to point to the Spring Boot backend.

---

## 💻 Development Server

Run the following command to start the development server:

```bash
ng serve

```

Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

---

## 📂 Project Structure

* `src/app/`: Core application logic, including Standalone Components, Services, and Models.
* `public/`: Static assets such as images and icons.
* `angular.json`: Angular workspace configuration.
* `README.md`: Project documentation (this file).

---

## 📝 Recent Refactors & Features

* **Angular Control Flow:** Migrated from structural directives (`*ngIf`, `*ngFor`) to modern syntax (`@if`, `@for`, `@empty`) for optimized performance and cleaner code.
* **Standalone Architecture:** Fully modular design without `AppModule` overhead.
* **Responsive UI:** Fully adapted for mobile and desktop views using modern CSS variables and Bootstrap.

---
