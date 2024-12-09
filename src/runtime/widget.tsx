import { React, type AllWidgetProps, JimuMapViewStatus } from 'jimu-core'
import { type JimuMapView, JimuMapViewComponent, type JimuLayerView } from 'jimu-arcgis'
import { type Taxon, type Specie } from './types'
import SpeciesOverview from './species-overview'
import { useEffect } from 'react'

const nslogo = require('../assets/ns_canada.png')
/**
 * You can import the components from `@arcgis/map-components-react` or `arcgis-map-components`.
 * Use either of them, the components will not be compiled into the widget bundle, but loaded from the `arcgis-map-components` entry.
 */

const Widget = (props: AllWidgetProps<{ [key: string]: never }>) => {
  const [jimuMapView, setJimuMapView] = React.useState<JimuMapView>(null)
  const [mapLayers, setMapLayers] = React.useState<JimuLayerView[]>([])
  const [taxa, setTaxa] = React.useState<Taxon[]>([])
  const [activeSpecie, setActiveSpecie] = React.useState<Specie>(null)

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
      const speciesTable = tables.find(x => x.title === 'ReviewerApp2C - ReviewRangeMapSpecies') as __esri.FeatureLayer
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
    }
  }, [jimuMapView, props.user.username])

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
        <div className='row my-2'>
          <SpeciesOverview taxa={taxa} setActiveSpecie={setActiveSpecie}/>
        </div>
        <div className='row my-2'>
          <div className='col'>
            <h2>{activeSpecie?.name}</h2>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Widget
