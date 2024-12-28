export interface Taxon {
  name: string
  species: Specie[]
}

export interface Specie {
  name: string
  reviewID: number
  rangeMapID: number
  rangeVersion: string
  rangeStage: string
  rangeMetadata: string
  rangeMapNotes: string
  rangeMapScope: string
  nsxUrl: string
  differentiateUsageType: string
}

export interface SpecieFeedback {
  reviewID: number
  rangeMapID: number
  objectID: number
  reviewNotes: string | null
  dateStarted: number
  dateCompleted: number | null
  overallStarRating: number
}
