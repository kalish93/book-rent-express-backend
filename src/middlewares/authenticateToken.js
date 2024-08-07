const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Get token from "Bearer <token>"

  if (token == null) return res.sendStatus(401); // No token, unauthorized

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Invalid token, forbidden
    req.user = user; // Attach user to the request object
    next(); // Proceed to the next middleware or route handler
  });
};

module.exports = authenticateToken;
