import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserFromReq } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req) {
    const me = getUserFromReq(req);
    if (!me) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

    try {
        const body = await req.json();
        const connectionId = Number(body.connectionId);
        if (!connectionId) return NextResponse.json({ error: 'connectionId inválido.' }, { status: 400 });

        const conn = await prisma.connection.findUnique({ where: { id: connectionId } });
        if (!conn) return NextResponse.json({ error: 'Conexão não encontrada.' }, { status: 404 });
        if (conn.receiverId !== Number(me.id)) return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 });

        const updated = await prisma.connection.update({ where: { id: connectionId }, data: { status: 'accepted' } });
        return NextResponse.json({ ok: true, connection: updated });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Erro ao aceitar conexão.' }, { status: 500 });
    }
}
