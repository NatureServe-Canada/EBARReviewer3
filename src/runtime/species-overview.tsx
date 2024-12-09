import React from 'react'
import { Select, Option } from 'jimu-ui'
import { type Taxon, type Specie } from './types'

export default function SpeciesOverview(props: { taxa: Taxon[], setActiveSpecie: (specie: Specie) => void }) {
  function handleSelectChange(e: any) {
    const selectedSpecieName = e.target.value
    // find the selected specie
    const selectedTaxon = props.taxa.find(taxon => taxon.species.find(specie => specie.name === selectedSpecieName))
    const selectedSpecie = selectedTaxon.species.find(specie => specie.name === selectedSpecieName)
    props.setActiveSpecie(selectedSpecie)
  }
  return (
    <div className='container'>
      <div className='row'>
        <div className='col'>
          <Select placeholder='Select a specie' onChange={handleSelectChange}>
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
    </div>
  )
}
