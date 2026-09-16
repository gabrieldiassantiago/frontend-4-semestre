export interface CandidateExperience {
  id: string
  companyName: string
  role: string
  description?: string
  startDate: string
  endDate?: string
  isCurrent: boolean
  createdAt?: string
}

export interface CandidateProject {
  id: string
  title: string
  description?: string
  projectUrl?: string
  toolsAndSkills?: string[]
  createdAt?: string
}

export interface CandidateProfile {
  id: string
  userId: string
  userName?: string
  userEmail?: string

  profileImageUrl?: string
  resumeUrl?: string

  headline?: string
  summary?: string
  phone?: string
  city?: string
  state?: string
  institution?: string
  course?: string
  currentSemester?: number
  expectedGraduationYear?: number
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  skills?: string[]
  experiences?: CandidateExperience[]
  projects?: CandidateProject[]
  createdAt?: string
  updatedAt?: string
}

export interface UpdateCandidateProfileDto {
  headline?: string
  summary?: string
  phone?: string
  city?: string
  state?: string
  institution?: string
  course?: string
  currentSemester?: number
  expectedGraduationYear?: number
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  skills?: string[]
}

export interface CreateExperienceDto {
  companyName: string
  role: string
  description?: string
  startDate: string
  endDate?: string
  isCurrent: boolean
}

export interface CreateProjectDto {
  title: string
  description?: string
  projectUrl?: string
  toolsAndSkills?: string[]
}
