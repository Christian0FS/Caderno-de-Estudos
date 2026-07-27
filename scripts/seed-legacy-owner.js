const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    try {
        const legacyEmail = 'legacy@local';

        let legacy = await prisma.user.findUnique({ where: { email: legacyEmail } });
        if (!legacy) {
            const password = 'Trocar@1234';
            const passwordHash = await bcrypt.hash(password, 10);

            legacy = await prisma.user.create({
                data: {
                    name: 'Usuário legado',
                    email: legacyEmail,
                    passwordHash,
                    forcePasswordChange: true,
                } else {
                    console.log('Usuário legado já existe:', legacy.id);
                }

        const legacyId = legacy.id;

                // Tenta atualizar registros que não possuem userId (se existirem). Em esquemas novos a coluna é obrigatória,
                // então `where: { userId: null }` pode lançar — ignoramos esse erro com fallback.
                let subjectsRes = { count: 0 };
                let sessionsRes = { count: 0 };
                let schedulesRes = { count: 0 };
                try {
                    subjectsRes = await prisma.subject.updateMany({ where: { userId: null }, data: { userId: legacyId } });
                } catch(e) {
                    // provavelmente não há registros ou a coluna é obrigatória; ignorar
                }
        try {
                    sessionsRes = await prisma.studySession.updateMany({ where: { userId: null }, data: { userId: legacyId } });
                } catch(e) {
                    // ignorar
                }
        try {
                    schedulesRes = await prisma.scheduleItem.updateMany({ where: { userId: null }, data: { userId: legacyId } });
                } catch(e) {
                    // ignorar
                }

        console.log('Subjects atualizados:', subjectsRes.count);
                console.log('StudySessions atualizados:', sessionsRes.count);
                console.log('ScheduleItems atualizados:', schedulesRes.count);

            } catch (err) {
                console.error('Erro no seed:', err);
                process.exitCode = 1;
            } finally {
                await prisma.$disconnect();
            }
        }

        main();
