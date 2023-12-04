const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;
const cors = require('cors'); // Import the cors middleware
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const SECRET_KEY = 'your_secret_key'; 

app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());

let products = [
  { id: 1, name: 'Product 1', price: 10 },
  { id: 2, name: 'Product 2', price: 20 },
  // Add more products as needed
];

let cart = [];
let users = [];
// User Registration
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    
    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);
  
    const newUser = { id: users.length + 1, username, email, password: hashedPassword };
    users.push(newUser);
  
    // Generate JWT token
    const token = jwt.sign({ userId: newUser.id, username: newUser.username }, SECRET_KEY);
    res.json({ user: newUser, token });
  });
  
  // User Login
  app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find((u) => u.username === username);
  
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
  
    // Generate JWT token
    const token = jwt.sign({ userId: user.id, username: user.username }, SECRET_KEY);
    res.json({ user, token });
  });
  
  // Middleware to authenticate and authorize requests
  const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
  
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Forbidden' });
      }
  
      req.user = user;
      next();
    });
  };
  
  // Item Listing (Protected Route)
  app.get('/items', authenticateToken, (req, res) => {
    res.json(items);
  });
  
  // Bidding (Protected Route)
  app.post('/bid', authenticateToken, (req, res) => {
    const { userId, itemId, bidAmount } = req.body;
    const item = items.find((item) => item.id === itemId);
  
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
  
    const newBid = { userId, itemId, bidAmount };
    bids.push(newBid);
  
    // Update current bid for the item
    item.currentBid = bidAmount;
  
    res.json(newBid);
  });
  
  // Transaction Management (Checkout) (Protected Route)
  app.post('/checkout', authenticateToken, (req, res) => {
    // Here you would typically handle the payment process and update transaction status
    // For simplicity, we'll just clear the bids in this example
    bids = [];
    res.json({ success: true });
  });


app.get('/products', (req, res) => {
  res.json(products);
});

app.post('/cart/add', (req, res) => {
  const { productId, quantity } = req.body;
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  cart.push({ ...product, quantity });
  res.json({ success: true });
});

app.get('/cart', (req, res) => {
  res.json(cart);
});

app.post('/checkout', (req, res) => {
  // Here you would typically handle the payment process
  // For simplicity, we'll just clear the cart in this example
  cart = [];
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
