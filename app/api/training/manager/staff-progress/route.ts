import { NextRequest, NextResponse } from 'next/server'
import { requireManager } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { trainingCourseAvailableToUser } from '@/lib/brick-breaker-training-quiz'
import type { UserRole } from '@/types/database'

export async function GET(_request: NextRequest) {
  try {
    await requireManager()
    const supabase = createServerClient()

    const { data: staffUsers, error: staffErr } = await supabase
      .from('users')
      .select('id, name, site, role')
      .eq('active', true)
      .in('role', ['staff', 'manager', 'admin'])

    if (staffErr) {
      console.error('staff-progress staff fetch:', staffErr)
      return NextResponse.json({ error: 'Failed to load accounts' }, { status: 500 })
    }

    const staff = staffUsers || []
    if (staff.length === 0) {
      return NextResponse.json({ staff: [] })
    }

    const { data: courses, error: courseErr } = await supabase
      .from('training_courses')
      .select('id, title, site, active')
      .eq('active', true)

    if (courseErr) {
      console.error('staff-progress courses:', courseErr)
      return NextResponse.json({ error: 'Failed to load training modules' }, { status: 500 })
    }

    const activeCourses = courses || []
    const staffIds = staff.map((s) => s.id)

    const { data: completions, error: compErr } = await supabase
      .from('training_completions')
      .select('userId, courseId, completedAt, expiresAt')
      .in('userId', staffIds)
      .gt('expiresAt', new Date().toISOString())

    if (compErr) {
      console.error('staff-progress completions:', compErr)
      return NextResponse.json({ error: 'Failed to load completions' }, { status: 500 })
    }

    const completionsList = completions || []
    const latestCompletedAt = new Map<string, string>()

    for (const c of completionsList) {
      const key = `${c.userId}:${c.courseId}`
      const prev = latestCompletedAt.get(key)
      if (!prev || c.completedAt > prev) {
        latestCompletedAt.set(key, c.completedAt)
      }
    }

    const result = staff.map((row) => {
      const role = row.role as UserRole
      const site = (row.site as string | null) ?? null
      const applicable = activeCourses.filter((course) =>
        trainingCourseAvailableToUser(role, site, course),
      )

      const completedModules: { courseId: string; title: string; completedAt: string }[] = []

      for (const course of applicable) {
        const key = `${row.id}:${course.id}`
        const completedAt = latestCompletedAt.get(key)
        if (completedAt) {
          completedModules.push({
            courseId: course.id,
            title: course.title,
            completedAt,
          })
        }
      }

      completedModules.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }))

      return {
        id: row.id,
        name: row.name,
        site: row.site,
        role: row.role,
        totalModules: applicable.length,
        completedCount: completedModules.length,
        completedModules,
      }
    })

    return NextResponse.json({ staff: result })
  } catch (err) {
    console.error('Error in GET /api/training/manager/staff-progress:', err)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
