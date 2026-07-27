import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromReq } from "@/lib/auth";

export async function GET(request) {
  const me = getUserFromReq(request);
  if (!me) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const subjects = await prisma.subject.findMany({
    where: { userId: Number(me.id) },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(subjects);
}

export async function POST(request) {
  const me = getUserFromReq(request);
  if (!me) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const body = await request.json();
  const name = (body.name || "").trim();

  if (!name) {
    return NextResponse.json({ error: "Nome da matéria é obrigatório." }, { status: 400 });
  }

  try {
    const subject = await prisma.subject.create({
      data: { name, color: body.color || "#3D5A45", userId: Number(me.id) },
    });
    return NextResponse.json(subject, { status: 201 });
  } catch (err) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "Essa matéria já existe." }, { status: 409 });
    }
    return NextResponse.json({ error: "Erro ao criar matéria." }, { status: 500 });
  }
}
