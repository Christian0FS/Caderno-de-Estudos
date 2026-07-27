import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const subjectId = searchParams.get("subjectId");
  const limit = Number(searchParams.get("limit")) || undefined;

  const sessions = await prisma.studySession.findMany({
    where: subjectId ? { subjectId: Number(subjectId) } : undefined,
    include: { subject: true },
    orderBy: { date: "desc" },
    take: limit,
  });
  return NextResponse.json(sessions);
}

export async function POST(request) {
  const body = await request.json();
  const { subjectId, date, duration, content, notes } = body;

  if (!subjectId || !date || !duration || !content?.trim()) {
    return NextResponse.json(
      { error: "Matéria, data, duração e conteúdo são obrigatórios." },
      { status: 400 }
    );
  }

  const session = await prisma.studySession.create({
    data: {
      subjectId: Number(subjectId),
      date: new Date(date),
      duration: Number(duration),
      content: content.trim(),
      notes: notes?.trim() || null,
    },
    include: { subject: true },
  });

  return NextResponse.json(session, { status: 201 });
}
