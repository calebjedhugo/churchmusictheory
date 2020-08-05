import React, { Component } from 'react'
import RecordButton from './RecordButton.js'
import {Button, Spinner, Card, ListGroup} from 'react-bootstrap'
import DeleteSong from './DeleteSong.js'
import SubmitTake from './SubmitTake.js'
import EditButton from './EditButton.js'
import {apiPath} from '../../App.js'

export default class Sing extends Component {
  constructor(props){
    super(props)
    this.state = {
      recordingId: 0,
      master: null,
      loading: false,
      loadingRecording: false,
      alreadyContributed: true,
      takes: [],
      selectedTake: 0,
      selectedTakeIdx: 0,
      error: ''
    }
  }

  componentDidMount(){
    this.getContibutionRecord()
  }

  getContibutionRecord = () => {
    const {id} = this.props
    this.setState({loading: true})
    window.jquery.ajax({
      type:'GET',
      data:{
        action:'song_record',
        recordingId: id
      },
      url: `${apiPath}`,
    }).done((data) => {
      try{data = JSON.parse(data)}
      catch(e){throw new Error(data)}
      if(!data) return
      this.setState({
        alreadyContributed: Number(data) === 1
      })
    }).fail((xrh, status, e) => {
      this.setState({error: xrh.responseText})
      console.error(xrh.responseText)
    }).always(() => {
      this.setState({loading: false})
    })
  }

  render(){
    const {selectedTake, selectedTakeIdx, master, alreadyContributed, loading, error, recordingId, takes, loadingRecording} = this.state
    const {lyrics, id, getRecording, getTakes, role, getSongs, song_title} = this.props
    return (
      <>
        {error ? <div className='errorMessage'>{error}</div> : null}
        {role === 'leader' ? this.deleteSongModal : null}
        {
          master ?
          <>
            { !alreadyContributed ? <ListGroup>{takes.map((elem, i) => {
              return <ListGroup.Item key={elem.id}><RecordButton
                soundManager={this.props.soundManager}
                recorderContext={this.props.recorderContext}
                selected={elem.id === selectedTake}
                setTakes={takes => {this.setState({takes: takes})}}
                labelIdx={i + 1}
                getRecording={getRecording}
                completedTake={true}
                master={master}
                recordingId={elem.id}
                initLatency={elem.latency}
                setAsSeletedTake={() => {
                  this.setState({
                    selectedTake: elem.id,
                    selectedTakeIdx: i + 1
                  })
                }}/></ListGroup.Item>
            })}</ListGroup> : null}
            <RecordButton
            soundManager={this.props.soundManager}
            recorderContext={this.props.recorderContext}
            getTakes={async () => {this.setState({takes: await getTakes(id)})}}
            master={master}
            masterRef={id}
            getRecording={getRecording}
            recordingId={recordingId}
            setRecordingId={recordingId => {this.setState({recordingId: recordingId})}}
            alreadyContributed={alreadyContributed}/>
            {!alreadyContributed ? <SubmitTake id={selectedTake} takeNumber={selectedTakeIdx} setTakes={() => {
              this.setState({
                alreadyContributed: true,
                takes: []
              })

            }}/> : null}
          </> :
          <>
            <Button onClick={() => {
                this.setState({
                  loadingRecording: true
                }, async () => {this.setState({
                  loadingRecording: false,
                  master: await getRecording(id),
                  takes: await getTakes(id)})
                })
              }}>{'Load Recording'}
            </Button>
            {loadingRecording ? <Spinner animation="border" variant="primary" /> : null}
          </>
        }
        <Card>
          <Card.Header>{song_title}</Card.Header>
          <Card.Body>
          <blockquote>{lyrics.split('\n').map((p, i) => {
            return (<div key={i}>{p}<br></br></div>)
          })}</blockquote>
          </Card.Body>
        </Card>
        {role === 'leader' ?
          <div style={{float: 'right'}}>
            <DeleteSong id={id} getSongs={getSongs} song_title={song_title} />
            <EditButton id={id} getSongs={getSongs} song_title={song_title} lyrics={lyrics}/>
          </div> : null}
        {loading ? <Spinner animation="border" variant="primary" /> : null}
      </>
    )
  }
}
