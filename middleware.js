import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

function getSecret() {
    if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET está obrigatório em produção.');
    }
    return process.env.JWT_SECRET || 'dev_jwt_secret';
}

export function middleware(req) {
    const { pathname } = req.nextUrl;

    // Allow public routes
    if (
        pathname.startsWith('/api/auth') ||
        pathname.startsWith('/_next') ||
        pathname === '/favicon.ico' ||
        pathname === '/apple-icon.png' ||
        pathname === '/icon.png' ||
        pathname === '/logo.png' ||
        pathname.startsWith('/login') ||
        pathname.startsWith('/signup') ||
        pathname.startsWith('/change-password')
    ) {
        return NextResponse.next();
    }

    const cookie = req.headers.get('cookie') || '';
    const match = cookie.match(/(^|;)\s*token=([^;]+)/);
    const token = match ? match[2] : null;

    if (!token) {
        const url = req.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    try {
        const payload = jwt.verify(token, getSecret());
        if (payload.forcePasswordChange && pathname !== '/change-password') {
            const url = req.nextUrl.clone();
            url.pathname = '/change-password';
            return NextResponse.redirect(url);
        }
        return NextResponse.next();
    } catch (e) {
        const url = req.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|apple-touch-icon.png|icon.png|logo.png).*)'],
};
