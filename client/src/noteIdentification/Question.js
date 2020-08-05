import React, { Component } from 'react'
import {Note} from '../notation/Note.js'

export class Question extends Component {
  constructor(props){
    //We don't want these components to change state so that we can build an animation.
    super(props)
    const {note} = this.props
    this.note = note
  }

  getType = (note) => {
    if(!note) note = this.state.activeNote
    return note.split('/')[1] < 4 ? 'bass' : 'treble'
  }

  render(){
    const {note, wrong, grand} = this.props
    return <div style={wrong ? {position: 'fixed'}: null}><Note wrong={wrong} note={[note]} type={this.getType(note)} grand={grand}/></div>
  }
}
