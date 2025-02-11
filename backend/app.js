require("dotenv").config();

const http = require('http');

const passport = require('passport');
const express = require("express");
const cors = require("cors");

const passportConfig = require("./utils/configs/passport-config");
const socketSetup = require("./utils/middlewares/socket");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const usersRoutes = require("./routes/usersRoutes");
const postsRoutes = require("./routes/postsRoutes");
const commentsRoutes = require("./routes/commentsRoutes");
const realmsRoutes = require("./routes/realmsRoutes");
const imagesRoutes = require("./routes/imagesRoutes");
const notificationRoutes = require('./routes/notificationsRoutes');
const searchRoutes = require('./routes/searchRoutes');

// Initialize express
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
socketSetup(server);

// Frontend URL
const FRONTEND_URL =
  process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : 'http://localhost:5173';

// Configure CORS
app.use(cors({
    origin: FRONTEND_URL, // Allow requests from this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Adjust based on your needs
    credentials: true, // Allow credentials
  }));

  console.log("using frontendurl:", FRONTEND_URL);

app.use((req,res,next) => {
  res.setHeader('Access-Control-Allow-Origin', FRONTEND_URL);
  next();
});

app.use(express.json()); // For JSON payloads
app.use(express.urlencoded({ extended: true })); // For application/x-www-form-urlencoded form-data

// Initialize Passport configuration
passportConfig(passport);

// Debug middleware
app.use((req, res, next) => {
    console.log('Request Header:', req.header); // Log request body to debug
    console.log('Request Body:', req.body); // Log request body to debug
    console.log('Request Query:', req.query); // Log request body to debug
    console.log('Authorization header:', req.headers.authorization);
    next();
});

// Public routes for login + signup
app.use('/auth', authRoutes);

// Authenticated Routes
app.use('/users', passport.authenticate('jwt', { session: false }), usersRoutes);
app.use('/posts', passport.authenticate('jwt', { session: false }), postsRoutes);
app.use('/comments', passport.authenticate('jwt', { session: false }), commentsRoutes);
app.use('/realms', passport.authenticate('jwt', { session: false }), realmsRoutes);
app.use('/images', passport.authenticate('jwt', { session: false }), imagesRoutes);
app.use('/notifications', passport.authenticate('jwt', { session: false }), notificationRoutes);
app.use('/search', passport.authenticate('jwt', { session: false }), searchRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack to the console
  
    // Determine the status code
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  
    // Send JSON response with error details
    res.status(statusCode).json({
      success: false,
      message: err.message || 'Internal Server Error'
    });
});  

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log("App listening on port ", port);
})