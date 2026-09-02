import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey12345');
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid token' });
    }
};

export const requireSupplier = (req, res, next) => {
    if (req.user.role !== 'supplier' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Supplier access required' });
    }
    next();
};
