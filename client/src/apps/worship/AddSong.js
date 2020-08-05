import React, { Component } from 'react';
import {Form, Button, Spinner, Alert, Modal} from 'react-bootstrap';
import RecordButton from './RecordButton.js'
import DeleteSong from './DeleteSong.js'
import {apiPath} from '../../App.js'

export default class AddSong extends Component {
  constructor(props){
    super(props)
    this.state = this.initState
  }

  get initState(){
    return {
      songTitle: '',
      lyrics: '',
      recording: null,
      loading: false,
      success: false,
      recordingId: 0,
      masterRef: 0,
      selectedTake: 0,
      selectedTakeLabel: '',
      takes: [],
      error: '',
      unSaved: false,
      drafts: (this.state && this.state.drafts) || {},
      draftValue: undefined,
      takeCreated: false
    }
  }

  componentDidMount(){
    this.getDrafts()
  }

  getDrafts = async (selectedRef) => {
    this.setState({loading: true})
    window.jquery.ajax({
      type: 'GET',
      data: {
        action: 'get_drafts',
      },
      url: apiPath
    }).done((data) => {
      try{data = JSON.parse(data)}
      catch(e){this.setState({error: data})}

      let draftObj = {}
      data.forEach(elem => {
        draftObj[elem.master_ref] = elem
      })

      this.setState({drafts: draftObj, draftValue: selectedRef})
    }).fail((xrh, status, e) => {
      this.setState({error: xrh.responseText})
      console.error(xrh.responseText)
    }).always(() => {
      this.setState({loading: false})
    })
  }

  saveDraft = async () => {
    const {songTitle, lyrics, masterRef} = this.state
    this.setState({loading: true})
    window.jquery.ajax({
      type: 'POST',
      data: {
        action: 'save_draft',
        lyrics: lyrics,
        songTitle: songTitle,
        masterRef: masterRef
      },
      url: apiPath
    }).done((data) => {
      try{data = JSON.parse(data)}
      catch(e){this.setState({error: data})}
      let ref = masterRef ? masterRef : data
      this.setState({error: '', masterRef: ref, unSaved: false})
      this.getDrafts(ref)
    }).fail((xrh, status, e) => {
      this.setState({error: xrh.responseText})
      console.error(xrh.responseText)
    }).always(() => {
      this.setState({loading: false})
    })
  }

  publish = (callback) => {
    const {selectedTake, masterRef, lyrics, songTitle} = this.state
    this.setState({loading: true})
    window.jquery.ajax({
      type: 'POST',
      data: {
        action: 'publish_song',
        recordingId: selectedTake,
        masterRef: masterRef,
        lyrics: lyrics,
        songTitle: songTitle
      },
      url: apiPath
    }).done((data) => {
      try{data = JSON.parse(data)}
      catch(e){this.setState({error: data})}
      this.setState({success: true, error: ''})
      this.getDrafts()
      if(callback) callback()
      console.log(data)
    }).fail((xrh, status, e) => {
      this.setState({error: xrh.responseText})
      console.error(xrh.responseText)
    }).always(() => {
      this.setState({loading: false})
    })
  }

  closePublishModal = () => {
    this.setState({showPublishModal: false})
  }

