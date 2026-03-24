/** Radix Select value must match a SelectItem — use when no coach is chosen. */
export const BATCH_COACH_UNASSIGNED = "__batch_coach_unassigned__"

export interface NormalizedCourseAssignment {
  course_id: string
  batches: {
    id: string
    start_time: string
    end_time: string
    coach_id: string
    days: string[]
  }[]
}

/**
 * Build edit-form course rows from API assignments (supports course_schedule + legacy courses: string[]).
 */
export function normalizeAssignmentsCourses(
  assignments: { courses?: unknown; course_schedule?: unknown } | null | undefined
): NormalizedCourseAssignment[] {
  const sched = assignments?.course_schedule
  if (Array.isArray(sched) && sched.length > 0) {
    return sched
      .map((c: Record<string, unknown> & { course_id?: string; batches?: unknown[] }) => {
        const course_id = String(
          c.course_id ?? (c as { courseId?: unknown }).courseId ?? ""
        )
        return {
          course_id,
          batches: (Array.isArray(c.batches) ? c.batches : []).map(
            (b: Record<string, unknown>, i: number) => {
              const start =
                b.start_time ?? (b as { startTime?: unknown }).startTime
              const end = b.end_time ?? (b as { endTime?: unknown }).endTime
              const coach = b.coach_id ?? (b as { coachId?: unknown }).coachId
              return {
                id:
                  typeof b.id === "string" && b.id
                    ? b.id
                    : `batch-${course_id || "c"}-${i}`,
                start_time: String(start ?? ""),
                end_time: String(end ?? ""),
                coach_id: String(coach ?? ""),
                days: Array.isArray(b.days)
                  ? b.days.map((d) => String(d))
                  : [],
              }
            }
          ),
        }
      })
      .filter((row) => row.course_id.length > 0)
  }

  const raw = assignments?.courses
  if (!Array.isArray(raw)) return []

  const fromStrings = raw
    .filter((id): id is string => typeof id === "string" && id.length > 0)
    .map((course_id) => ({
      course_id,
      batches: [
        {
          id: `batch-${course_id}-0`,
          start_time: "",
          end_time: "",
          coach_id: "",
          days: [] as string[],
        },
      ],
    }))

  if (fromStrings.length > 0) return fromStrings

  return (raw as { course_id?: string }[])
    .filter((x) => x && typeof x.course_id === "string")
    .map((x) => ({
      course_id: x.course_id!,
      batches: [
        {
          id: `batch-${x.course_id}-0`,
          start_time: "",
          end_time: "",
          coach_id: "",
          days: [] as string[],
        },
      ],
    }))
}

export function buildCourseSchedulePayload(
  courses: NormalizedCourseAssignment[]
): { course_id: string; batches: { start_time: string; end_time: string; coach_id: string; days: string[] }[] }[] {
  return courses.map((c) => ({
    course_id: c.course_id,
    batches: c.batches.map((b) => ({
      start_time: b.start_time,
      end_time: b.end_time,
      coach_id: b.coach_id,
      days: [...(b.days || [])],
    })),
  }))
}
