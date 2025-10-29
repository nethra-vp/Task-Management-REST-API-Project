# 📝 Task Management REST API

A simple **Task Management API** built using **Node.js, Express, and JWT Authentication**.

---

## Features
- User registration and login with JWT tokens  
- Secure task creation, update, and deletion (auth required)  
- Retrieve tasks with filters (by status, date)  
- Clean and simple RESTful structure  

---

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|-----------|--------------|----------------|
| POST | `/register` | Register a new user | ❌ |
| POST | `/login` | Login and receive a token | ❌ |
| GET | `/tasks` | Get all tasks | ❌ |
| GET | `/tasks/:id` | Get a specific task | ❌ |
| POST | `/tasks` | Create a new task | ✅ |
| PUT | `/tasks/:id` | Update an existing task | ✅ |
| DELETE | `/tasks/:id` | Delete a task | ✅ |
