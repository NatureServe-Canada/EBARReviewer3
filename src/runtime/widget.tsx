import {
  React,
  type AllWidgetProps,
  DataSourceManager,
  DataSourceComponent,
  type DataSource,
  type QueriableDataSource,
  type SqlQueryParams,
  type FeatureLayerDataSource
} from 'jimu-core'
import { type Taxon, type Specie, type SpecieFeedback, DataSourceLabel, type Ecoshape } from './types'
import SpeciesOverview from './species-overview'
import OverallFeedback from './overall-feedback'
// import { useEffect } from 'react'
import EcoshapeMarkup from './ecoshape-markup'

const nslogo = require('../assets/ns_canada.png')
/**
 * You can import the components from `@arcgis/map-components-react` or `arcgis-map-components`.
 * Use either of them, the components will not be compiled into the widget bundle, but loaded from the `arcgis-map-components` entry.
 */

const Widget = (props: AllWidgetProps<{ [key: string]: never }>) => {
  const [taxa, setTaxa] = React.useState<Taxon[]>([])
  const [activeSpecie, setActiveSpecie] = React.useState<Specie>(null)
  const [displaySpeciesOverview, setDisplaySpeciesOverview] = React.useState<boolean>(true)
  const [displayOverallFeedback, setDisplayOverallFeedback] = React.useState<boolean>(false)
  const [specieFeedback, setSpecieFeedback] = React.useState<SpecieFeedback>(null)

  const [selectedEcoshapes, setSelectedEcoshapes] = React.useState<Ecoshape[]>([])
  const [reviewTable, setReviewTable] = React.useState<DataSource>(null)
  const [ecoshapeDs, setEcoshapeDs] = React.useState<QueriableDataSource>(null)
  const [ecoshapeReviewDs, setEcoshapeReviewDs] = React.useState<QueriableDataSource>(null)
  const [presenceDs, setPresenceDs] = React.useState<QueriableDataSource>(null)
  const [usageTypeDs, setUsageTypeDs] = React.useState<QueriableDataSource>(null)
  const [presenceMarkupDs, setPresenceMarkupDs] = React.useState<FeatureLayerDataSource>(null)

  // useEffect(() => {
  //   if (jimuMapView && jimuMapView.status === JimuMapViewStatus.Loaded) {
  //     const mapDs = DataSourceManager.getInstance().getDataSource(jimuMapView.dataSourceId)
  //     mapDs.childDataSourcesReady().then(() => {
  //       const alChildDS = mapDs.getAllChildDataSources() as QueriableDataSource[]
  //       setMapChildDS(alChildDS)
  //       alChildDS.forEach((childDS) => {
  //         if (['Usage Type Markup', 'Presence Markup', 'Usage Type', 'Species Range Ecoshapes (generalized)'].includes(childDS.getSchema().label)) {
  //           childDS.updateQueryParams(
  //             {
  //               where: '1<>1',
  //               outFields: ['*']
  //             } as SqlQueryParams, props.id)
  //         }
  //       })
  //     })
  //     // jimuMapView.whenAllJimuLayerViewLoaded().then(() => {
  //     //   for (const layerViewId in jimuMapView.jimuLayerViews) {
  //     //     const layerView = jimuMapView.jimuLayerViews[layerViewId]
  //     //     // console.log(layerView?.layer?.title, layerView?.layer?.url)
  //     //     if (layerView.type === 'feature' && ['Usage Type Markup', 'Presence Markup', 'Usage Type', 'Species Range Ecoshapes (generalized)'].includes(layerView?.layer?.title)) {
  //     //       console.log(layerView.layerDataSourceId)
  //     //       const ds = layerView.getLayerDataSource()
  //     //       console.log(ds)
  //     //       // ds.updateQueryParams(
  //     //       //   {
  //     //       //     where: '1<>1',
  //     //       //     outFields: ['*']
  //     //       //   } as SqlQueryParams, props.id)
  //     //     }
  //     //     // setMapLayers(mapLayers => [...mapLayers, layerView])
  //     //   }
  //     // })

  //     const tables = jimuMapView?.view.map.allTables
  //     setAllTables(tables)
  //     const speciesTable = tables.find(x => x.title === 'ReviewerApp2C - ReviewRangeMapSpecies') as __esri.FeatureLayer
  //     speciesTable.queryFeatures({
  //       where: `username='${props.user.username}' and includeinebarreviewer=1`,
  //       outFields: ['Username', 'ReviewID', 'RangeMapID', 'RangeVersion', 'RangeStage', 'RangeMetadata', 'RangeMapNotes',
  //         'RangeMapScope', 'TAX_GROUP', 'NATIONAL_SCIENTIFIC_NAME', 'NSX_URL', 'DifferentiateUsageType']
  //     }).then((results) => {
  //       if (Array.isArray(results.features) && results.features.length !== 0) {
  //         const tempTaxa: Taxon[] = []
  //         results.features.forEach(x => {
  //           const taxGroup = x.attributes.tax_group
  //           const specie: Specie = {
  //             name: x.attributes.national_scientific_name,
  //             reviewID: x.attributes.reviewid,
  //             rangeMapID: x.attributes.rangemapid,
  //             rangeVersion: x.attributes.rangeversion,
  //             rangeStage: x.attributes.rangestage,
  //             rangeMetadata: x.attributes.rangemetadata,
  //             rangeMapNotes: x.attributes.rangemapnotes,
  //             rangeMapScope: x.attributes.rangemapscope,
  //             nsxUrl: x.attributes.nsx_url,
  //             differentiateUsageType: x.attributes.differentiateusagetype
  //           }
  //           const taxon = tempTaxa.find(x => x.name === taxGroup)
  //           if (taxon) {
  //             taxon.species.push(specie)
  //           } else {
  //             tempTaxa.push({
  //               name: taxGroup,
  //               species: [specie]
  //             })
  //           }
  //         })
  //         setTaxa(tempTaxa)
  //       }
  //     }).catch((error) => {
  //       console.log(error)
  //     })
  //   }
  // }, [jimuMapView]) // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (activeSpecie) {
      props.useDataSources.forEach((useDataSource) => {
        const dataSource = DataSourceManager.getInstance().getDataSource(useDataSource.dataSourceId) as QueriableDataSource
        const dataSourceLabel = dataSource.getSchema().label
        if (dataSourceLabel === DataSourceLabel.REVIEW) {
          dataSource.query(
            {
              where: `reviewid=${activeSpecie.reviewID} and rangemapid=${activeSpecie.rangeMapID}`,
              outFields: ['*']
            } as SqlQueryParams)
            .then(({ records }) => {
              if (Array.isArray(records) && records.length !== 0) {
                const specieFeedback: SpecieFeedback = {
                  reviewID: activeSpecie.reviewID,
                  rangeMapID: activeSpecie.rangeMapID,
                  objectID: records[0].getData().objectid,
                  reviewNotes: records[0].getData().reviewnotes,
                  dateStarted: records[0].getData().datestarted ? records[0].getData().datestarted : new Date().getTime(),
                  dateCompleted: records[0].getData().datecompleted,
                  overallStarRating: records[0].getData().overallstarrating
                }
                setSpecieFeedback(specieFeedback)
              }
            })
        } else if (dataSourceLabel === DataSourceLabel.USAGE_TYPE || dataSourceLabel === DataSourceLabel.PRESENCE) {
          dataSource.updateQueryParams(
            {
              where: `rangemapid=${activeSpecie.rangeMapID}`,
              outFields: ['*']
            } as SqlQueryParams, props.id)
        } else if (dataSourceLabel === DataSourceLabel.USAGE_TYPE_MARKUP || dataSourceLabel === DataSourceLabel.PRESENCE_MARKUP) {
          dataSource.updateQueryParams(
            {
              where: `reviewid=${activeSpecie.reviewID}`,
              outFields: ['*']
            } as SqlQueryParams, props.id)
        }
      })
    }
  }, [activeSpecie]) // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (selectedEcoshapes && selectedEcoshapes.length > 0) {
      setDisplaySpeciesOverview(false)
      setDisplayOverallFeedback(false)
    }
  }, [selectedEcoshapes])

  // useEffect(() => {
  //   if (props.useDataSources && props.useDataSources.length > 0) {
  //     props.useDataSources.forEach((useDataSource) => {
  //       const ds = DataSourceManager.getInstance().getDataSource(useDataSource.dataSourceId)
  //       console.log(ds)
  //     }
  //     )
  //   }
  // }, [props.useDataSources])

  function getDefaultLayerFilter(dsName: string) {
    switch (dsName) {
      case DataSourceLabel.SPECIES:
        return `username='${props.user.username}' and includeinebarreviewer=1`
      case DataSourceLabel.USAGE_TYPE_MARKUP:
      case DataSourceLabel.PRESENCE_MARKUP:
      case DataSourceLabel.USAGE_TYPE:
      case DataSourceLabel.PRESENCE:
        return '1<>1'
      default:
        return '1=1'
    }
  }

  const onDataSourceCreated = (ds: DataSource) => {
    const dataSource = ds as QueriableDataSource
    const dataSourceLabel = dataSource.getSchema().label
    dataSource.updateQueryParams(
      {
        where: getDefaultLayerFilter(dataSource.getSchema().label),
        outFields: ['*']
      } as SqlQueryParams, props.id
    )
    if (dataSourceLabel === DataSourceLabel.ECOSHAPE_REVIEW) {
      setEcoshapeReviewDs(dataSource)
    } else if (dataSourceLabel === DataSourceLabel.PRESENCE) {
      setPresenceDs(dataSource)
    } else if (dataSourceLabel === DataSourceLabel.USAGE_TYPE) {
      setUsageTypeDs(dataSource)
    } else if (dataSourceLabel === DataSourceLabel.ECOSHAPE) {
      setEcoshapeDs(dataSource)
    } else if (dataSourceLabel === DataSourceLabel.REVIEW) {
      setReviewTable(dataSource)
    } else if (dataSourceLabel === DataSourceLabel.PRESENCE_MARKUP) {
      setPresenceMarkupDs(dataSource as FeatureLayerDataSource)
    } else if (dataSourceLabel === DataSourceLabel.SPECIES) {
      dataSource.query({}).then(({ records }) => {
        if (Array.isArray(records) && records.length !== 0) {
          const tempTaxa: Taxon[] = []
          records.forEach(record => {
            const data = record.getData()
            const taxGroup = data.tax_group
            const specie: Specie = {
              name: data.national_scientific_name,
              reviewID: data.reviewid,
              rangeMapID: data.rangemapid,
              rangeVersion: data.rangeversion,
              rangeStage: data.rangestage,
              rangeMetadata: data.rangemetadata,
              rangeMapNotes: data.rangemapnotes,
              rangeMapScope: data.rangemapscope,
              nsxUrl: data.nsx_url,
              differentiateUsageType: data.differentiateusagetype
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
      })
    }
  }

  const onSelectionChange = (selection) => {
    if (selection && selection.length > 0) {
      // Fetch the data for selected species
      ecoshapeDs.query({
        where: `objectid in (${selection.join(',')})`,
        outFields: ['objectid', 'ecoshapeid', 'ecoshapename', 'ecozone', 'parentecoregion', 'terrestrialarea', 'terrestrialproportion']
      } as SqlQueryParams).then((results) => {
        const ecoshapes: Ecoshape[] = []
        results.records.forEach((record) => {
          const data = record.getData()
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
    }
  }

  return (
    <div className="jimu-widget">
      {props.useDataSources && props.useDataSources.length > 0 && props.useDataSources.map((useDataSource) => {
        return <DataSourceComponent
          useDataSource={useDataSource}
          widgetId={props.id}
          onDataSourceCreated={onDataSourceCreated}
          onSelectionChange={onSelectionChange}
        />
      })}
      <div className='container'>
        <div className='row justify-content-between my-2'>
          <div className='col align-self-start'>
            <h1>EBAR Reviewer</h1>
          </div>
          <div className='col text-right'>
            <img src={nslogo} alt='NS Logo' style={{ height: '4rem' }} />
          </div>
        </div>
        {displaySpeciesOverview && (
          <SpeciesOverview
            taxa={taxa}
            setActiveSpecie={setActiveSpecie}
            activeSpecie={activeSpecie}
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
            widgetId={props.id}
            selectedEcoshapes={selectedEcoshapes}
            setSelectedEcoshapes={setSelectedEcoshapes}
            activeSpecie={activeSpecie}
            ecoshapeDs={ecoshapeDs}
            presenceDs={presenceDs}
            usageTypeDs={usageTypeDs}
            presenceMarkupDs={presenceMarkupDs}
            ecoshapeReviewDs={ecoshapeReviewDs}
            setDisplayOverallFeedback={setDisplayOverallFeedback}
            setDisplaySpeciesOverview={setDisplaySpeciesOverview}
          />)}
      </div>
    </div>
  )
}

export default Widget