  get publishModal(){
    const {showPublishModal, songTitle, selectedTakeLabel, error} = this.state
    const {getSongs} = this.props
    return (
      <Modal show={showPublishModal} onHide={this.closePublishModal}>
        <Modal.Header closeButton>
          <Modal.Title>Publish this recording?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <>{`You are publishing ${songTitle} using take ${selectedTakeLabel}. All other takes will be deleted. Continue?`}</>
          {error ? <div className='errorMessage'>{error}</div> : null}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.closePublishModal}>
            Close
          </Button>
          <Button variant="primary" onClick={() => {
            this.publish(() => {
              this.closePublishModal()
              getSongs()
            })
          }}>
            Publish
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  selectDraft = async (e) => {
    const {drafts} = this.state
    const {getTakes} = this.props
    const ref = e && e.target ? e.target.value : e //will be undefined, or the id was passed in directly.
    const {song_title, master_ref, lyrics} = drafts[ref] || {}
    this.setState({
      songTitle: song_title || '',
      masterRef: master_ref || 0,
      lyrics: lyrics || '',
      takes: master_ref ? await getTakes(master_ref) : [],
      draftValue: ref,
      takeCreated: false
    })
  }

  get draftsSelect(){
    const {drafts, unSaved, draftValue} = this.state
    return Object.keys(drafts).length ? (
      <Form.Group controlId="draftSelect">
        <Form.Label>{'Load a draft'}</Form.Label>
        <Form.Control value={draftValue} disabled={unSaved} onChange={this.selectDraft} as="select">
          <option value={{}}>{'New Draft'}</option>
          {Object.keys(drafts).map((elem, i) => {
            return <option key={elem} value={elem}>{drafts[elem].song_title || elem}</option>
          })}
        </Form.Control>
      </Form.Group>
    ) : null
  }

  render(){
    const {selectedTake, takeCreated, selectedTakeLabel, takes, songTitle, lyrics, success, loading, error, recordingId, masterRef} = this.state
    const {getRecording, getTakes, existingSongNumber} = this.props
    const songLimit = 5
    return !success ? (
      <>
        {this.publishModal}
        {this.draftsSelect}
        <RecordButton
          getTakes={async () => {
            this.setState({takes: await getTakes(masterRef), takeCreated: true})
            if(!selectedTake) this.setState({selectedTake: masterRef})
          }}
          soundManager={this.props.soundManager}
          recorderContext={this.props.recorderContext}
          masterRef={masterRef}
          getRecording={getRecording}
          recordingId={recordingId}
          getDrafts={this.getDrafts}
          setRecordingId={newRecordingId => {
            this.setState({
              recordingId: newRecordingId,
              masterRef: masterRef ? masterRef : newRecordingId //All takes for a new song are store using the id from the first take.
            })
          }}/>
          {takes.map((elem, i) => {
            if(elem.recording === '0' && i === 0 && (takes.length > 1 || !takeCreated)) return null //The draft was saved without a recording.
            const labelIdx = takes.length === 1 ? 1 : i + Number(takes[0].recording !== '0')
            return <RecordButton
              soundManager={this.props.soundManager}
              recorderContext={this.props.recorderContext}
              selected={elem.id === selectedTake}
              key={elem.id}
              labelIdx={labelIdx}
              completedTake={true}
              setTakes={(takes) => {
                this.setState({takes: takes})
              }}
              recordingId={elem.id}
              getRecording={getRecording}
              setAsSeletedTake={() => {
                this.setState({
                  selectedTake: elem.id,
                  selectedTakeLabel: labelIdx
                })
              }}
            />
          })}
        <Form>
          <Form.Group controlId="songTitle">
            <Form.Control value={songTitle} type="text" placeholder="Song Title" onChange={
              e => {this.setState({songTitle: e.target.value, unSaved: true})}
            }/>
          </Form.Group>
            <Form.Group controlId="lyrics">
              <Form.Control value={lyrics} as="textarea" rows="10" placeholder="lyrics" onChange={
                e => {this.setState({lyrics: e.target.value, unSaved: true})}
              }/>
          </Form.Group>
        </Form>
        <Button onClick={() => {
          this.saveDraft()
          this.setState({showPublishModal: true})
        }} disabled={!songTitle || !lyrics || !selectedTakeLabel || !(songLimit - existingSongNumber)}>{`Publish Song (${songLimit - existingSongNumber} left)`}</Button>
        <Button onClick={this.saveDraft} disabled={!songTitle && !lyrics && !masterRef}>{'Save as Draft'}</Button>
        {masterRef ? <DeleteSong getSongs={() => {
          this.getDrafts()
          this.selectDraft() //select 'new draft'
        }} id={masterRef} draft={true} song_title={songTitle}/> : null}
        {loading ? <Spinner animation="border" variant="primary" /> : null}
        {error ? <div className='errorMessage'>{error}</div> : null}
      </>
    ) : (<Alert variant='success'>
          {existingSongNumber < songLimit ?
            <>{`${songTitle} was added successfully. You may add up to ${songLimit - existingSongNumber} more. Would you like to add another?`}<br></br>
            <Button onClick={() => {this.setState(this.initState)}}>{'Yes!'}</Button></> :
            <>{`${songTitle} was added successfully. If you want to add more, you first must delete another song.`}<br></br>
            <Button onClick={() => {this.setState(this.initState)}}>{'Got it!'}</Button></>
          }

        </Alert>)
  }
}
