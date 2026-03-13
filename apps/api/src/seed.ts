import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Hyper Vibe database...')

  // Demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      passwordHash: await bcrypt.hash('password', 12),
      displayName: 'Vibe BROski',
      totalXp: 350,
      currentLevel: 3,
      currentStreak: 7,
      broskiCoins: 150,
    },
  })
  console.log('✅ Demo user created:', demoUser.email)

  // Badges
  const badges = [
    { slug: 'first-vibe', name: 'First Vibe', description: 'Complete your first lesson', emoji: '🚀', xpReward: 50 },
    { slug: 'interactive-wizard', name: 'Interactive Wizard', description: 'Build first interactive app', emoji: '🧙', xpReward: 100 },
    { slug: 'taste-maker', name: 'Taste Maker', description: 'Complete design module', emoji: '🎨', xpReward: 100 },
    { slug: 'builder-bro', name: 'Builder BRO', description: 'Finish a capstone project', emoji: '🏆', xpReward: 200 },
  ]

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { slug: badge.slug },
      update: {},
      create: badge,
    })
  }
  console.log('✅ Badges seeded')

  // TODO: Replace with your actual course content
  const course = await prisma.course.upsert({
    where: { slug: 'vibe-coding-101' },
    update: {},
    create: {
      slug: 'vibe-coding-101',
      title: 'Vibe Coding 101: From Zero to Shipped 🚀',
      description: 'Learn to build real apps with AI. No experience needed. Just vibes.',
      level: 'beginner',
      durationWeeks: 4,
      price: 49, // TODO: Set your actual price
      isFree: false,
      isPublished: true,
      modules: {
        create: [
          {
            title: '🧠 Week 1: Vibe Mindset',
            description: 'Why vibe coding works and how to think like an AI collaborator',
            orderIndex: 1,
            emoji: '🧠',
            lessons: {
              create: [
                { title: 'What Is Vibe Coding?', content: { type: 'text', body: 'Placeholder - add your content' }, orderIndex: 1, xpReward: 25 },
                { title: 'Your First Prompt', content: { type: 'text', body: 'Placeholder - add your content' }, orderIndex: 2, xpReward: 25 },
              ],
            },
          },
          {
            title: '⚡ Week 2: Tools & Setup',
            description: 'Cursor, Replit, Claude - the vibe coding stack',
            orderIndex: 2,
            emoji: '⚡',
            lessons: {
              create: [
                { title: 'Setting Up Cursor', content: { type: 'text', body: 'Placeholder - add your content' }, orderIndex: 1, xpReward: 30 },
                { title: 'Replit for Beginners', content: { type: 'text', body: 'Placeholder - add your content' }, orderIndex: 2, xpReward: 30 },
              ],
            },
          },
        ],
      },
    },
  })
  console.log('✅ Course seeded:', course.title)
  console.log('\n🎉 Seed complete! Run: docker-compose up')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
