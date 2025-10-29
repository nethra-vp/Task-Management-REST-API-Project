import express from 'express'
import jwt from "jsonwebtoken"

const app = express()
app.use(express.json())

const PORT = 5001
const SECRET = "secretkey"

app.listen(PORT, () => {console.log(`Server running on port ${PORT}`)})

// Registered Users
let users = [];

// Register new user
app.post("/register", (req, res) => {
    const {username, password} = req.body;
    if (!username || !password) {
        return res.status(400).json({message: "Username and password are required"});
    }

    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
        return res.status(400).json({message: "Username already exists"});
    }

    users.push({username, password });
    res.status(201).json({message: "User registered successfully"});
});

// Login and get token
app.post("/login", (req, res) => {
    const {username, password} = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        return res.status(401).json({message: "Invalid username or password"});
    }

    const token = jwt.sign({username}, SECRET, {expiresIn: "1h"});
    res.json({message: "Login successful", token});
});

// Middleware to check token
function auth(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({message: "Access denied. No token provided."});
    }

    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({message: "Invalid or expired token"});
    }
}

// Predefined Tasks
let tasks = [
    {
        id: 1,
        title: "Go grocery shopping",
        description: "Purchase milk, bread, eggs, fruits and vegetables",
        status: "pending",
        createdAt: new Date()
    },
    {
        id: 2,
        title: "Water the plants",
        description: "Water the indoor and balcony plants",
        status: "in-progress",
        createdAt: new Date()
    },
    {
        id: 3,
        title: "Wash Tiffin Box",
        description: "Wash tiffin box and fill water bottle",
        status: "completed",
        createdAt: new Date()
    },
    {
        id: 4,
        title: "Go to birthday party",
        description: "Attend a friend's birthday party",
        status: "pending",
        createdAt: new Date()
    }
]

// POST /tasks: Create a new task
app.post("/tasks", auth, (req, res) => {
    const {title, description, status = "pending"} = req.body

    if(!title || !description) {
        return res.status(400).json({message: "Title and description fields are required"})
    }

    const validatingStatus = ["pending", "in-progress", "completed"];
    if (!validatingStatus.includes(status)) {
        return res.status(400).json({message: "Invalid status value."});
    }

    const newTask = {
        id: tasks.length + 1,
        title,
        description,
        status,
        createdAt: new Date()
    }

    tasks.push(newTask)
    res.status(200).json({message: "Task added successfully", task: newTask})
})

// GET /tasks: Retrieve all tasks (supports optional filters).
app.get('/tasks', (req, res) => {
    let result = [...tasks];
    const {status, sortByDate} = req.query

    // Filtering by status
    if(status) {
        result = result.filter(
            (task) => task.status.toLowerCase() === status.toLowerCase()
        )
    }

    // Sorting by createdAt date
    if(sortByDate === "asc" || sortByDate === "desc") {
        result.sort((a,b) => sortByDate === "asc" ? new Date(a.createdAt) - new Date(b.createdAt) : new Date(b.createdAt) - new Date(a.createdAt))
    }

    res.status(200).json(result)
})

// GET /tasks/:id: Retrieve a single task by its ID.
app.get('/tasks/:id', (req, res) => {
    const task = tasks.find((t) => t.id == req.params.id)

    if(!task) {
        return res.status(404).json({message: "Task not found"})
    }

    res.status(200).json(task)
})

// PUT /tasks/:id: Update an existing task by its ID.
app.put('/tasks/:id', auth, (req, res) => {
    const index = tasks.findIndex((t) => t.id == req.params.id)
    if(index === -1) {
        return res.status(404).json({message: "Task not found"})
    }

    const {title, description, status} = req.body
    const validatingStatus = ["pending", "in-progress", "completed"]

    if(status && !validatingStatus.includes(status)) {
        return res.status(400).json({message: "Invalid status value."})
    }

    tasks[index] = {
        ...tasks[index],
        title: title ?? tasks[index].title,
        description: description ?? tasks[index].description,
        status: status ?? tasks[index].status,
    }

    res.status(200).json({
        message: "Task updated successfully",
        task: tasks[index]
    })
})

// DELETE /tasks/:id: Delete a task by its ID.
app.delete("/tasks/:id", auth, (req, res) => {
    const id = parseInt(req.params.id)
    const index = tasks.findIndex((t) => t.id === id)

    if(index === -1) {
        return res.status(404).json({message: "Task not found"})
    }

    tasks.splice(index, 1)
    res.status(200).json({message: "Task deleted successfully"})
})