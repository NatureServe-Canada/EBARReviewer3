import React from 'react'
import { Select, Option, Button } from 'jimu-ui'
import { type Taxon, type Specie } from './types'
import defaultMessages from './translations/default'

export default function SpeciesOverview(props: {
  taxa: Taxon[]
  activeSpecie: Specie
  setActiveSpecie: (specie: Specie) => void
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
          <Select value={props.activeSpecie?.name} placeholder={defaultMessages.selectSpecies} onChange={handleSelectChange}>
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
          <div className='row'><div className='col p-0'><b>{defaultMessages.rangeVersion}:</b> {props.activeSpecie.rangeVersion}</div></div>
          <div className='row'><div className='col p-0'><b>{defaultMessages.rangeStage}:</b> {props.activeSpecie.rangeStage}</div></div>
          <div className='row'><div className='col p-0'><b>{defaultMessages.rangeScope}:</b> {props.activeSpecie.rangeMapScope}</div></div>
          <div className='row'>
            <div className='col p-0'><b>{defaultMessages.speciesInformation}:</b> <a href={props.activeSpecie.nsxUrl} target="_blank" rel="noopener noreferrer">{defaultMessages.gotoNSExplorer}</a></div>
          </div>
          <div className='row'><div className='col p-0'><b>{defaultMessages.metadata}:</b> {props.activeSpecie.rangeMetadata}</div></div>
          <div className='row'>
            <div className='col p-0'><Button onClick={handleOverallFeedback}>{defaultMessages.overallFeedback}</Button></div>
          </div>
        </div>
      )
      }
    </div>
  )
}
