export type StudentListViewFilter = "all" | "unassigned"

export type StudentListFilters = {
  q?: string
  branch?: string
  view?: StudentListViewFilter
  page?: number
}

export function buildStudentListQuery(filters: StudentListFilters): string {
  const params = new URLSearchParams()
  if (filters.q?.trim()) params.set("q", filters.q.trim())
  if (filters.branch && filters.branch !== "all") params.set("branch", filters.branch)
  if (filters.view && filters.view !== "all") params.set("view", filters.view)
  if (filters.page && filters.page > 1) params.set("page", String(filters.page))
  const qs = params.toString()
  return qs ? `?${qs}` : ""
}

export function parseStudentListFilters(searchParams: URLSearchParams): Required<StudentListFilters> {
  const viewRaw = searchParams.get("view")
  const view: StudentListViewFilter = viewRaw === "unassigned" ? "unassigned" : "all"
  const pageRaw = Number.parseInt(searchParams.get("page") || "1", 10)
  return {
    q: searchParams.get("q") || "",
    branch: searchParams.get("branch") || "all",
    view,
    page: Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1,
  }
}

export function studentListReturnPath(basePath: string, filters: StudentListFilters): string {
  return `${basePath}/students${buildStudentListQuery(filters)}`
}
