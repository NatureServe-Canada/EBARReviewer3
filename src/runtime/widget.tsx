import { React, type AllWidgetProps, JimuMapViewStatus } from 'jimu-core'
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
  const [mapLayers, setMapLayers] = React.useState<JimuLayerView[]>([])
  const [allTables, setAllTables] = React.useState<__esri.Collection<__esri.Layer>>(null)
  const [taxa, setTaxa] = React.useState<Taxon[]>([])
  const [activeSpecie, setActiveSpecie] = React.useState<Specie>(null)
  const [displaySpeciesOverview, setDisplaySpeciesOverview] = React.useState<boolean>(true)
  const [displayOverallFeedback, setDisplayOverallFeedback] = React.useState<boolean>(false)
  const [specieFeedback, setSpecieFeedback] = React.useState<SpecieFeedback>(null)

  useEffect(() => {
    if (jimuMapView && jimuMapView.status === JimuMapViewStatus.Loaded) {
      for (const layerViewId in jimuMapView.jimuLayerViews) {
        const layerView = jimuMapView.jimuLayerViews[layerViewId]
        // if (layerView.type === 'feature') {
        //   console.log(layerView?.layer?.title, layerView?.layer?.url)
        // }
        setMapLayers(mapLayers => [...mapLayers, layerView])
      }

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
  }, [jimuMapView, props.user.username])

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

  if (!props.useMapWidgetIds || props.useMapWidgetIds.length === 0) {
    return <div>Please select a map widget</div>
  }

  const onActiveViewChange = (activeView: JimuMapView) => {
    if (!activeView) {
      return
    }
    setJimuMapView(activeView)
  }

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

    </div>
  )
}

export default Widget
