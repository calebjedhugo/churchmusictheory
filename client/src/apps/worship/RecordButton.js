import React, { Component } from 'react'
import {Button, Spinner, Card} from 'react-bootstrap';
import base64ArrayBuffer from '../../webAudio/base64ArrayBuffer.js'
import {Base64Binary} from '../../webAudio/base64Binary.js'
import {apiPath} from '../../App.js'
import DeleteTake from './DeleteTake.js'
import Latency from './Latency.js'
import 'webrtc-adapter'

export default class RecordButton extends Component {
  constructor(props){
    super(props)
    this.state = {
      recording: false, //for display
      playing: false,
      loading: false,
      latency: this.props.initLatency,
      error: ''
    }

    this.playerPrimed = false
    this.arrayBuffer = null
    this.audioSourceMaster = null
    this.audioSourceNew = null
    this.recording = false //for syncronizing
    this.recordedChunks = []
    this.soundManager = this.props.soundManager
    this.recorderContext = this.props.recorderContext
  }

  createRecordingEntry = () => {
    const {setRecordingId, masterRef, getDrafts} = this.props
    return new Promise(resolve => {
      window.jquery.ajax({
        type: 'POST',
        data: {
          action: 'create_recording_entry',
          masterRef: masterRef //masterRef will be 0 if no master Id exists (for new songs)
        },
        url: apiPath
      }).done((data) => {
        this.setState({error: ''})
        try{data = JSON.parse(data)}
        catch(e){this.setState({error: data})}
        setRecordingId(data)
        resolve(data)
        if(!masterRef) getDrafts(data)
      }).fail((xrh, status, e) => {
        this.setState({error: xrh.responseText})
        console.error(xrh.responseText)
      }).always(() => {
        this.setState({loading: false})
      })
    })
  }

  appendRecording = (arrayBuffers, lastSegment) => {
    const {recordingId} = this.props
    window.jquery.ajax({
      type: 'POST',
      data: {
        action: 'append_recording',
        recordingId: recordingId,
        recording: arrayBuffers
      },
      url: apiPath
    }).done((data) => {
      try{data = JSON.parse(data)}
      catch(e){this.setState({error: data})}
      if(lastSegment) this.makeMp3()
    }).fail((xrh, status, e) => {
      this.setState({error: xrh.responseText})
      console.error(xrh.responseText)
    }).always(() => {
      this.setState({loading: false})
    })
  }

  makeMp3 = () => {
    const {recordingId} = this.props
    window.jquery.ajax({
      type: 'POST',
      data: {
        action: 'make_mp3',
        recordingId: recordingId
      },
      url: apiPath
    }).done((data) => {
      this.setState({error: ''})
      try{data = JSON.parse(data)}
      catch(e){this.setState({error: data})}
    }).fail((xrh, status, e) => {
      this.setState({error: xrh.responseText})
      console.error(xrh.responseText)
    }).always(() => {
      this.setState({loading: false})
    })
  }

  record = async () => {
    const {createRecordingEntry, play} = this
    const {master} = this.props
    this.recordedChunks = []
    this.soundManager.soundscape.resume()
    this.recorderContext.resume()

    if(!this.firebox){

      // Older browsers might not implement mediaDevices at all, so we set an empty object first
      if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
      }

      // Some browsers partially implement mediaDevices. We can't just assign an object
      // with getUserMedia as it would overwrite existing properties.
      // Here, we will just add the getUserMedia property if it's missing.
      if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = function(constraints) {

          // First get ahold of the legacy getUserMedia, if present
          var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

          // Some browsers just don't implement it - return a rejected promise with an error
          // to keep a consistent interface
          if (!getUserMedia) {
            return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
          }

          // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
          return new Promise(function(resolve, reject) {
            getUserMedia.call(navigator, constraints, resolve, reject);
          });
        }
      }

      try{
        this.stream = await navigator.mediaDevices.getUserMedia({
          audio: true, video: false
        })
      } catch(e) {
        this.setState({error: e.message})
        throw e
      }

