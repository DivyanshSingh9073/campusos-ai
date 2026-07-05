export type StudyPlannerSession = {
  id: number
  subject: string
  topic: string
  studyDate: string
  completed: boolean
  createdAt: string
}

export type StudyPlannerCreateInput = {
  subject: string
  topic: string
  study_date: string
  completed?: boolean
}

export type StudyPlannerUpdateInput = {
  subject?: string
  topic?: string
  study_date?: string | null
  completed?: boolean
}

