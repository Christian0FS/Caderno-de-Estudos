import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserFromReq } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req) {
    const me = getUserFromReq(req);
    if (!me) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

    try {
        const connections = await prisma.connection.findMany({
            where: {
                status: 'accepted',
                OR: [
                    { requesterId: Number(me.id) },
                    { receiverId: Number(me.id) },
                ],
            },
            include: {
                requester: { select: { id: true, name: true } },
                receiver: { select: { id: true, name: true } },
            },
        });

        const result = connections.map((conn) => {
            const peer = conn.requesterId === Number(me.id) ? conn.receiver : conn.requester;
            return { id: conn.id, status: conn.status, peer };
        });

        const incoming = await prisma.connection.findMany({
            where: {
                receiverId: Number(me.id),
                status: 'pending',
            },
            include: { requester: { select: { id: true, name: true } } },
        });

        const incomingResult = incoming.map((conn) => ({ id: conn.id, from: conn.requester }));

        return NextResponse.json({ connections: result, incoming: incomingResult });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Erro ao buscar conexões.' }, { status: 500 });
    }
}
