import { Button, Label, Radio, TextArea } from 'jimu-ui'
import { type Specie, type SpecieFeedback } from './types'
import { React } from 'jimu-core'
import Graphic from 'esri/Graphic'

export default function OverallFeedback(props: {
  nls: (id: string) => string
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
          <h4>{props.nls('provideFeedBack')}</h4>
        </div>
      </div>
      {
        props.specieFeedback.dateCompleted && (
          <div className='row pt-2 p-0 w-100 m-0'>
            <div className='p-0 w-100'>
              <b style={{ color: '#B80F0A' }}>
                {props.nls('review_submitted')}
              </b>: {props.nls('reviewSubmitted')}
            </div>
          </div>
        )
      }

      <div className='row pt-2 p-0 w-100 m-0'>
        <div className='col p-0'>
          {/* radio button rating*/}
          <Label className='m-0'>{props.nls('rating')}:</Label>
          <div className='d-flex' role='radiogroup' aria-label={'Rating'} >
            <div className='d-flex align-items-center'>
              <Radio id="1star" name='radio1' className='mt-0 mb-0 m-2' checked={rating === 1} onChange={() => { setRating(1) }} />
              <label className='m-0' htmlFor='1star'>1</label>
            </div>
            <div className='d-flex align-items-center' >
              <Radio id="2star" name='radio1' className='mt-0 mb-0 m-2' checked={rating === 2} onChange={(evt, checked) => {
                setRating(2)
              }} />
              <label className='m-0' htmlFor="2star">2</label>
            </div>
            <div className='d-flex align-items-center' >
              <Radio id="3star" name='radio1' className='mt-0 mb-0 m-2' checked={rating === 3} onChange={(evt, checked) => {
                setRating(3)
              }} />
              <label className='m-0' htmlFor="3star">3</label>
            </div>
            <div className='d-flex align-items-center' >
              <Radio id="4star" name='radio1' className='mt-0 mb-0 m-2' checked={rating === 4} onChange={(evt, checked) => {
                setRating(4)
              }} />
              <label className='m-0' htmlFor="4star">4</label>
            </div>
            <div className='d-flex align-items-center' >
              <Radio id="5star" name='radio1' className='mt-0 mb-0 m-2' checked={rating === 5} onChange={(evt, checked) => {
                setRating(5)
              }} />
              <label className='m-0' htmlFor="5star">5</label>
            </div>
          </div>
        </div>
      </div>
      <div className='row pt-2 p-0 w-100 m-0'>
        <div className='p-0 w-100'>
          <label>
            {props.nls('overallComment')}:
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
          <Button onClick={handleBackButtonChange}>{props.nls('back')}</Button>
        </div>
        <div className='pr-2'>
          <Button onClick={saveOverallFeedback} disabled={props.specieFeedback.dateCompleted !== null}>{props.nls('save')}</Button>
        </div>
        <div className='pr-2'>
          <Button onClick={sumbitFeedback} disabled={props.specieFeedback.dateCompleted !== null}>{props.nls('submit')}</Button>
        </div>
      </div>
    </div>
  )
}
