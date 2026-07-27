import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import cookie from 'cookie';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

export async function POST(req) {
    try {
        const { email, password, remember } = await req.json();
        if (!email || !password) return NextResponse.json({ error: 'Preencha e-mail e senha.' }, { status: 400 });

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return NextResponse.json({ error: 'E-mail ou senha inválidos.' }, { status: 400 });

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return NextResponse.json({ error: 'E-mail ou senha inválidos.' }, { status: 400 });

        const expiresIn = remember ? '30d' : '1d';
        const token = jwt.sign(
            { sub: user.id, name: user.name, email: user.email, forcePasswordChange: user.forcePasswordChange },
            JWT_SECRET,
            { expiresIn }
        );

        const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24;
        const serialized = cookie.serialize('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge,
        });

        return new NextResponse(JSON.stringify({ ok: true, forcePasswordChange: user.forcePasswordChange }), {
            status: 200,
            headers: { 'Set-Cookie': serialized, 'Content-Type': 'application/json' },
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Erro no servidor.' }, { status: 500 });
    }
}
