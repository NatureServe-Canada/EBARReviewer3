import {
  React,
  type AllWidgetProps,
  DataSourceManager,
  DataSourceComponent,
  type DataSource,
  type QueriableDataSource,
  type SqlQueryParams,
  type FeatureLayerDataSource,
  JimuMapViewStatus,
  getAppStore,
} from 'jimu-core'
import { type Taxon, type Specie, type SpecieFeedback, DataSourceLabel, type Ecoshape } from './types'
import SpeciesOverview from './species-overview'
import OverallFeedback from './overall-feedback'
// import { useEffect } from 'react'
import EcoshapeMarkup from './ecoshape-markup'
import { type JimuQueriableLayerView, type JimuMapView, JimuMapViewComponent } from 'jimu-arcgis'
import { Loading } from 'jimu-ui'

const nslogo = require('../assets/ns_canada.png')
/**
 * You can import the components from `@arcgis/map-components-react` or `arcgis-map-components`.
 * Use either of them, the components will not be compiled into the widget bundle, but loaded from the `arcgis-map-components` entry.
 */

const Widget = (props: AllWidgetProps<{ [key: string]: never }>) => {
  const [jimuMapView, setJimuMapView] = React.useState<JimuMapView>(null)
  const [taxa, setTaxa] = React.useState<Taxon[]>([])
  const [activeSpecie, setActiveSpecie] = React.useState<Specie>(null)
  const [displaySpeciesOverview, setDisplaySpeciesOverview] = React.useState<boolean>(true)
  const [displayOverallFeedback, setDisplayOverallFeedback] = React.useState<boolean>(false)
  const [specieFeedback, setSpecieFeedback] = React.useState<SpecieFeedback>(null)

  const [selectedEcoshapes, setSelectedEcoshapes] = React.useState<Ecoshape[]>([])
  const [ecoshapeDs, setEcoshapeDs] = React.useState<DataSource>(null)
  const [presenceLayer, setPresenceLayer] = React.useState<__esri.FeatureLayer>(null)
  const [usageTypeLayer, setUsageTypeLayer] = React.useState<__esri.FeatureLayer>(null)
  const [presenceMarkupLayer, setPresenceMarkupLayer] = React.useState<__esri.FeatureLayer>(null)
  const [usageTypeMarkupLayer, setUsageTypeMarkupLayer] = React.useState<__esri.FeatureLayer>(null)
  const [reviewTable, setReviewTable] = React.useState<__esri.FeatureLayer>(null)
  // const [speciesTable, setSpeciesTable] = React.useState<__esri.FeatureLayer>(null)
  const [ecoshapeReviewTable, setEcoshapeReviewTable] = React.useState<__esri.FeatureLayer>(null)
  const [ecoshapeLayer, setEcoshapeLayer] = React.useState<__esri.FeatureLayer>(null)

  React.useEffect(() => {
    if (jimuMapView && jimuMapView.status === JimuMapViewStatus.Loaded && props.user.username) {
      for (const [_, view] of Object.entries(jimuMapView.jimuLayerViews)) {
        if (view?.type === 'feature') {
          const layer = view.layer as __esri.FeatureLayer
          if (layer.title === DataSourceLabel.PRESENCE) {
            setPresenceLayer(layer)
          } else if (layer.title === DataSourceLabel.USAGE_TYPE) {
            setUsageTypeLayer(layer)
          } else if (layer.title === DataSourceLabel.PRESENCE_MARKUP) {
            setPresenceMarkupLayer(layer)
          } else if (layer.title === DataSourceLabel.USAGE_TYPE_MARKUP) {
            setUsageTypeMarkupLayer(layer)
          } else if (layer.title === DataSourceLabel.ECOSHAPE) {
            setEcoshapeLayer(layer)
          }
        }
      }
      // jimuMapView.jimuLayerViews.forEach((view) => {
      //   if (view.layer.title === DataSourceLabel.ECOSHAPE) {
      //     setEcoshapeLayer(view.layer as __esri.FeatureLayer)
      //   }
      // }
      // )
      // jimuMapView.whenAllJimuLayerViewLoaded().then((views) => {
      //   console.log(views)
      //   Object.entries(views).forEach(([_, view]) => {
      //     if (view.type === 'feature') {
      //       // const layerView = view.view as __esri.LayerView
      //       const layer = view.layer as __esri.FeatureLayer
      //       if (layer.title === DataSourceLabel.PRESENCE) {
      //         setPresenceLayer(layer)
      //       } else if (layer.title === DataSourceLabel.USAGE_TYPE) {
      //         setUsageTypeLayer(layer)
      //       } else if (layer.title === DataSourceLabel.PRESENCE_MARKUP) {
      //         setPresenceMarkupLayer(layer)
      //       } else if (layer.title === DataSourceLabel.USAGE_TYPE_MARKUP) {
      //         setUsageTypeMarkupLayer(layer)
      //       } else if (layer.title === DataSourceLabel.ECOSHAPE) {
      //         setEcoshapeLayer(layer)
      //       }
      //     }
      //   })
      // })
      const tables = jimuMapView?.view.map.allTables
      for (const table of tables) {
        if (table.title === DataSourceLabel.REVIEW) {
          setReviewTable(table as __esri.FeatureLayer)
        } else if (table.title === DataSourceLabel.SPECIES) {
          const speciesTable = table as __esri.FeatureLayer
          // setSpeciesTable(speciesTable)
          speciesTable.queryFeatures({
            where: `username='${props.user.username}' and includeinebarreviewer=1`,
            outFields: ['Username', 'ReviewID', 'RangeMapID', 'RangeVersion', 'RangeStage', 'RangeMetadata', 'RangeMapNotes', 'RangeMapScope', 'TAX_GROUP', 'NATIONAL_SCIENTIFIC_NAME', 'NSX_URL', 'DifferentiateUsageType']
          }).then((results) => {
            if (Array.isArray(results.features) && results.features.length !== 0) {
              const tempTaxa: Taxon[] = []
              results.features.forEach(x => {
                const taxGroup = x.attributes.tax_group
                const specie: Specie = {
                  name: x.attributes.national_scientific_name,
                  reviewID: x.attributes.reviewid,
                  rangeMapID: x.attributes.rangemapid,
                  rangeVersion: x.attributes.rangeversion,
                  rangeStage: x.attributes.rangestage,
                  rangeMetadata: x.attributes.rangemetadata,
                  rangeMapNotes: x.attributes.rangemapnotes,
                  rangeMapScope: x.attributes.rangemapscope,
                  nsxUrl: x.attributes.nsx_url,
                  differentiateUsageType: x.attributes.differentiateusagetype
                }
                const taxon = tempTaxa.find(x => x.name === taxGroup)
                if (taxon) {
                  taxon.species.push(specie)
                } else {
                  tempTaxa.push({
                    name: taxGroup,
                    species: [specie]
                  })
                }
              })
              setTaxa(tempTaxa)
            }
          }).catch((error) => {
            console.log(error)
          })
        } else if (table.title === DataSourceLabel.ECOSHAPE_REVIEW) {
          setEcoshapeReviewTable(table as __esri.FeatureLayer)
        }
      }
    }
  }, [jimuMapView, props.user.username])

  React.useEffect(() => {
    if (activeSpecie) {
      const extentPromises = []
      // for (const [_, view] of Object.entries(jimuMapView.jimuLayerViews)) {
      //   if (view?.type === 'feature') {
      //     const layer = view.layer as __esri.FeatureLayer
      //     const layerView = view.view as __esri.FeatureLayerView
      //     if (layer.title === DataSourceLabel.PRESENCE) {
      //       layerView.filter = new FeatureFilter({
      //         where: `rangemapid=${activeSpecie.rangeMapID}`
      //       })
      //     }
      //   }
      // }
      // jimuMapView.view.whenLayerView(presenceLayer).then((layerView) => {
      //   if (layerView) {
      //     let featureLayerView = layerView;
      //     featureLayerView.filter = new FeatureFilter({
      //       where: `rangemapid=${activeSpecie.rangeMapID}`
      //     })
      //   }
      // })

      presenceLayer.definitionExpression = `rangemapid=${activeSpecie.rangeMapID}`
      extentPromises.push(presenceLayer.queryExtent())
      presenceMarkupLayer.definitionExpression = `reviewid=${activeSpecie.reviewID} and markup is not null`
      extentPromises.push(presenceMarkupLayer.queryExtent())
      Promise.all(extentPromises).then((results) => {
        let extent = null
        if (results[1].count === 0) {
          extent = results[0].extent
        } else {
          extent = results[0].extent.union(results[1].extent)
        }
        jimuMapView.view.goTo(extent)
      })
      if (activeSpecie.differentiateUsageType === 1) {
        usageTypeLayer.definitionExpression = `rangemapid=${activeSpecie.rangeMapID}`
        usageTypeMarkupLayer.definitionExpression = `reviewid=${activeSpecie.reviewID}`
      } else {
        usageTypeLayer.definitionExpression = '1=0'
        usageTypeMarkupLayer.definitionExpression = '1=0'
      }
      reviewTable.queryFeatures({
        where: `reviewid=${activeSpecie.reviewID} and rangemapid=${activeSpecie.rangeMapID}`,
        outFields: ['*']
      }).then((results) => {
        if (Array.isArray(results.features) && results.features.length === 1) {
          const data = results.features[0].attributes
          setSpecieFeedback({
            reviewID: data.reviewid,
            rangeMapID: data.rangemapid,
            objectID: data.objectid,
            reviewNotes: data.reviewnotes,
            dateStarted: data.datestarted,
            dateCompleted: data.datecompleted,
            overallStarRating: data.overallstarrating
          })
        }
      }).catch((error) => {
        console.log(error)
      })
    }
  }, [activeSpecie]) // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (selectedEcoshapes && selectedEcoshapes.length > 0) {
      setDisplaySpeciesOverview(false)
      setDisplayOverallFeedback(false)
    } else {
      setDisplaySpeciesOverview(true)
    }
  }, [selectedEcoshapes])

  const onSelectionChange = (selection) => {
    if (selection && selection.length > 0 && activeSpecie) {
      // Fetch the data for selected species
      ecoshapeLayer.queryFeatures({
        objectIds: selection,
        outFields: ['objectid', 'ecoshapeid', 'ecoshapename', 'ecozone', 'parentecoregion', 'terrestrialarea', 'terrestrialproportion']
      }).then((results) => {
        const ecoshapes: Ecoshape[] = []
        results.features.forEach((feature) => {
          const data = feature.attributes
          ecoshapes.push({
            objectID: data.objectid,
            ecoshapeID: data.ecoshapeid,
            ecoshapeName: data.ecoshapename,
            ecozone: data.ecozone,
            parentEcoregion: data.parentecoregion,
            terrestrialArea: data.terrestrialarea,
            terrestrialProportion: data.terrestrialproportion
          })
        })
        setSelectedEcoshapes(ecoshapes)
      })
    } else {
      setSelectedEcoshapes([])
    }
  }

  const onActiveViewChange = (activeView: JimuMapView) => {
    if (!activeView) {
      return
    }
    setJimuMapView(activeView)
  }

  const onDataSourceCreated = (ds: DataSource) => {
    setEcoshapeDs(ds)
  }

  return (
    <div className="jimu-widget" style={{ overflow: 'auto' }}>
      <JimuMapViewComponent
        onActiveViewChange={onActiveViewChange}
        useMapWidgetId={props.useMapWidgetIds[0]}>
      </JimuMapViewComponent>
      <DataSourceComponent
        useDataSource={props.useDataSources[0]}
        widgetId={props.id}
        onDataSourceCreated={onDataSourceCreated}
        onSelectionChange={onSelectionChange}
      />
      {
        !jimuMapView || !taxa
          ? (<div><Loading /></div>)
          : (
            <div className='container'>
              <div className='row justify-content-between my-2'>
                {/* <div className='col align-self-start'>
              <h1>EBAR Reviewer</h1>
            </div> */}
                {/* <div className='col text-right'>
              <img src={nslogo} alt='NS Logo' style={{ height: '4rem' }} />
            </div> */}
              </div>
              {displaySpeciesOverview && (
                <SpeciesOverview
                  taxa={taxa}
                  setActiveSpecie={setActiveSpecie}
                  activeSpecie={activeSpecie}
                  specieFeedback={specieFeedback}
                  setDisplayOverallFeedback={setDisplayOverallFeedback}
                  setDisplaySpeciesOverview={setDisplaySpeciesOverview}
                />
              )}
              {displayOverallFeedback && (
                <OverallFeedback
                  activeSpecie={activeSpecie}
                  setDisplayOverallFeedback={setDisplayOverallFeedback}
                  setDisplaySpeciesOverview={setDisplaySpeciesOverview}
                  specieFeedback={specieFeedback}
                  setSpecieFeedback={setSpecieFeedback}
                  reviewTable={reviewTable}
                />
              )}
              {selectedEcoshapes && selectedEcoshapes.length > 0 && (
                <EcoshapeMarkup
                  username={props.user.username}
                  selectedEcoshapes={selectedEcoshapes}
                  setSelectedEcoshapes={setSelectedEcoshapes}
                  activeSpecie={activeSpecie}
                  ecoshapeLayer={ecoshapeLayer}
                  presencelayer={presenceLayer}
                  usageTypeLayer={usageTypeLayer}
                  presenceMarkupLayer={presenceMarkupLayer}
                  usageTypeMarkupLayer={usageTypeMarkupLayer}
                  ecoshapeReviewTable={ecoshapeReviewTable}
                  ecoshapeDs={ecoshapeDs}
                  specieFeedback={specieFeedback}
                  setDisplayOverallFeedback={setDisplayOverallFeedback}
                  setDisplaySpeciesOverview={setDisplaySpeciesOverview}
                />)}
            </div>
          )
      }
    </div>
  )
}

export default Widget
