import {Staff} from './Staff.js'

// props = {
//     type: String, // See Staff.js for details on the "type" property.
//     width: Number, // See Staff.js
//     note: Array || String
//     /*Can be a collection of notes that will display harmonically as whole notes.
//     formatted 'c/4' or ['c/4', 'c/5']*/
//   }

export class Note extends Staff {
  constructor(props){
    super(props)
    if(!Array.isArray(this.props.note)){
      throw new Error(`The 'note' prop must be an array`)
    }
  }

  draw = () => {
    this.initStaff()
    const {wrong, type} = this.props
    // Create a voice in 4/4 and add above notes
    this.voice = new this.VF.Voice({num_beats: 4,  beat_value: 4});
    let note = this.vfNote
    if(wrong) note[0].setStyle({fillStyle: "red"});
    this.voice.addTickables(note);

    // Format and justify the notes to props.width.
    this.formatter = new this.VF.Formatter().joinVoices([this.voice]).format([this.voice], this.width);

    // Render voice
    //The 'this.stave' in the Staff class needs to be in the constructor to be accessible.
    this.voice.draw(this.context, this[`${type}Staff`]);
  }

  componentDidMount(){
    this.draw()
  }

  componentDidUpdate(){
    this.draw()
  }

  get accidentals(){
    let accidentals = []
    this.props.note.forEach((note, i) => {
      let acc = note.split('/')[0].slice(1)
      if(acc) accidentals.push([i, new this.VF.Accidental(acc)])
    })
    return accidentals
  }

  get vfNote(){
    let note = new this.VF.StaveNote({clef: this.props.type || 'treble', keys: this.props.note, duration: "w" })
    this.accidentals.forEach(acc => {
      note.addAccidental(...acc)
    })
    return [note]
  }
}
