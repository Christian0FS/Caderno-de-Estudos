import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

function getSecret() {
    if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET está obrigatório em produção.');
    }
    return JWT_SECRET;
}

export function getUserFromReq(req) {
    const cookie = req.headers.get('cookie') || '';
    const match = cookie.match(/(^|;)\s*token=([^;]+)/);
    const token = match ? match[2] : null;
    if (!token) return null;
    try {
        const payload = jwt.verify(token, getSecret());
        if (!payload || !payload.sub || !payload.email) return null;
        return { id: payload.sub, name: payload.name, email: payload.email };
    } catch (e) {
        return null;
    }
}
