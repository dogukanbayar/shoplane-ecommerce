# ShopLane - Full-Stack E-Commerce Platform

<p align="center">
  A modern e-commerce application built with React, Node.js, Express and MongoDB.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19">
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white" alt="Node.js 18+">
  <img src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white" alt="Express 5">
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white" alt="Vite 7">
</p>

## Overview

ShopLane is a production-oriented full-stack e-commerce platform designed to cover the
complete customer journey: discovering products, managing a cart, checking out,
tracking orders and interacting with customer support.

The project also includes an administrative experience for managing products, users
and orders. The codebase is organized as separate frontend and backend applications,
with a REST API, JWT authentication, MongoDB persistence and real-time capabilities.

## Highlights

- Product catalog with search, categories, product details and recommendations
- JWT-based authentication, protected routes and user profiles
- Shopping cart, favorites, addresses and order management
- Multi-step checkout with Iyzico payment integration
- Product reviews, ratings and pre-order support
- Admin dashboard for products, users, orders and analytics
- Real-time chat and notifications with Socket.IO
- Loyalty, gamification, experiments and customer journey tracking
- Responsive UI, dark mode, lazy loading and code splitting
- Security middleware including Helmet, CORS, rate limiting and validation

## Screenshots

<p align="center">
  <img src="./docs/screenshots/resim1.png" alt="ShopLane screen 1" width="420" />
  <img src="./docs/screenshots/resim2.png" alt="ShopLane screen 2" width="420" />
</p>

<p align="center">
  <img src="./docs/screenshots/resim3.png" alt="ShopLane screen 3" width="420" />
  <img src="./docs/screenshots/resim4.png" alt="ShopLane screen 4" width="420" />
</p>

<p align="center">
  <img src="./docs/screenshots/resim5.png" alt="ShopLane screen 5" width="420" />
  <img src="./docs/screenshots/resim6.png" alt="ShopLane screen 6" width="420" />
</p>

<p align="center">
  <img src="./docs/screenshots/resim7.png" alt="ShopLane screen 7" width="420" />
  <img src="./docs/screenshots/resim8.png" alt="ShopLane screen 8" width="420" />
</p>

<p align="center">
  <img src="./docs/screenshots/resim9.png" alt="ShopLane screen 9" width="420" />
  <img src="./docs/screenshots/resim10.png" alt="ShopLane screen 10" width="420" />
</p>

<p align="center">
  <img src="./docs/screenshots/resim11.png" alt="ShopLane screen 11" width="420" />
  <img src="./docs/screenshots/resim12.png" alt="ShopLane screen 12" width="420" />
</p>

<p align="center">
  <img src="./docs/screenshots/resim13.png" alt="ShopLane screen 13" width="420" />
  <img src="./docs/screenshots/resim14.png" alt="ShopLane screen 14" width="420" />
</p>

## Tech Stack

### Frontend

- React 19 and React Router
- Vite
- Zustand for client state
- Tailwind CSS, Framer Motion and AOS
- Axios for API communication
- Recharts for analytics
- React Three Fiber and Three.js for interactive visuals

### Backend

- Node.js and Express 5
- MongoDB with Mongoose
- JWT and HTTP-only cookies for authentication
- Socket.IO for real-time communication
- Iyzico payment integration
- Nodemailer and Handlebars email templates
- Helmet, CORS, HPP and express-rate-limit

### Quality and delivery

- Jest and Supertest for backend tests
- Vitest and Testing Library for frontend tests
- ESLint
- Docker Compose
- Vercel/Render-ready deployment configuration

## Architecture

```mermaid
flowchart LR
    Browser[React + Vite frontend] -->|REST /api| API[Express API]
    Browser <-->|WebSocket| Socket[Socket.IO]
    API --> DB[(MongoDB)]
    API --> Payment[Iyzico]
    API --> Mail[Nodemailer]