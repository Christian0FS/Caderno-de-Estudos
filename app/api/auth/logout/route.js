import { NextResponse } from 'next/server';
import cookie from 'cookie';

export async function POST() {
    const serialized = cookie.serialize('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 0,
    });
    return new NextResponse(null, { status: 204, headers: { 'Set-Cookie': serialized } });
}
