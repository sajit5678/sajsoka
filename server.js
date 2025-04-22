const express = require('express');
const path = require('path');
const http = require('http');
const router = express.Router();
const session = require('express-session');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, { pingTimeout: 240000 });

const socketHandler = require("./socket");
const User = require('./routes/User'); // Adjust the path based on your project structure
const ChatRoom = require('./routes/ChatRoom'); // Adjust the path based on your project structure


// Pass `io` to the socket handler
socketHandler(io);


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(
    session({
        secret: 'your-secret-key', // Replace with a strong secret
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false } // Use `secure: true` if using HTTPS
    })
);

// Routes setup
const authRoutes = require('./routes/auth');
// const gameRoutes = require('./routes/game');
// const apiRoutes = require('./routes/api');
const connectDB = require('./config/db');


// Static files middleware
app.use(express.static(path.join(__dirname, 'public')));  // For general static files
app.use(express.static(path.join(__dirname, 'landing'))); // For landing page assets
app.use(express.static(path.join(__dirname, 'frontend','build')));   // For React app build

// Route handlers
app.use('/auth', authRoutes);


// app.use(session({
  // secret: 'your-secret-key',
  // resave: false,
  // saveUninitialized: false,
  // cookie: { secure: process.env.NODE_ENV === 'production' }
// }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve profile.html
app.get('/profile', (req, res) => {
	// console.log('Session user:', req.session.user);
  // if (!req.session.user) {
    // return res.redirect('/auth/login'); // Redirect to login if not authenticated
  // }
  // res.sendFile(__dirname + "/public/profile.html");
  res.sendFile(__dirname + "/frontend/build/index.html");

  // res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

// API to fetch user information
app.get('/auth/user-info', async (req, res) => {
  console.log('From user info first API', req.session.user);

  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Assuming `User` is the Mongoose model for your user collection
    const user = await User.findOne({ email: req.session.user.email }).select('email isAdmin');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('From user info', user);
    res.json({ email: user.email, isAdmin: user.isAdmin });
  } catch (error) {
    console.error('Error fetching user information:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/auth/save-chat-room', async (req, res) => {
  const { chatRoomId } = req.body;

  if (!chatRoomId) {
    return res.status(400).json({ success: false, message: 'ChatRoom ID is required' });
  }

  try {
    // Save chatroom ID in the database
    const newChatRoom = new ChatRoom({ chatRoomId });
    await newChatRoom.save();

    res.json({ success: true, message: 'ChatRoom ID stored successfully' });
  } catch (error) {
    if (error.code === 11000) { // Handle duplicate key error
      return res.status(400).json({ success: false, message: 'ChatRoom ID already exists' });
    }

    console.error('Error storing chatroom ID:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});



// // Routes setup
// const authRoutes = require('./routes/auth');
// // const gameRoutes = require('./routes/game');
// // const apiRoutes = require('./routes/api');
// const connectDB = require('./config/db');


// // Static files middleware
// app.use(express.static(path.join(__dirname, 'public')));  // For general static files
// app.use(express.static(path.join(__dirname, 'landing'))); // For landing page assets
// app.use(express.static(path.join(__dirname, 'frontend','build')));   // For React app build

// // Route handlers
// app.use('/auth', authRoutes);
// app.use('/api', apiRoutes);
// app.use('/game', gameRoutes);
app.get("/game/*", (req, res) => {
  res.sendFile(__dirname + "/frontend/build/index2.html");
});


connectDB();

// Middleware
app.use(express.json());


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});



// Landing page route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'landing', 'index.html'));
});

// Catch-all route for the React app
// app.get('/game/*', (req, res) => {
  // res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });

// Socket.io setup
// require('./socket')(io);  // Separate socket logic

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});