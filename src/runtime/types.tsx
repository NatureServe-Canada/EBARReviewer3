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

export enum DataSourceLabel {
  USAGE_TYPE_MARKUP = 'Usage Type Markup',
  USAGE_TYPE = 'Usage Type',
  PRESENCE_MARKUP = 'Presence Markup',
  PRESENCE = 'Species Range Ecoshapes (generalized)',
  REVIEW = 'ReviewerApp2C - Review',
  SPECIES = 'ReviewerApp2C - ReviewRangeMapSpecies',
  ECOSHAPE = 'Ecoshapes (generalized)',
  ECOSHAPE_REVIEW = 'ReviewerApp2C - EcoshapeReview'
}

export interface EcoshapeReview {
  objectID: number
  ecoshapeID: number
  reviewID: number
  presenceMarkup: string
  usageTypeMarkup: string
  ecoshapeReviewNotes: string
  reference: string
  removalReason: string
}

export interface Presence {
  ecoshapeID: number
  rangeMapID: number
  presence: string
  rangeMapEcoshapeNotes: string
}

export interface UsageType {
  ecoShapeID: number
  rangeMapID: number
  usageType: string
  rangeMapUsageTypeNotes: string
}

export interface Ecoshape {
  objectID: number
  ecoshapeID: number
  ecoshapeName: string
  ecozone: string
  parentEcoregion: string
  terrestrialArea: number
  terrestrialProportion: number
}
