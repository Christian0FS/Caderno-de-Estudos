import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserFromReq } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req) {
    const url = new URL(req.url);
    const q = url.searchParams.get('q') || '';
    const me = getUserFromReq(req);
    if (!me) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

    try {
        const users = await prisma.user.findMany({
            where: {
                name: { contains: q, mode: 'insensitive' },
            },
            select: { id: true, name: true },
            take: 20,
        });

        const filtered = me ? users.filter((u) => u.id !== Number(me.id)) : users;
        let result = filtered;

        if (me) {
            const userIds = filtered.map((user) => user.id);
            const connections = await prisma.connection.findMany({
                where: {
                    OR: [
                        { requesterId: Number(me.id), receiverId: { in: userIds } },
                        { receiverId: Number(me.id), requesterId: { in: userIds } },
                    ],
                },
            });

            const statusMap = new Map();
            connections.forEach((connection) => {
                const otherId = connection.requesterId === Number(me.id) ? connection.receiverId : connection.requesterId;
                const direction = connection.requesterId === Number(me.id) ? 'sent' : 'received';
                const status = connection.status === 'accepted' ? 'accepted' : `pending-${direction}`;
                statusMap.set(otherId, status);
            });

            result = filtered.map((user) => ({
                ...user,
                connectionStatus: statusMap.get(user.id) ?? 'none',
            }));
        } else {
            result = filtered.map((user) => ({ ...user, connectionStatus: 'none' }));
        }

        return NextResponse.json({ users: result });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Erro no servidor.' }, { status: 500 });
    }
}