      const mic = this.recorderContext.createMediaStreamSource(this.stream)
      const compressor = this.recorderContext.createDynamicsCompressor()
      mic.connect(compressor)
      try {
        await this.recorderContext.audioWorklet.addModule(`${window.location.href === 'http://localhost:3000/' ? '' : 'App/client/'}hi-fi-recorder.js`)
        this.firebox = new AudioWorkletNode(this.recorderContext, 'hi-fi-recorder')

        compressor.connect(this.firebox)
        this.firebox.connect(this.recorderContext.destination)

        this.firebox.port.onmessage = message => {
          if(message.data.recordedChunks){
            this.appendRecording(message.data.recordedChunks, message.data.stopping)
          }
          else if(message.data.stopping){ //for if the stop message was sent when recorded chucks was at 0.
            setTimeout(this.makeMp3, 1000)
            console.warn('recording stopped when recorded chunks was 0. mp3 was still made.')
          }
        }

      } catch(e){

        console.error('Something went wrong with the AudioWorkletNode. Using createScriptProcessor instead.')
        this.fallbackRecording = true
        //The following is all createScriptProcessor has to offer.
        //But it should be here since the AudioWorkletNode is still in developement. April 2020
        this.firebox = this.recorderContext.createScriptProcessor(16384, 1, 1)
        compressor.connect(this.firebox)
        this.firebox.connect(this.recorderContext.destination)

        this.firebox.onaudioprocess = (e) => {
          if(this.recording){
            if(this.audioSourceMasterPrimed){
              this.audioSourceMasterPrimed = false
              return this.audioSourceMaster.start()
            }
            let newData = base64ArrayBuffer(e.inputBuffer.getChannelData(0).buffer)
            if(!this.state.recording) this.setState({recording: true})
            this.recordedChunks.push(newData)
          }
          if(this.recordedChunks.length > 10){
            this.appendRecording(this.recordedChunks)
            this.recordedChunks = []
          }
        }
      }
    }

    if(this.recording) return console.log('Already recording.')
    createRecordingEntry().then(async () => {
      if(master) await play(true) //true means it is priming the recording and assigning the node to this.audioSourceMaster
      if(master && this.firebox.port){
        this.audioSourceMaster.start()
      } else if(master){
        this.audioSourceMasterPrimed = true
      }
      if(this.firebox.port) this.firebox.port.postMessage({recording: true}) //This won't exist if a few browsers and they will be using createScriptProcessor
      this.recording = true
      this.setState({recording: true})
    })
  }

  play = (primeOnly) => {
    const {master, completedTake, recordingId, getRecording} = this.props
    this.soundManager.soundscape.resume()
    return new Promise(async resolve => {
      this.setState({loading: true})
      try{
        let submissionBinary = null
        let masterCopy = null
        if(completedTake){ //Do this first since we'll need to download it.
          submissionBinary = Base64Binary.decodeArrayBuffer(await getRecording(recordingId))
        }

        if(master){
          masterCopy = Base64Binary.decodeArrayBuffer(master)
        }

        if(!this.soundManager)
        this.soundManager.soundscape.resume()
        if(completedTake){
          this.audioSourceNew = await this.soundManager.primeArrayBuffer(submissionBinary, true)
        }

        if(master) {
          this.audioSourceMaster = await this.soundManager.primeArrayBuffer(masterCopy)
          this.audioSourceMaster.onended = () => {
            this.setState({playing: false})
            this.stop()
            this.audioSourceMaster.playing = false
          }
        }

        if(!primeOnly){
          if(master && completedTake){
            this.audioSourceMaster.gainNode.gain.value = .8
            this.audioSourceNew.gainNode.gain.value = .8
          }
          if(master){this.audioSourceMaster.start()}
          if(completedTake){this.audioSourceNew.start(0, (this.state.latency || 0) / 1000)}
        }

        //resolve so we know when to start recording.
        resolve()

        if(completedTake){
          this.audioSourceNew.onended = () => {
            this.setState({playing: false})
            this.stop()
            this.audioSourceNew.playing = false
          }
        }
      } catch(e){
        this.setState({error: e.message})
      }

      this.setState({playing: true, loading: false})
    })
  }

  stop = () => {
    try{
      const {getTakes, completedTake} = this.props
      clearTimeout(this.stopTimeout)
      if(this.recordedChunks.length) { //Only possible if using createScriptProcessor
        this.appendRecording(this.recordedChunks, true)
      } else if(this.recording) {
        if(this.fallbackRecording) this.makeMp3()
      }
      this.recording = false
      if(this.firebox && this.firebox.port){ //AudioWorkletNode
        this.firebox.port.postMessage({recording: false})
      }
      if(this.firebox){ //createScriptProcessor or AudioWorkletNode
        this.stream.getAudioTracks()[0].stop()
        this.firebox = null
      }
      if(!completedTake) getTakes() //We just made a new take.
      if(this.audioSourceMaster) this.audioSourceMaster.stop()
      if(this.audioSourceNew) this.audioSourceNew.stop()
      this.setState({recording: false, playing: false})
    } catch (e){
      this.setState({error: e.message})
      throw e
    }
  }

  render(){
    const {recording, playing, loading, latency, error} = this.state
    const {reviewing, selected, master, alreadyContributed, completedTake, labelIdx, setAsSeletedTake, setTakes, recordingId} = this.props
    const maxLatency = 500
    return (
      <div className={selected ? 'selectedRecording' : ''}>
        {labelIdx ? <label>{`Take ${labelIdx}:`}</label> : null}
        {alreadyContributed || completedTake ? null : <Button disabled={loading} onClick={this.record} className={`recordButtons${recording ? ' recordButtonActive' : ''}`}>
          <i className="fas fa-microphone"></i>
        </Button>}
        {(master || completedTake) && !playing ?
          <Button disabled={loading} className='recordButtons' onClick={(e) => {
            this.play()
            if(setAsSeletedTake) setAsSeletedTake()
          }}>
            <i className="fas fa-play"></i>
          </Button> :
          null}
        {recording || playing ?
          <Button disabled={loading} className='recordButtons' onClick={this.stop}>
            <i className="fas fa-stop"></i>
          </Button> : null}
        {master && completedTake ? (<div style={{display: 'inline-block', margin: '8px', verticalAlign: 'middle'}}>
          <Latency setLatency={e => {
            if(e.target.value >= 0 && e.target.value < maxLatency) this.setState({latency: e.target.value})
          }} latency={latency} maxLatency={maxLatency} id={recordingId} /></div>) : null
        }
        {completedTake && !reviewing ? <DeleteTake id={recordingId} setTakes={setTakes} takeNumber={labelIdx}/> : null}
        {alreadyContributed ? <Card><Card.Body>{'You already sent a recording, but you can still listen.'}</Card.Body></Card> : null}
        {loading ? <Spinner animation="border" variant="primary" /> : null}
        {error ? <div className='errorMessage'>{error}</div> : null}
      </div>
    )
  }
}
/**/
