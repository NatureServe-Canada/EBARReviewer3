import { Button, Label, Radio, TextArea } from 'jimu-ui'
import { type Specie, type SpecieFeedback } from './types'
import defaultMessages from './translations/default'
import { type DataSource, React } from 'jimu-core'
import Graphic from 'esri/Graphic'

export default function OverallFeedback(props: {
  activeSpecie: Specie
  setDisplayOverallFeedback: React.Dispatch<React.SetStateAction<boolean>>
  setDisplaySpeciesOverview: React.Dispatch<React.SetStateAction<boolean>>
  specieFeedback: SpecieFeedback
  setSpecieFeedback: React.Dispatch<React.SetStateAction<SpecieFeedback>>
  reviewTable: __esri.FeatureLayer
}) {
  const [rating, setRating] = React.useState(null)
  const [comment, setComment] = React.useState(null)

  React.useEffect(() => {
    setRating(props.specieFeedback.overallStarRating)
    setComment(props.specieFeedback.reviewNotes)
  }, [props.specieFeedback])

  function handleBackButtonChange() {
    props.setDisplayOverallFeedback(false)
    props.setDisplaySpeciesOverview(true)
  }
  const saveOverallFeedback = () => {
    if (!rating) {
      alert('please provide a star rating')
      return
    }
    props.reviewTable.applyEdits({
      updateFeatures: [new Graphic({
        attributes: {
          objectid: props.specieFeedback.objectID,
          overallstarrating: rating,
          reviewnotes: comment
        }
      })
      ]
    }).then(() => {
      props.setSpecieFeedback((prev: SpecieFeedback) => {
        return { ...prev, overallStarRating: rating, reviewNotes: comment }
      })
      props.setDisplayOverallFeedback(false)
      props.setDisplaySpeciesOverview(true)
    })
  }

  const sumbitFeedback = () => {
    if (!rating) {
      alert('please provide a star rating')
      return
    }
    if (!confirm('After submit, additional markup and feedback for this range map will not be allowed. Do you want to continue?')) return

    props.reviewTable.applyEdits({
      updateFeatures: [new Graphic({
        attributes: {
          objectid: props.specieFeedback.objectID,
          overallstarrating: rating,
          reviewnotes: comment,
          datecompleted: Date.now()
        }
      })
      ]
    }).then(() => {
      props.setSpecieFeedback((prev: SpecieFeedback) => {
        return { ...prev, overallStarRating: rating, reviewNotes: comment }
      })
      props.setDisplayOverallFeedback(false)
      props.setDisplaySpeciesOverview(true)
    })
  }

  return (
    <div className='container p-0'>
      <div className='row border-bottom w-100 m-0'>
        <div className='col p-0'>
          <h2>{defaultMessages.provideFeedBack}</h2>
        </div>
      </div>
      <div className='row pt-2 p-0 w-100 m-0'>
        <div className='col p-0'>
          {/* radio button rating*/}
          <h5>Rating</h5>
          <div role='radiogroup' aria-label={'Rating'} >
            <Label >
              <Radio name='radio1' className='m-2' checked={rating === 1} onChange={() => { setRating(1) }} />
              1
            </Label>
            <Label >
              <Radio name='radio1' className='m-2' checked={rating === 2} onChange={(evt, checked) => {
                setRating(2)
              }} />
              2
            </Label>
            <Label >
              <Radio name='radio1' className='m-2' checked={rating === 3} onChange={(evt, checked) => {
                setRating(3)
              }} />
              3
            </Label>
            <Label >
              <Radio name='radio1' className='m-2' checked={rating === 4} onChange={(evt, checked) => {
                setRating(4)
              }} />
              4
            </Label>
            <Label >
              <Radio name='radio1' className='m-2' checked={rating === 5} onChange={(evt, checked) => {
                setRating(5)
              }} />
              5
            </Label>
          </div>
        </div>
      </div>
      <div className='row pt-2 p-0 w-100 m-0'>
        <div className='p-0 w-100'>
          <label>
            Overall comment:
          </label>
          <TextArea
              value={comment}
              onChange={(e) => { setComment(e.target.value) }}
              style={{ width: '100%' }}
            />
        </div>
      </div>
      <div className='row row-cols-auto pt-2 p-0 w-100 m-0'>
        <div className='pr-2'>
          <Button onClick={handleBackButtonChange}>Back</Button>
        </div>
        <div className='pr-2'>
          <Button onClick={saveOverallFeedback}>Save</Button>
        </div>
        <div className='pr-2'>
          <Button onClick={sumbitFeedback}>Submit</Button>
        </div>
      </div>
    </div>
  )
}
