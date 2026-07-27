import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromReq } from "@/lib/auth";

export async function GET(request) {
  const me = getUserFromReq(request);
  if (!me) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const items = await prisma.scheduleItem.findMany({
    where: { userId: Number(me.id) },
    include: { subject: true },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
  return NextResponse.json(items);
}

export async function POST(request) {
  const me = getUserFromReq(request);
  if (!me) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const body = await request.json();
  const { subjectId, title, dayOfWeek, date, startTime, endTime, recurring } = body;

  if (!subjectId || !startTime || !endTime) {
    return NextResponse.json(
      { error: "Matéria, horário de início e término são obrigatórios." },
      { status: 400 }
    );
  }
  if (recurring && (dayOfWeek === undefined || dayOfWeek === null)) {
    return NextResponse.json(
      { error: "Selecione o dia da semana para itens recorrentes." },
      { status: 400 }
    );
  }
  if (!recurring && !date) {
    return NextResponse.json(
      { error: "Selecione a data para itens não recorrentes." },
      { status: 400 }
    );
  }

  const item = await prisma.scheduleItem.create({
    data: {
      userId: Number(me.id),
      subjectId: Number(subjectId),
      title: title?.trim() || null,
      recurring: !!recurring,
      dayOfWeek: recurring ? Number(dayOfWeek) : null,
      date: !recurring ? new Date(date) : null,
      startTime,
      endTime,
    },
    include: { subject: true },
  });

  return NextResponse.json(item, { status: 201 });
}
