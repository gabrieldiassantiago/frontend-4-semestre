/**
 * Re-exports das funções de perfil de candidato do api.ts central.
 */
export {
  getCandidateProfileMe,
  updateCandidateProfileMe,
  uploadCandidateAvatar,
  uploadCandidateResume,
  addCandidateExperience,
  updateCandidateExperience,
  deleteCandidateExperience,
  addCandidateProject,
  updateCandidateProject,
  deleteCandidateProject,
} from "@/lib/api"

export type {
  CandidateProfile,
  CandidateExperience,
  CandidateProject,
  UpdateCandidateProfileDto,
  CreateExperienceDto,
  CreateProjectDto,
} from "@/lib/api"
