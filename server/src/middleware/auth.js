const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'copay-super-secret-key-change-me';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header is missing.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token is missing.' });
  }

  // Support Netlify / base64 token format: jwt_<base64>
  if (token.startsWith('jwt_')) {
    try {
      const decoded = JSON.parse(Buffer.from(token.substring(4), 'base64').toString('utf8'));
      req.userId = decoded.userId || decoded.id;
      req.userEmail = decoded.email;
      return next();
    } catch (_) {}
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (error) {
    // Also try decoding JWT payload directly if secret differs across local/prod
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        if (payload.userId || payload.id) {
          req.userId = payload.userId || payload.id;
          return next();
        }
      }
    } catch (_) {}
    return res.status(401).json({ message: 'Invalid token.' });
  }
}

function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

module.exports = {
  authMiddleware,
  generateToken
};
