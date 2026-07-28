import { NextResponse } from 'next/server';
import { getUserFromReq } from '@/lib/auth';

export async function GET(req) {
    try {
        const user = getUserFromReq(req);
        if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        return NextResponse.json({ ok: true, user }, { status: 200 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
