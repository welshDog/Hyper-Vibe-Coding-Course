import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../middleware/requireAuth'

const router = Router()
const prisma = new PrismaClient()

// GET /api/courses - List all published courses
router.get('/', async (_req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      include: {
        modules: {
          include: { lessons: { select: { id: true } } },
        },
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: 'asc' },
    })
    res.json(courses)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch courses' })
  }
})

// GET /api/courses/:slug - Single course detail
router.get('/:slug', async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { slug: req.params.slug },
      include: {
        modules: {
          include: { lessons: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    })
    if (!course) return res.status(404).json({ error: 'Course not found' })
    res.json(course)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch course' })
  }
})

// POST /api/courses/:slug/enroll - Enroll in a course (auth required)
router.post('/:slug/enroll', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId
    const course = await prisma.course.findUnique({ where: { slug: req.params.slug } })
    if (!course) return res.status(404).json({ error: 'Course not found' })

    const enrollment = await prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId: course.id } },
      create: { userId, courseId: course.id },
      update: {},
    })
    res.json(enrollment)
  } catch (err) {
    res.status(500).json({ error: 'Enrollment failed' })
  }
})

export { router as coursesRouter }
