import { DataSource, DataSourceStatus, type FeatureLayerDataSource, type QueriableDataSource, QueryOptions, type QueryParams, React } from 'jimu-core'
import defaultMessages from './translations/default'
import { useEffect } from 'react'
import { type Presence, type Ecoshape, type EcoshapeReview, type Specie, type UsageType, DataSourceLabel } from './types'
import { Button, TextArea, Select, Option, Label } from 'jimu-ui'
import Graphic from 'esri/Graphic'

export default function EcoshapeMarkup(props: {
  username: string
  selectedEcoshapes: Ecoshape[]
  setSelectedEcoshapes: React.Dispatch<React.SetStateAction<Ecoshape[]>>
  activeSpecie: Specie
  ecoshapeLayer: __esri.FeatureLayer
  presencelayer: __esri.FeatureLayer
  usageTypeLayer: __esri.FeatureLayer
  presenceMarkupLayer: __esri.FeatureLayer
  usageTypeMarkupLayer: __esri.FeatureLayer
  // presenceMarkupDs: FeatureLayerDataSource
  ecoshapeReviewTable: __esri.FeatureLayer
  ecoshapeDs: DataSource
  setDisplayOverallFeedback: React.Dispatch<React.SetStateAction<boolean>>
  setDisplaySpeciesOverview: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const [selectedEcoshapeReviewRecords, setSelectedEcoshapeReviewRecords] = React.useState<EcoshapeReview[]>([])
  const [selectedPresenceRecords, setSelectedPresenceRecords] = React.useState<Presence[]>([])
  const [selectedUsageTypeRecords, setSelectedUsageTypeRecords] = React.useState<UsageType[]>([])

  const [presenceMarkupSelect, setPresenceMarkupSelect] = React.useState<string>('')
  const [removalReasonSelect, setRemovalReasonSelect] = React.useState<string>('')
  const [ecoshapeReviewComment, setEcoshapeReviewComment] = React.useState<string>('')
  const [reference, setReference] = React.useState<string>('')
  const [usageTypeMarkupSelect, setUsageTypeMarkupSelect] = React.useState<string>('')

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
        props.ecoshapeReviewTable.queryFeatures({
          where: `ecoshapeid in (${props.selectedEcoshapes.map(x => x.ecoshapeID).join(',')}) and reviewid = ${props.activeSpecie.reviewID}`,
          outFields: ['objectid', 'ecoshapeid', 'reviewid', 'markup', 'usagetypemarkup', 'ecoshapereviewnotes', 'reference', 'removalreason']
        }).then((result) => {
          if (result.features.length > 0) {
            setSelectedEcoshapeReviewRecords(result.features.map(r => {
              const data = r.attributes
              console.log(data)
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
            })
            )
          } else {
            setSelectedEcoshapeReviewRecords([])
          }
        })

        // get select presence records
        props.presencelayer.queryFeatures({
          where: `ecoshapeid in (${props.selectedEcoshapes.map(x => x.ecoshapeID).join(',')})`,
          outFields: ['ecoshapeid', 'rangemapid', 'presence', 'rangemapecoshapenotes']
        }).then((result) => {
          if (result.features.length > 0) {
            setSelectedPresenceRecords(result.features.map(r => {
              const data = r.attributes
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
        props.usageTypeLayer.queryFeatures({
          where: `ecoshapeid in (${props.selectedEcoshapes.map(x => x.ecoshapeID).join(',')})`,
          outFields: ['ecoshapeid', 'rangemapid', 'usagetype', 'rangemapusagetypenotes']
        }).then((result) => {
          if (result.features.length > 0) {
            setSelectedUsageTypeRecords(result.features.map(r => {
              const data = r.attributes
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
  }

  const handleBackButton = () => {
    clearSelection()
    props.setDisplaySpeciesOverview(true)
    props.setDisplayOverallFeedback(false)
  }

  const handleSaveButton = () => {
    // Apply edits for insert ecoshape review record
    if (!ecoshapeReviewComment) {
      alert('Please provide markup comments')
      return
    }

    if (presenceMarkupSelect === 'R' && !removalReasonSelect) {
      alert('Please provide removal reason')
      return
    }
    const attributes = {
      reviewid: props.activeSpecie.reviewID,
      ecoshapereviewnotes: ecoshapeReviewComment,
      username: props.username,
      removalreason: null,
      reference: reference === '' ? null : reference,
      markup: presenceMarkupSelect !== '' ? presenceMarkupSelect : null,
      usagetypemarkup: usageTypeMarkupSelect !== '' ? usageTypeMarkupSelect : null
    }

    const ecoshapeIDs = props.selectedEcoshapes.map(x => x.ecoshapeID)
    const reviewedEcoshapeIDs = selectedEcoshapeReviewRecords.map(x => x.ecoshapeID)
    const rangeMapEcoshapeIDs = selectedPresenceRecords.map(x => x.ecoshapeID)
    const usageTypeEcoshapeIDs = selectedUsageTypeRecords.map(x => x.ecoShapeID)

    const applyEditsPromises = []
    if (selectedEcoshapeReviewRecords.length !== 0) {
      const graphicObjs = []
      for (let i = 0; i < selectedEcoshapeReviewRecords.length; i++) {
        const temp = JSON.parse(JSON.stringify(attributes))

        // If the ecoshape is not in the range map and the presence markup is 'R' then skip
        // The user should use the delete button to remove such markup
        if (temp.markup === 'R' && !rangeMapEcoshapeIDs.includes(selectedEcoshapeReviewRecords[i].ecoshapeID)) {
          continue
        }

        // If the presence markup is the same as the presence value in the presence layer, skip
        const currentPresenceRecord = selectedPresenceRecords.find(r => r.ecoshapeID === selectedEcoshapeReviewRecords[i].ecoshapeID)
        if (currentPresenceRecord && currentPresenceRecord.presence === temp.markup) {
          if (temp.usagetypemarkup) temp.markup = null
          else continue
        }

        // If the usage type markup is 'N' and the ecoshape is not in the range map, then skip
        // The user should use the delete button to remove such markup
        if ((temp.usagetypemarkup === 'N') && !usageTypeEcoshapeIDs.includes(selectedEcoshapeReviewRecords[i].ecoshapeID)) {
          if (!temp.markup) continue
          else temp.usagetypemarkup = null
        }

        // If the usage type markup is the same as the usage type value in the usage type layer, skip
        const currentUsageTypeRecord = selectedUsageTypeRecords.find(r => r.ecoShapeID === selectedEcoshapeReviewRecords[i].ecoshapeID)
        if (currentUsageTypeRecord && currentUsageTypeRecord.usageType === temp.usagetypemarkup) {
          if (temp.markup) temp.usagetypemarkup = null
          else continue
        }

        // Is the ecoshape is not in range, usage type markup is only allowed when there is a presence markup(and value is not 'R')
        // The case where the presence markup is 'R' and the usage type markup is not 'N' is handled above
        if (!temp.markup && !temp.usagetypemarkup && !rangeMapEcoshapeIDs.includes(selectedEcoshapeReviewRecords[i].ecoshapeID)) {
          temp.usagetypemarkup = null
        }

        if (temp.markup === 'R') {
          temp.usagetypemarkup = null
        }

        temp.objectid = selectedEcoshapeReviewRecords[i].objectID
        graphicObjs.push(new Graphic({ attributes: temp }))
      }
      applyEditsPromises.push(props.ecoshapeReviewTable.applyEdits({ updateFeatures: graphicObjs }))
    }

    const insertecoshapeIDs = ecoshapeIDs.filter(x => !reviewedEcoshapeIDs.includes(x))
    if (insertecoshapeIDs.length !== 0) {
      const graphicObjs = []
      for (let i = 0; i < insertecoshapeIDs.length; i++) {
        const temp = JSON.parse(JSON.stringify(attributes))

        if ((temp.markup === 'R' || !temp.markup) && !rangeMapEcoshapeIDs.includes(insertecoshapeIDs[i])) continue

        const currentPresenceRecord = selectedPresenceRecords.find(r => r.ecoshapeID === insertecoshapeIDs[i])
        if (currentPresenceRecord && currentPresenceRecord.presence === temp.markup) {
          if (temp.usagetypemarkup) temp.markup = null
          else continue
        }

        if ((temp.usagetypemarkup === 'N') && !usageTypeEcoshapeIDs.includes(insertecoshapeIDs[i])) {
          if (!temp.markup) continue
          else temp.usagetypemarkup = null
        }

        const currentUsageTypeRecord = selectedUsageTypeRecords.find(r => r.ecoShapeID === insertecoshapeIDs[i])
        if (currentUsageTypeRecord && currentUsageTypeRecord.usageType === temp.usagetypemarkup) {
          if (temp.markup) temp.usagetypemarkup = null
          else continue
        }

        temp.ecoshapeid = insertecoshapeIDs[i]
        graphicObjs.push(new Graphic({ attributes: temp }))
      }
      applyEditsPromises.push(props.ecoshapeReviewTable.applyEdits({ addFeatures: graphicObjs }))
    }
    Promise.all(applyEditsPromises).then(() => {
      clearSelection()
      props.presenceMarkupLayer.refresh()
      props.usageTypeMarkupLayer.refresh()
    }
    ).catch((error) => {
      console.error(error)
    }
    )
  }

  const handleDeleteButton = () => {
    const deleteFeatures = selectedEcoshapeReviewRecords
      .filter(r => props.selectedEcoshapes.map(x => x.ecoshapeID).includes(r.ecoshapeID))
      .map(r => { return { objectId: r.objectID } })
    props.ecoshapeReviewTable.applyEdits({
      deleteFeatures: deleteFeatures
    }).then(() => {
      clearSelection()
      props.presenceMarkupLayer.refresh()
      props.usageTypeMarkupLayer.refresh()
    }).catch((error) => {
      console.error(error)
    }
    )
  }

  React.useEffect(() => {
    if (selectedEcoshapeReviewRecords && selectedEcoshapeReviewRecords.length === 1 &&
      props.selectedEcoshapes.length === 1
    ) {
      if (selectedEcoshapeReviewRecords[0].presenceMarkup) {
        setPresenceMarkupSelect(selectedEcoshapeReviewRecords[0].presenceMarkup)
      }
      if (selectedEcoshapeReviewRecords[0].removalReason) {
        setRemovalReasonSelect(selectedEcoshapeReviewRecords[0].removalReason)
      }
      if (selectedEcoshapeReviewRecords[0].ecoshapeReviewNotes) {
        setEcoshapeReviewComment(selectedEcoshapeReviewRecords[0].ecoshapeReviewNotes)
      }
      if (selectedEcoshapeReviewRecords[0].usageTypeMarkup) {
        setUsageTypeMarkupSelect(selectedEcoshapeReviewRecords[0].usageTypeMarkup)
      }
    } else {
      setPresenceMarkupSelect('')
      setRemovalReasonSelect('')
      setEcoshapeReviewComment('')
      setUsageTypeMarkupSelect('')
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
        {props.activeSpecie.differentiateUsageType === 1 && (
          <>
            <p>{defaultMessages.usageType} {defaultMessages.markup}</p>
            <Select value={usageTypeMarkupSelect} onChange={(e) => { setUsageTypeMarkupSelect(e.target.value) }}>
              {
                usageTypeMarkupOptions && Object.keys(usageTypeMarkupOptions)
                  .filter(key => {
                    let optionToExclude = ''
                    if (selectedUsageTypeRecords && selectedUsageTypeRecords.length !== 0) {
                      // If all selected usage type records have the same usage type value, exclude that value from the options
                      if (selectedUsageTypeRecords &&
                        selectedUsageTypeRecords.length === props.selectedEcoshapes.length &&
                        selectedUsageTypeRecords.every(r => r.usageType === selectedUsageTypeRecords[0].usageType)
                      ) {
                        optionToExclude = selectedUsageTypeRecords[0].usageType
                      }
                    } else {
                      // If all selected ecoshapes not in existing range, exclude 'N' from the options
                      optionToExclude = 'N'
                    }
                    if (optionToExclude) {
                      return key !== optionToExclude
                    }
                    return true
                  })
                  .map((key) => (
                    <Option value={key}>{usageTypeMarkupOptions[key]}</Option>
                  ))
              }
              <Option value={''}>None Set</Option>
            </Select>
          </>
        )}
        <Label>{defaultMessages.comment}:</Label>
        <TextArea value={ecoshapeReviewComment} onChange={(e) => { setEcoshapeReviewComment(e.target.value) }} />
        <Label>{defaultMessages.reference}:</Label>
        <TextArea value={reference} onChange={(e) => { setReference(e.target.value) }} />

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
