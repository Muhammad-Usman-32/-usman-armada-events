import { PrismaClient, RsvpStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const reminderHours = process.env.DEFAULT_REMINDER_HOURS || '24';
  const seedUserEmail = process.env.SEED_USER_EMAIL || 'organizer@armadaevents.com';
  const seedUserName = process.env.SEED_USER_NAME || 'Armada Event Organizer';

  console.log('--- Starting Database Seeding ---');

  // 1. Seed Setting: reminder_hours
  const setting = await prisma.setting.upsert({
    where: { key: 'reminder_hours' },
    update: { value: reminderHours },
    create: {
      key: 'reminder_hours',
      value: reminderHours,
    },
  });
  console.log(`✓ Seeded setting: ${setting.key} = ${setting.value}`);

  // 2. Seed Placeholder User
  const seedUser = await prisma.user.upsert({
    where: { email: seedUserEmail },
    update: {
      name: seedUserName,
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ArmadaOrganizer',
    },
    create: {
      email: seedUserEmail,
      name: seedUserName,
      googleId: 'seed-google-id-001',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ArmadaOrganizer',
    },
  });
  console.log(`✓ Seeded placeholder user: ${seedUser.name} (${seedUser.email})`);

  // 3. Seed Sample Events
  const now = new Date();
  
  // Upcoming Event 1: Tomorrow
  const upcomingDate1 = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const event1 = await prisma.event.create({
    data: {
      title: 'Annual Tech Innovation Summit 2026',
      description: 'Join industry visionaries, engineers, and tech founders to explore the next frontier of distributed computing and modern web technologies.',
      date: upcomingDate1,
      location: 'Grand Ballroom, Armada Convention Center',
      createdBy: seedUser.id,
      rsvps: {
        create: {
          userId: seedUser.id,
          status: RsvpStatus.going,
        },
      },
    },
  });

  // Upcoming Event 2: Next Week
  const upcomingDate2 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const event2 = await prisma.event.create({
    data: {
      title: 'Open Source Hackathon & Demo Day',
      description: 'Collaborate with fellow developers, build impactful tools in 48 hours, and present your projects to a panel of judges.',
      date: upcomingDate2,
      location: 'Tech Hub Floor 4, Suite 402',
      createdBy: seedUser.id,
      rsvps: {
        create: {
          userId: seedUser.id,
          status: RsvpStatus.going,
        },
      },
    },
  });

  // Past Event: 2 Weeks Ago
  const pastDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const event3 = await prisma.event.create({
    data: {
      title: 'Frontend Architecture & Design Systems Workshop',
      description: 'A deep-dive workshop into building ultra-clean design systems with CSS custom properties and component-driven architecture.',
      date: pastDate,
      location: 'Auditorium B, Armada Campus',
      createdBy: seedUser.id,
      rsvps: {
        create: {
          userId: seedUser.id,
          status: RsvpStatus.going,
        },
      },
    },
  });

  console.log(`✓ Seeded sample events:
    - "${event1.title}" (Upcoming: ${event1.date.toISOString()})
    - "${event2.title}" (Upcoming: ${event2.date.toISOString()})
    - "${event3.title}" (Past: ${event3.date.toISOString()})`);

  console.log('--- Database Seeding Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
