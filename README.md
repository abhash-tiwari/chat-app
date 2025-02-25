
# Chat-App Fullstack Assignment (Team Pumpkin)

## Introduction

A secure and direct peer-to-peer chat application that enables users to communicate without storing messages on a central server.





## Features

- User Authentication: Secure signup and login using email and mobile number
- Direct Messaging: Search and connect with other users via email or mobile number
- Peer-to-Peer Connection: Direct communication between clients without central server storage
- Message Persistence: Store messages locally when recipient is offline and deliver when they reconnect
- Online Status Tracking: Real-time online/offline status indicators
- Secure Communication: End-to-end encrypted messages for privacy
- Responsive Design: Follows the exact design specifications from Figma


## Tech Stack

**Frontend:** React.js, React Router, CSS Modules

**Backend:** Node.js, Express.js, Multer

**Database:** MongoDB, Mongoose

**Network Communication:** WebRTC for direct P2P connections, with Socket.io for signaling
## Installation and Setup

### Prerequisites

Node.js (v16.0.0 or higher)

npm (v8.0.0 or higher)

Modern web browser with WebRTC support (Chrome, Firefox, Edge, Safari)

#### Steps
Clone the Repository
```bash
$ git clone https://github.com/abhash-tiwari/chat-app
```
    
Setup Backend
```bash
$ cd backend
$ npm install
$ touch .env  # Add environment variables
$ npm start   # Starts the backend server
```
    
Setup Frontend
```bash
$ cd frontend
$ npm install
$ npm run dev  # Runs the React Vite frontend
```
    
    
##  Architecture

The application follows a hybrid architecture combining client-server and peer-to-peer models:

- Authentication Server: Handles user registration, authentication, and discovery
- Signaling Server: Facilitates WebRTC connection establishment between peers
- P2P Connections: Direct WebRTC data channels between clients for message exchange
- Local Storage: IndexedDB for storing offline messages
## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`PORT`
`MONGODB_URI`
`JWT_SECRET`
`FRONTEND_URL`


## Api Reference

### Authentication Endpoints

- POST /api/auth/register - Register a new user
- POST /api/auth/login - Authenticate a user
- GET /api/users/search - Search for users by email/mobile

### Message Endpoints

- POST /api/messages - Send a new message to another user
- GET /api/messages/:userId/:otherUserId - Retrieve conversation history between two users
- PUT /api/messages/:messageId/deliver - Mark a message as delivered when recipient comes online

### Connection Endpoints

- GET /api/users/status - Get online status of users
- POST /api/signal - Establish P2P connections

## Live URL

https://chat-app-sage-beta-85.vercel.app/

