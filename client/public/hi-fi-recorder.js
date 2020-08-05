import base64ArrayBuffer from './base64ArrayBuffer.js'

class HiFiRecorder extends AudioWorkletProcessor {

  constructor(){
    super()
    this.port.onmessage = message => {
      this.recording = message.data.recording
      if(!this.recording) this.stopping = true
    }
    this.recordedChunks = []
  }

  process (inputs, outputs, parameters) {
    if(this.recordedChunks.length > 500 || (this.recordedChunks.length && !this.recording)){
      this.port.postMessage({recordedChunks: this.recordedChunks, stopping: this.stopping})
      this.stopping = false
      this.recordedChunks = []
    }
    if(this.recording){
      this.recordedChunks.push(base64ArrayBuffer(inputs[0][0].buffer))
    }
    if(this.stopping){
      this.port.postMessage({stopping: this.stopping})
    }
    return true
  }
}

registerProcessor('hi-fi-recorder', HiFiRecorder)
