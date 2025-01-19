import { React, type AllWidgetProps, JimuMapViewStatus, DataSourceManager, DataSourceComponent, DataSource, QueriableDataSource, IFeatureLayer, SqlQueryParams } from 'jimu-core'
import { type JimuMapView, JimuMapViewComponent, type JimuLayerView } from 'jimu-arcgis'
import { type Taxon, type Specie, type SpecieFeedback } from './types'
import SpeciesOverview from './species-overview'
import OverallFeedback from './overall-feedback'
import { useEffect } from 'react'

const nslogo = require('../assets/ns_canada.png')
/**
 * You can import the components from `@arcgis/map-components-react` or `arcgis-map-components`.
 * Use either of them, the components will not be compiled into the widget bundle, but loaded from the `arcgis-map-components` entry.
 */

const Widget = (props: AllWidgetProps<{ [key: string]: never }>) => {
  const [jimuMapView, setJimuMapView] = React.useState<JimuMapView>(null)
  const [allTables, setAllTables] = React.useState<__esri.Collection<__esri.Layer>>(null)
  const [taxa, setTaxa] = React.useState<Taxon[]>([])
  const [activeSpecie, setActiveSpecie] = React.useState<Specie>(null)
  const [displaySpeciesOverview, setDisplaySpeciesOverview] = React.useState<boolean>(true)
  const [displayOverallFeedback, setDisplayOverallFeedback] = React.useState<boolean>(false)
  const [specieFeedback, setSpecieFeedback] = React.useState<SpecieFeedback>(null)

  useEffect(() => {
    if (jimuMapView && jimuMapView.status === JimuMapViewStatus.Loaded) {
      const mapDs = DataSourceManager.getInstance().getDataSource(jimuMapView.dataSourceId)
      mapDs.childDataSourcesReady().then(() => {
        const alChildDS = mapDs.getAllChildDataSources() as QueriableDataSource[]
        alChildDS.forEach((childDS) => {
          if (['Usage Type Markup', 'Presence Markup', 'Usage Type', 'Species Range Ecoshapes (generalized)'].includes(childDS.getSchema().label)) {
            childDS.updateQueryParams(
              {
                where: '1<>1',
                outFields: ['*']
              } as SqlQueryParams, props.id)
          }
        })
      })
      // jimuMapView.whenAllJimuLayerViewLoaded().then(() => {
      //   for (const layerViewId in jimuMapView.jimuLayerViews) {
      //     const layerView = jimuMapView.jimuLayerViews[layerViewId]
      //     // console.log(layerView?.layer?.title, layerView?.layer?.url)
      //     if (layerView.type === 'feature' && ['Usage Type Markup', 'Presence Markup', 'Usage Type', 'Species Range Ecoshapes (generalized)'].includes(layerView?.layer?.title)) {
      //       console.log(layerView.layerDataSourceId)
      //       const ds = layerView.getLayerDataSource()
      //       console.log(ds)
      //       // ds.updateQueryParams(
      //       //   {
      //       //     where: '1<>1',
      //       //     outFields: ['*']
      //       //   } as SqlQueryParams, props.id)
      //     }
      //     // setMapLayers(mapLayers => [...mapLayers, layerView])
      //   }
      // })

      const tables = jimuMapView?.view.map.allTables
      setAllTables(tables)
      const speciesTable = tables.find(x => x.title === 'ReviewerApp2C - ReviewRangeMapSpecies') as __esri.FeatureLayer
      speciesTable.queryFeatures({
        where: `username='${props.user.username}' and includeinebarreviewer=1`,
        outFields: ['Username', 'ReviewID', 'RangeMapID', 'RangeVersion', 'RangeStage', 'RangeMetadata', 'RangeMapNotes',
          'RangeMapScope', 'TAX_GROUP', 'NATIONAL_SCIENTIFIC_NAME', 'NSX_URL', 'DifferentiateUsageType']
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
    }
  }, [jimuMapView]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeSpecie && allTables) {
      const reviewTable = allTables.find(x => x.title === 'ReviewerApp2C - Review') as __esri.FeatureLayer
      reviewTable.queryFeatures({
        where: `reviewid=${activeSpecie.reviewID} and rangeMapID=${activeSpecie.rangeMapID}`,
        outFields: ['*']
      }).then((results) => {
        if (Array.isArray(results.features) && results.features.length !== 0) {
          const specieFeedback: SpecieFeedback = {
            reviewID: activeSpecie.reviewID,
            rangeMapID: activeSpecie.rangeMapID,
            objectID: results.features[0].attributes.objectid,
            reviewNotes: results.features[0].attributes.reviewnotes,
            dateStarted: results.features[0].attributes.datestarted ? results.features[0].attributes.datestarted : new Date().getTime(),
            dateCompleted: results.features[0].attributes.datecompleted,
            overallStarRating: results.features[0].attributes.overallstarrating
          }
          setSpecieFeedback(specieFeedback)
        }
      }).catch((error) => {
        console.log(error)
      })
    }
  }, [activeSpecie, allTables])

  useEffect(() => {
    if (activeSpecie) {
      const mapDs = DataSourceManager.getInstance().getDataSource(jimuMapView.dataSourceId)
      mapDs.childDataSourcesReady().then(() => {
        const alChildDS = mapDs.getAllChildDataSources() as QueriableDataSource[]
        alChildDS.forEach((childDS) => {
          if (['Usage Type', 'Species Range Ecoshapes (generalized)'].includes(childDS.getSchema().label)) {
            childDS.updateQueryParams(
              {
                where: `rangemapid=${activeSpecie.rangeMapID}`,
                outFields: ['*']
              } as SqlQueryParams, props.id)
          } else if (['Usage Type Markup', 'Presence Markup'].includes(childDS.getSchema().label)) {
            console.log(activeSpecie.reviewID)
            childDS.updateQueryParams(
              {
                where: `reviewid=${activeSpecie.reviewID}`,
                outFields: ['*']
              } as SqlQueryParams, props.id)
            console.log(childDS)
          }
        })
      })
    }
  }, [activeSpecie]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      console.log('Unmounting')
    }
  }, [])

  // useEffect(() => {
  //   if (props.useDataSources && props.useDataSources.length > 0) {
  //     props.useDataSources.forEach((useDataSource) => {
  //       const ds = DataSourceManager.getInstance().getDataSource(useDataSource.dataSourceId)
  //       console.log(ds)
  //     }
  //     )
  //   }
  // }, [props.useDataSources])

  if (!props.useMapWidgetIds || props.useMapWidgetIds.length === 0) {
    return <div>Please select a map widget</div>
  }

  const onActiveViewChange = (activeView: JimuMapView) => {
    if (!activeView) {
      return
    }
    setJimuMapView(activeView)
  }

  // function getDefaultLayerFilter(name: string): string {
  //   if (name === 'ReviewerApp2C - ReviewRangeMapSpecies') {
  //     return `username='${props.user.username}' and includeinebarreviewer=1`
  //   }
  //   return '1<>1'
  // }

  // const onDataSourceCreated = (ds: DataSource) => {
  //   const dataSource = ds as QueriableDataSource
  //   console.log("Hello")
  //   console.log(getDefaultLayerFilter(dataSource.getSchema().label))
  //   dataSource.updateQueryParams(
  //     {
  //       where: getDefaultLayerFilter(dataSource.getSchema().label),
  //       outFields: ['*']
  //     } as SqlQueryParams, props.id
  //   )
  //   if (dataSource.getSchema().label === 'ReviewerApp2C - ReviewRangeMapSpecies') {
  //     dataSource.ready().then(() => {
  //       console.log(dataSource.getRecords())
  //     }
  //     )
  //     console.log(dataSource.getSchema().label)
  //     // dataSource.query({}).then((res) => {
  //     //   console.log(res)
  //     //   res.records?.forEach((record) => {
  //     //     console.log(record.getData())
  //     //   }
  //     //   )
  //     // }
  //     // )
  //   }
  // }

  return (
    // style={{ backgroundColor: props.theme?.sys.color.secondary.light}}
    <div className="jimu-widget">
      <JimuMapViewComponent
        onActiveViewChange={onActiveViewChange}
        useMapWidgetId={props.useMapWidgetIds[0]}>
      </JimuMapViewComponent>
      {
        !jimuMapView && <div>Map is loading...</div>
      }
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
            allTables={allTables}
          />
        )}
        <div className='row my-2'>
          <div className='col'>
            {!displayOverallFeedback && <span>False</span>}
            {displayOverallFeedback && <span>True</span>}
          </div>
        </div>
      </div>

      {/* {props.useDataSources && props.useDataSources.length > 0 && props.useDataSources.map((useDataSource) => {
        return <DataSourceComponent
          useDataSource={useDataSource}
          widgetId={props.id}
          onDataSourceCreated={onDataSourceCreated}
        />
      })} */}

    </div>
  )
}

export default Widget
