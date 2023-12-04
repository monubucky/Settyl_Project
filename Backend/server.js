const express = require('express');
const http = require('http');
const cors = require('cors'); // Import the cors middleware
const app = express();
const server = http.createServer(app);
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const SECRET_KEY = 'your_secret_key'; 
var io = require('socket.io')(server, {
    cors: {
      origin: '*',
    }
});

var currentBid = 0;
// app.use(cors()); // Enable CORS for all routes
io.on('connection', (socket) => {
  // Send current bid to a new user
  console.log("Current Bid: "+currentBid);
  socket.emit('currentBid', currentBid);

  // Listen for new bids
  socket.on('newBid', (bid) => {
    console.log("New Bid:"+bid);
    if (bid > currentBid) {
      currentBid = bid;
      io.emit('currentBid', currentBid);
    }
  });
});

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
