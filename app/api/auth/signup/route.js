import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import cookie from 'cookie';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

export async function POST(req) {
    try {
        const body = await req.json();
        const { name, email, password } = body;
        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Preencha todos os campos.' }, { status: 400 });
        }

        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists) return NextResponse.json({ error: 'E-mail já cadastrado.' }, { status: 400 });
        if (password.length < 8) return NextResponse.json({ error: 'A senha deve ter pelo menos 8 caracteres.' }, { status: 400 });

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({ data: { name, email, passwordHash } });

        const token = jwt.sign(
            { sub: user.id, name: user.name, email: user.email, forcePasswordChange: user.forcePasswordChange },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        const serialized = cookie.serialize('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24,
        });

        return new NextResponse(JSON.stringify({ ok: true }), {
            status: 201,
            headers: { 'Set-Cookie': serialized, 'Content-Type': 'application/json' },
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Erro no servidor.' }, { status: 500 });
    }
}
