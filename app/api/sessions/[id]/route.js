import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromReq } from "@/lib/auth";

export async function PUT(request, { params }) {
  const me = getUserFromReq(request);
  if (!me) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const id = Number(params.id);
  const existing = await prisma.studySession.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Registro não encontrado." }, { status: 404 });
  if (existing.userId !== Number(me.id)) return NextResponse.json({ error: "Sem permissão." }, { status: 403 });

  const body = await request.json();
  const session = await prisma.studySession.update({
    where: { id },
    data: {
      ...(body.subjectId && { subjectId: Number(body.subjectId) }),
      ...(body.date && { date: new Date(body.date) }),
      ...(body.duration && { duration: Number(body.duration) }),
      ...(body.content && { content: body.content.trim() }),
      ...(body.notes !== undefined && { notes: body.notes?.trim() || null }),
    },
    include: { subject: true },
  });

  return NextResponse.json(session);
}

export async function DELETE(request, { params }) {
  const me = getUserFromReq(request);
  if (!me) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const id = Number(params.id);
  const existing = await prisma.studySession.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Registro não encontrado." }, { status: 404 });
  if (existing.userId !== Number(me.id)) return NextResponse.json({ error: "Sem permissão." }, { status: 403 });

  await prisma.studySession.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
