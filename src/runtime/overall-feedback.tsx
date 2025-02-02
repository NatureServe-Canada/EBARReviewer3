import { Button, TextArea } from 'jimu-ui'
import { type Specie, type SpecieFeedback } from './types'
import defaultMessages from './translations/default'
import { type DataSource, React } from 'jimu-core'

export default function OverallFeedback(props: {
  activeSpecie: Specie
  setDisplayOverallFeedback: React.Dispatch<React.SetStateAction<boolean>>
  setDisplaySpeciesOverview: React.Dispatch<React.SetStateAction<boolean>>
  specieFeedback: SpecieFeedback
  setSpecieFeedback: React.Dispatch<React.SetStateAction<SpecieFeedback>>
  reviewTable: DataSource
}) {
  function handleBackButtonChange() {
    props.setDisplayOverallFeedback(false)
    props.setDisplaySpeciesOverview(true)
  }
  function saveOverallFeedback() {
    // save the overall feedback
  }

  function handleOverallCommentChange(e) {
    // handle the change of the overall comment
    const comment = e.target.value
    props.setSpecieFeedback((prev: SpecieFeedback) => {
      return { ...prev, reviewNotes: comment }
    })
  }

  return (
    <div className='container'>
      <div className='row'>
        <div className='col'>
          <h2>{defaultMessages.provideFeedBack}</h2>
        </div>
      </div>
      <br />
      <div className='row'>
        <div className='col'>
          <label>
            Overall comment:
            <TextArea
              value={props.specieFeedback.reviewNotes}
              onChange={handleOverallCommentChange}
            />
          </label>
        </div>
      </div>
      <div className='row row-cols-auto'>
        <div className='col'>
          <Button onClick={handleBackButtonChange}>Back</Button>
        </div>
        <div className='col'>
          <Button onClick={saveOverallFeedback}>Save</Button>
        </div>
        <div className='col'>
          <Button>Submit</Button>
        </div>
      </div>
    </div>
  )
}
