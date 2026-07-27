import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request, { params }) {
  const id = Number(params.id);
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
  const id = Number(params.id);
  await prisma.studySession.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
