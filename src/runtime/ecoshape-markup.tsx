import { DataSourceStatus, type FeatureLayerDataSource, type QueriableDataSource, QueryOptions, type QueryParams, React } from 'jimu-core'
import defaultMessages from './translations/default'
import { useEffect } from 'react'
import { type Presence, type Ecoshape, type EcoshapeReview, type Specie, type UsageType } from './types'
import { Button, TextArea, Select, Option, Label } from 'jimu-ui'

export default function EcoshapeMarkup(props: {
  widgetId: string
  selectedEcoshapes: Ecoshape[]
  setSelectedEcoshapes: React.Dispatch<React.SetStateAction<Ecoshape[]>>
  activeSpecie: Specie
  ecoshapeDs: QueriableDataSource
  presenceDs: QueriableDataSource
  usageTypeDs: QueriableDataSource
  presenceMarkupDs: FeatureLayerDataSource
  ecoshapeReviewDs: QueriableDataSource
  setDisplayOverallFeedback: React.Dispatch<React.SetStateAction<boolean>>
  setDisplaySpeciesOverview: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const [selectedEcoshapeReviewRecords, setSelectedEcoshapeReviewRecords] = React.useState<EcoshapeReview[]>([])
  const [selectedPresenceRecords, setSelectedPresenceRecords] = React.useState<Presence[]>([])
  const [selectedUsageTypeRecords, setSelectedUsageTypeRecords] = React.useState<UsageType[]>([])

  const [presenceMarkupSelect, setPresenceMarkupSelect] = React.useState<string>('')
  const [removalReasonSelect, setRemovalReasonSelect] = React.useState<string>('')
  const [ecoshapeReviewComment, setEcoshapeReviewComment] = React.useState<string>('')

  const presenceMarkupOptions = {
    P: defaultMessages.present,
    X: defaultMessages.presenceExpected,
    H: defaultMessages.historical,
    R: defaultMessages.remove
  }

  const removalReasonOptions = {
    X: defaultMessages.removalReason1,
    N: defaultMessages.removalReason2,
    F: defaultMessages.removalReason3,
    T: defaultMessages.removalReason4,
    O: defaultMessages.removalReason5
  }

  const usageTypeMarkupOptions = {
    B: defaultMessages.breeding,
    P: defaultMessages.possibleBreeding,
    N: defaultMessages.nonBreeding
  }

  useEffect(() => {
    if (props.selectedEcoshapes) {
      if (props.selectedEcoshapes.length > 0) {
        // Get the selected ecoshape review records
        props.ecoshapeReviewDs.query({
          where: `ecoshapeid in (${props.selectedEcoshapes.map(x => x.ecoshapeID).join(',')}) and reviewid = ${props.activeSpecie.reviewID}`,
          outFields: ['ecoshapeid', 'reviewid', 'markup', 'usagetypemarkup', 'ecoshapereviewnotes', 'reference', 'removalreason']
        } as QueryParams).then((result) => {
          if (result.records.length > 0) {
            setSelectedEcoshapeReviewRecords(result.records.map(r => {
              const data = r.getData()
              return {
                objectID: data.objectid,
                ecoshapeID: data.ecoshapeid,
                reviewID: data.reviewid,
                presenceMarkup: data.markup,
                usageTypeMarkup: data.usagetypemarkup,
                ecoshapeReviewNotes: data.ecoshapereviewnotes,
                reference: data.reference,
                removalReason: data.removalreason
              }
            }))
          } else {
            setSelectedEcoshapeReviewRecords([])
          }
        })

        // get select presence records
        props.presenceDs.query({
          where: `ecoshapeid in (${props.selectedEcoshapes.map(x => x.ecoshapeID).join(',')})`,
          outFields: ['ecoshapeid', 'rangemapid', 'presence', 'rangemapecoshapenotes']
        } as QueryParams).then((result) => {
          if (result.records.length > 0) {
            setSelectedPresenceRecords(result.records.map(r => {
              const data = r.getData()
              return {
                ecoshapeID: data.ecoshapeid,
                rangeMapID: data.rangemapid,
                presence: data.presence,
                rangeMapEcoshapeNotes: data.rangemapecoshapenotes
              }
            })
            )
          } else {
            setSelectedPresenceRecords([])
          }
        })

        // get selected UsageType records
        props.usageTypeDs.query({
          where: `ecoshapeid in (${props.selectedEcoshapes.map(x => x.ecoshapeID).join(',')})`,
          outFields: ['ecoshapeid', 'rangemapid', 'usagetype', 'rangemapusagetypenotes']
        } as QueryParams).then((result) => {
          if (result.records.length > 0) {
            setSelectedUsageTypeRecords(result.records.map(r => {
              const data = r.getData()
              return {
                ecoShapeID: data.ecoshapeid,
                rangeMapID: data.rangemapid,
                usageType: data.usagetype,
                rangeMapUsageTypeNotes: data.rangemapusagetypenotes
              }
            })
            )
          } else {
            setSelectedUsageTypeRecords([])
          }
        })
      }
    }
  }, [props.selectedEcoshapes]) // eslint-disable-line react-hooks/exhaustive-deps

  const clearSelection = () => {
    props.ecoshapeDs.clearSelection()
    console.log('clearing selection')
    props.setSelectedEcoshapes(null)
  }

  const handleBackButton = () => {
    clearSelection()
    props.setDisplaySpeciesOverview(true)
    props.setDisplayOverallFeedback(false)
  }

  const handleSaveButton = () => {
    // Apply edits for insert ecoshape review record
  }

  const handleDeleteButton = () => {
    // Apply edits for delete ecoshape review record
    const deleteFeatures = selectedEcoshapeReviewRecords
      .filter(r => props.selectedEcoshapes.map(x => x.ecoshapeID).includes(r.ecoshapeID))
      .map(r => { return { objectId: r.objectID } })
    const ecoshapeReviewDs = props.ecoshapeReviewDs as FeatureLayerDataSource
    ecoshapeReviewDs.layer.applyEdits({
      deleteFeatures: deleteFeatures
    }).then((results) => {
      console.log('Ecoshape review record deleted')
    }).catch((error) => {
      console.log('Error deleting ecoshape review record')
      console.log(error)
    })
  }

  React.useEffect(() => {
    if (selectedEcoshapeReviewRecords && selectedEcoshapeReviewRecords.length === 1 &&
      props.selectedEcoshapes.length === 1
    ) {
      setPresenceMarkupSelect(selectedEcoshapeReviewRecords[0].presenceMarkup)
      setRemovalReasonSelect(selectedEcoshapeReviewRecords[0].removalReason)
      setEcoshapeReviewComment(selectedEcoshapeReviewRecords[0].ecoshapeReviewNotes)
    } else {
      setPresenceMarkupSelect('')
      setRemovalReasonSelect('')
      setEcoshapeReviewComment('')
    }
  }, [props.selectedEcoshapes, selectedEcoshapeReviewRecords])

  return (
    <div className='container'>
      {props.selectedEcoshapes.length === 1 && (
        <>
          <div className='row'>
            <div className='col'>
              <h2>{defaultMessages.ecoshapeName}: {props.selectedEcoshapes[0].ecoshapeName}</h2>
            </div>
          </div>
          <hr />
          <div className='row'>
            <div className='col'>
              <b>{defaultMessages.parentEcoregion}:</b> {props.selectedEcoshapes[0].parentEcoregion}
            </div>
          </div>
          <div className='row'>
            <div className='col'>
              <b>{defaultMessages.ecozone}:</b> {props.selectedEcoshapes[0].ecozone}
            </div>
          </div>
          <div className='row'>
            <div className='col'>
              <b>{defaultMessages.terrestrialArea}:</b> {props.selectedEcoshapes[0].terrestrialArea} km<sup>2</sup>
            </div>
          </div>
          <div className='row'>
            <div className='col'>
              <b>{defaultMessages.terrestrialProportion}:</b> {props.selectedEcoshapes[0].terrestrialProportion}%
            </div>
          </div>
          <div className='row'>
            <div className='col'>
              <b>{defaultMessages.presence}:</b> {
                selectedPresenceRecords && selectedPresenceRecords.length !== 0
                  ? selectedPresenceRecords[0].presence
                  : null
              }
            </div>
          </div>
          <div className='row'>
            <div className='col'>
              <b>{defaultMessages.usageType}:</b> {
                selectedUsageTypeRecords && selectedUsageTypeRecords.length !== 0
                  ? selectedUsageTypeRecords[0].usageType
                  : null
              }
            </div>
          </div>
          <div className='row'>
            <div className='col'>
              <b>{defaultMessages.ecoshapeSpecies}:</b> {props.activeSpecie.name}
            </div>
          </div>
          <div className='row'>
            <div className='col'>
              <b>{defaultMessages.metadata}:</b> {props.activeSpecie.rangeMetadata}
            </div>
          </div>
        </>
      )
      }
      {
        props.selectedEcoshapes.length > 1 && (
          <>
            <div className='row'>
              <div className='col'>
                <h2>{defaultMessages.multipleEcoshapes}</h2>
              </div>
            </div>
            <hr />
            <div className='row'>
              <div className='col'>
                <b>{defaultMessages.warning}:</b> {defaultMessages.warning1}. {defaultMessages.warning2}.
              </div>
            </div>
          </>
        )
      }
      <div className='row'>
        <p>{defaultMessages.presence} {defaultMessages.markup}</p>
        <Select value={presenceMarkupSelect} onChange={(e) => { setPresenceMarkupSelect(e.target.value) }}>
          {
            presenceMarkupOptions && Object.keys(presenceMarkupOptions).filter(key => {
              let optionToExclude = ''
              if (selectedPresenceRecords && selectedPresenceRecords.length !== 0) {
                // If all selected presence records have the same presence value, exclude that value from the options
                if (selectedPresenceRecords &&
                  selectedPresenceRecords.length === props.selectedEcoshapes.length &&
                  selectedPresenceRecords.every(r => r.presence === selectedPresenceRecords[0].presence)
                ) {
                  optionToExclude = selectedPresenceRecords[0].presence
                }
              } else {
                // If all selected ecoshapes not in existing range, exclude 'R' from the options
                optionToExclude = 'R'
              }
              if (optionToExclude) {
                return key !== optionToExclude
              }
              return true
            }).map((key) => (
              <Option value={key}>{presenceMarkupOptions[key]}</Option>
            ))
          }
          <Option value={''}>None Set</Option>
        </Select>
        {presenceMarkupSelect === 'R' && (
          <>
            <Label>{defaultMessages.removalReason} ({defaultMessages.required}):</Label>
            <Select defaultValue={removalReasonSelect} onChange={(e) => { setRemovalReasonSelect(e.target.value) }}>
              {
                removalReasonOptions && Object.keys(removalReasonOptions).map((key) => (
                  <Option value={key}>{removalReasonOptions[key]}</Option>
                ))
              }
              <Option value={''}>None Set</Option>
            </Select>
          </>
        )}
        <Label>{defaultMessages.comment}:</Label>
        <TextArea value={ecoshapeReviewComment} />

      </div>
      <div className='row'>
        <div className='col'>
          <Button onClick={handleBackButton}>Back</Button>
        </div>
        <div className='col'>
          <Button onClick={handleDeleteButton}>Delete Markup</Button>
        </div>
        <div className='col'>
          <Button onClick={handleSaveButton}>Save</Button>
        </div>
      </div>
    </div >
  )
}
