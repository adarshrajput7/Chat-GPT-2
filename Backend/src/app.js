const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')

// Routes
const authRoutes = require('./routes/auth.routes')
const chatRoutes = require('./routes/chat.routes')


app = express()


// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())
// app.use(express.urlencoded({ extended: true }));



app.use('/api/auth', authRoutes)
app.use('/api/chat', chatRoutes)


module.exports = app