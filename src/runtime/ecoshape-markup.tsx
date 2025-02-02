import { DataSourceStatus, type QueriableDataSource, type QueryParams, React } from 'jimu-core'
import defaultMessages from './translations/default'
import { useEffect } from 'react'
import { type Presence, type Ecoshape, type EcoshapeReview, type Specie, type UsageType } from './types'
import { Button, TextArea, Select, Option, Label } from 'jimu-ui'

export default function EcoshapeMarkup(props: {
  selectedIds: string[]
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>
  activeSpecie: Specie
  ecoshapeDs: QueriableDataSource
  presenceDs: QueriableDataSource
  usageTypeDs: QueriableDataSource
  ecoshapeReviewDs: QueriableDataSource
  setDisplayOverallFeedback: React.Dispatch<React.SetStateAction<boolean>>
  setDisplaySpeciesOverview: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const [ecoshape, setEcoshape] = React.useState<Ecoshape>(null)
  const [selectedEcoshapeReviewRecords, setSelectedEcoshapeReviewRecords] = React.useState<EcoshapeReview[]>([])
  const [selectedPresenceRecords, setSelectedPresenceRecords] = React.useState<Presence[]>([])
  const [selectedUsageTypeRecords, setSelectedUsageTypeRecords] = React.useState<UsageType[]>([])
  const [presenceMarkupSelect, setPresenceMarkupSelect] = React.useState<string>('')
  const [removalReasonSelect, setRemovalReasonSelect] = React.useState<string>('')

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
    O: defaultMessages.removalReason5,
  }

  const usageTypeMarkupOptions = {
    B: defaultMessages.breeding,
    P: defaultMessages.possibleBreeding,
    N: defaultMessages.nonBreeding
  }

  useEffect(() => {
    if (props.selectedIds) {
      if (props.selectedIds.length > 0) {
        // Get the selected ecoshape review records
        props.ecoshapeReviewDs.query({
          where: `ecoshapeid in (${props.selectedIds.join(',')}) and reviewid = ${props.activeSpecie.reviewID}`,
          outFields: ['ecoshapeid', 'reviewid', 'markup', 'usagetypemarkup', 'ecoshapereviewnotes', 'reference', 'removalreason']
        } as QueryParams).then((result) => {
          if (result.records.length > 0) {
            setSelectedEcoshapeReviewRecords(result.records.map(r => {
              const data = r.getData()
              return {
                ecoshapeID: data.ecoshapeid,
                reviewID: data.reviewid,
                markup: data.markup,
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
          where: `ecoshapeid in (${props.selectedIds.join(',')})`,
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
          where: `ecoshapeid in (${props.selectedIds.join(',')})`,
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

      if (props.selectedIds.length === 1 && props.ecoshapeDs) {
        props.ecoshapeDs.query({
          where: `ecoshapeid = ${props.selectedIds[0]}`,
          outFields: ['*']
        } as QueryParams).then((result) => {
          console.log(props.selectedIds)
          const data = result.records[0].getData()
          setEcoshape({
            parentEcoregion: data.parentecoregion,
            ecozone: data.ecozone,
            terrestrialArea: Math.round((data.terrestrialarea / 1000000) * 100) / 100,
            name: data.ecoshapename,
            terrestrialProportion: Math.round(data.terrestrialproportion * 100 * 10) / 10
          })
        })
      }
    }
  }, [props.selectedIds]) // eslint-disable-line

  const clearSelection = () => {
    props.ecoshapeDs.clearSelection()
    props.setSelectedIds(null)
  }

  const handleBackButton = () => {
    clearSelection()
    props.setDisplaySpeciesOverview(true)
    props.setDisplayOverallFeedback(false)
  }

  return (
    <div className='container'>
      {props.selectedIds.length === 1 && ecoshape && (
        <>
          <div className='row'>
            <div className='col'>
              <h2>{defaultMessages.ecoshapeName}: {ecoshape.name}</h2>
            </div>
          </div>
          <hr />
          <div className='row'>
            <div className='col'>
              <b>{defaultMessages.parentEcoregion}:</b> {ecoshape.parentEcoregion}
            </div>
          </div>
          <div className='row'>
            <div className='col'>
              <b>{defaultMessages.ecozone}:</b> {ecoshape.ecozone}
            </div>
          </div>
          <div className='row'>
            <div className='col'>
              <b>{defaultMessages.terrestrialArea}:</b> {ecoshape.terrestrialArea} km<sup>2</sup>
            </div>
          </div>
          <div className='row'>
            <div className='col'>
              <b>{defaultMessages.terrestrialProportion}:</b> {ecoshape.terrestrialProportion}%
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
        props.selectedIds.length > 1 && (
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
        <div className='col'>
          <p>{defaultMessages.presence} {defaultMessages.markup}</p>
          <Select defaultValue={''} onChange={(e) => { setPresenceMarkupSelect(e.target.value) }}>
            {
              presenceMarkupOptions && Object.keys(presenceMarkupOptions).filter(key => {
                const presence = selectedPresenceRecords && selectedPresenceRecords.length !== 0 ? selectedPresenceRecords[0].presence : null
                console.log(presence)
                if (presence) {
                  return key !== presence
                }
                return key !== 'R'
              }).map((key) => (
                <Option value={key}>{presenceMarkupOptions[key]}</Option>
              ))
            }
            <Option value={''}>None Set</Option>
          </Select>
          {presenceMarkupSelect === 'R' && (
            <>
              <Label>{defaultMessages.removalReason} ({defaultMessages.required}):</Label>
              <Select defaultValue={''} onChange={(e) => { setRemovalReasonSelect(e.target.value) }}>
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
          <TextArea />

        </div>
      </div>
      <div className='row'>
        <div className='col'>
          <Button onClick={handleBackButton}>Back</Button>
        </div>
        <div className='col'>
          <Button onClick={handleBackButton}>Save</Button>
        </div>
      </div>
    </div >
  )
}
