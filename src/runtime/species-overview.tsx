import React from 'react'
import { Select, Option, Button } from 'jimu-ui'
import { type Taxon, type Specie, type SpecieFeedback } from './types'

export default function SpeciesOverview(props: {
  nls: (id: string) => string
  taxa: Taxon[]
  activeSpecie: Specie
  setActiveSpecie: (specie: Specie) => void
  specieFeedback: SpecieFeedback
  setDisplayOverallFeedback: React.Dispatch<React.SetStateAction<boolean>>
  setDisplaySpeciesOverview: React.Dispatch<React.SetStateAction<boolean>>

}) {
  function handleSelectChange(e: any) {
    const selectedSpecieName = e.target.value
    // find the selected specie
    const selectedTaxon = props.taxa.find(taxon => taxon.species.find(specie => specie.name === selectedSpecieName))
    const selectedSpecie = selectedTaxon.species.find(specie => specie.name === selectedSpecieName)
    props.setActiveSpecie(selectedSpecie)
  }

  function handleOverallFeedback() {
    props.setDisplaySpeciesOverview(false)
    props.setDisplayOverallFeedback((prev: boolean) => !prev)
  }
  return (
    <div className='container'>
      <div className='row'>
        <div className='col p-0'>
          <Select value={props.activeSpecie?.name} placeholder={props.nls('selectSpecies')} onChange={handleSelectChange}>
            {props.taxa.map((group, groupIndex) => {
              // Generate header and items
              const groupElements = [
                <Option key={`${group.name}-header`} header>
                  {group.name}
                </Option>,
                ...group.species.map((specie, specieIndex) => (
                  <Option key={`${group.name}-${specie.name}`} value={specie.name}>
                    {specie.name}
                  </Option>
                ))
              ]

              // Add divider unless it's the last group
              if (groupIndex !== props.taxa.length - 1) {
                groupElements.push(
                  <Option key={`${group.name}-divider`} divider />
                )
              }

              return groupElements
            })}
          </Select>
        </div>
      </div>
      {props.activeSpecie && (
        <div className='container mt-2 p-0'>
          {
            props.specieFeedback?.dateCompleted && (
              <div className='row'>
                <div className='col p-0'>
                  <b style={{ color: '#B80F0A' }}>
                    {props.nls('review_submitted')}
                  </b>: {props.nls('reviewSubmitted')}
                </div>
              </div>
            )
          }
          <div className='row'><div className='col p-0'><b>{props.nls('rangeVersion')}:</b> {props.activeSpecie.rangeVersion}</div></div>
          <div className='row'><div className='col p-0'><b>{props.nls('rangeStage')}:</b> {props.activeSpecie.rangeStage}</div></div>
          <div className='row'><div className='col p-0'><b>{props.nls('rangeScope')}:</b> {props.activeSpecie.rangeMapScope}</div></div>
          <div className='row'>
            <div className='col p-0'><b>{props.nls('speciesInformation')}:</b> <a href={props.activeSpecie.nsxUrl} target="_blank" rel="noopener noreferrer">{props.nls('gotoNSExplorer')}</a></div>
          </div>
          <div className='row'><div className='col p-0'><b>{props.nls('metadata')}:</b> {props.activeSpecie.rangeMetadata}</div></div>
          <div className='row'>
            <div className='col p-0'><Button onClick={handleOverallFeedback}>{props.nls('overallFeedback')}</Button></div>
          </div>
        </div>
      )
      }
    </div>
  )
}
