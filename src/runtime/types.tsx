export interface Taxon {
  name: string
  species: Specie[]
}

export interface Specie {
  name: string
  reviewID: string
  rangeMapID: string
  rangeVersion: string
  rangeStage: string
  rangeMetadata: string
  rangeMapNotes: string
  rangeMapScope: string
  nsxUrl: string
  differentiateUsageType: string
}
