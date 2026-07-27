import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import cookie from 'cookie';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

function getToken(req) {
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(/(^|;)\s*token=([^;]+)/);
    return match ? match[2] : null;
}

export async function POST(req) {
    try {
        const token = getToken(req);
        if (!token) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

        const payload = jwt.verify(token, JWT_SECRET);
        const userId = Number(payload.sub);

        const { password } = await req.json();
        if (!password || password.length < 8) {
            return NextResponse.json({ error: 'Senha deve ter ao menos 8 caracteres.' }, { status: 400 });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        await prisma.user.update({ where: { id: userId }, data: { passwordHash, forcePasswordChange: false } });

        const newToken = jwt.sign(
            { sub: userId, name: payload.name, email: payload.email, forcePasswordChange: false },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        const serialized = cookie.serialize('token', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24,
        });

        return new NextResponse(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { 'Set-Cookie': serialized, 'Content-Type': 'application/json' },
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Erro no servidor.' }, { status: 500 });
    }
}
