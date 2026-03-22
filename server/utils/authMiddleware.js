import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const authMiddleware = async (req, res, next) => {
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
        let userPermissions = {};
        let currentRole = decoded.role;
        
        // Fetch latest permissions straight from the DB for up-to-date security checks
        try {
            const User = mongoose.model('User');
            if (User) {
                const dbUser = await User.findById(decoded.id);
                if (dbUser) {
                    userPermissions = dbUser.customPermissions || {};
                    currentRole = dbUser.role;
                }
            }
        } catch (e) {
            console.error("Auth DB look up error for custom permissions:", e.message);
        }

        req.user = {
            id: decoded.id,
            role: currentRole,
            customPermissions: userPermissions
        };
        
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: `Access Denied: Your role (${req.user.role}) is not authorized.` });
        }
        next();
    };
};

export const authorizePermission = (moduleName, actionName) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        
        // Owner fundamentally ignores granular permission blocks
        if (req.user.role === 'Owner') {
            return next();
        }

        // Check if the user's custom permissions map explicitly grants this action
        const hasCustomPermission = req.user.customPermissions?.[moduleName]?.[actionName] === true;
        
        if (!hasCustomPermission) {
            return res.status(403).json({ message: `Access Denied: Requires [${moduleName} : ${actionName}] permission.` });
        }
        
        next();
    };
};

export default authMiddleware;
