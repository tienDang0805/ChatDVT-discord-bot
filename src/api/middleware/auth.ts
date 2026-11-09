import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const configuredJwtSecret = process.env.JWT_SECRET?.trim();
if (!configuredJwtSecret) {
    console.warn('[Security] WARNING: JWT_SECRET is not set in environment. Using an ephemeral random secret for this process.');
}
const JWT_SECRET = configuredJwtSecret || crypto.randomBytes(32).toString('hex');

export const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

export { JWT_SECRET };

// Admin credentials (never fall back to default 'admin'/'admin' when unconfigured)
export const ADMIN_USER = (process.env.ADMIN_USERNAME || '').trim();
export const ADMIN_PASS = (process.env.ADMIN_PASSWORD || '').trim();

function safeCompareStrings(input: string, expected: string): boolean {
    const inputDigest = crypto.createHash('sha256').update(input, 'utf8').digest();
    const expectedDigest = crypto.createHash('sha256').update(expected, 'utf8').digest();
    return crypto.timingSafeEqual(inputDigest, expectedDigest);
}

export function verifyAdminCredentials(username: unknown, password: unknown): boolean {
    if (!ADMIN_USER || !ADMIN_PASS) {
        console.error('[Security] Admin login rejected because ADMIN_USERNAME or ADMIN_PASSWORD is not configured.');
        return false;
    }
    if (typeof username !== 'string' || typeof password !== 'string') {
        return false;
    }
    const userMatch = safeCompareStrings(username, ADMIN_USER);
    const passMatch = safeCompareStrings(password, ADMIN_PASS);
    return userMatch && passMatch;
}
