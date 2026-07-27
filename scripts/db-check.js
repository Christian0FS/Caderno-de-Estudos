const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const subjects = await prisma.subject.count();
        const sessions = await prisma.studySession.count();
        const schedules = await prisma.scheduleItem.count();
        const users = await prisma.user.count();
        console.log({ users, subjects, sessions, schedules });
    } catch (e) {
        console.error('Erro ao checar DB:', e.message);
        process.exitCode = 1;
    } finally {
        await prisma.$disconnect();
    }
}

main();
