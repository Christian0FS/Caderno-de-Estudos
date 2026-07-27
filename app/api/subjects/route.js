import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const subjects = await prisma.subject.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(subjects);
}

export async function POST(request) {
  const body = await request.json();
  const name = (body.name || "").trim();

  if (!name) {
    return NextResponse.json({ error: "Nome da matéria é obrigatório." }, { status: 400 });
  }

  try {
    const subject = await prisma.subject.create({
      data: { name, color: body.color || "#3D5A45" },
    });
    return NextResponse.json(subject, { status: 201 });
  } catch (err) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "Essa matéria já existe." }, { status: 409 });
    }
    return NextResponse.json({ error: "Erro ao criar matéria." }, { status: 500 });
  }
}
