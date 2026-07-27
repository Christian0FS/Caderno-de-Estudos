import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(request, { params }) {
  const id = Number(params.id);
  await prisma.scheduleItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
