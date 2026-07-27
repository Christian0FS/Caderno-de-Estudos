import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserFromReq } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req) {
    const me = getUserFromReq(req);
    if (!me) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

    try {
        // find accepted connections where me is requester or receiver
        const conns = await prisma.connection.findMany({
            where: {
                status: 'accepted',
                OR: [
                    { requesterId: Number(me.id) },
                    { receiverId: Number(me.id) },
                ],
            },
        });

        const ids = new Set();
        conns.forEach((c) => {
            ids.add(c.requesterId);
            ids.add(c.receiverId);
        });
        // remove self
        ids.delete(Number(me.id));
        const userIds = Array.from(ids);

        // fetch shared study sessions from those users
        const sessions = await prisma.studySession.findMany({
            where: {
                userId: { in: userIds.length ? userIds : [-1] },
                visibility: 'shared',
            },
            include: { subject: true, user: { select: { id: true, name: true } } },
            orderBy: { date: 'desc' },
            take: 50,
        });

        return NextResponse.json({ sessions });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Erro ao buscar feed.' }, { status: 500 });
    }
}
