import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserFromReq } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req) {
    const me = getUserFromReq(req);
    if (!me) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

    try {
        const body = await req.json();
        const receiverId = Number(body.receiverId);
        if (!receiverId) return NextResponse.json({ error: 'ReceiverId inválido.' }, { status: 400 });

        if (receiverId === Number(me.id)) return NextResponse.json({ error: 'Não pode enviar pedido para si mesmo.' }, { status: 400 });

        // check existing and opposite direction
        const existing = await prisma.connection.findFirst({
            where: {
                OR: [
                    { requesterId: Number(me.id), receiverId },
                    { requesterId: receiverId, receiverId: Number(me.id) },
                ],
            },
        });
        if (existing) {
            if (existing.status === 'accepted') return NextResponse.json({ error: 'Vocês já estão conectados.' }, { status: 400 });
            if (existing.requesterId === Number(me.id)) return NextResponse.json({ error: 'Pedido já enviado.' }, { status: 400 });
            return NextResponse.json({ error: 'Você já recebeu um pedido deste usuário.' }, { status: 400 });
        }

        const conn = await prisma.connection.create({ data: { requesterId: Number(me.id), receiverId, status: 'pending' } });
        return NextResponse.json({ ok: true, connection: conn });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Erro ao criar pedido.' }, { status: 500 });
    }
}
