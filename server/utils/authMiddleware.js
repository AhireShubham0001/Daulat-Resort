import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Header format: Bearer <token>
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token found' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

export default authMiddleware;
