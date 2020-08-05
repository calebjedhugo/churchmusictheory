export default class Sort {
  constructor(noteArray){
    this.noteArray = noteArray
  }

  circle = (opt) => {
    /*opt = {reverse: bool}*/
    opt = opt || {}
    return this.noteArray.sort((a, b) => {
      return this.circleOfFifths.indexOf((opt.reverse ? b : a).split('/')[0]) - this.circleOfFifths.indexOf((opt.reverse ? a : b).split('/')[0])
    })
  }

  get circleOfFifths(){
    return ['c', 'b#', 'g', 'd', 'a', 'e', 'fb', 'b', 'cb', 'f#', 'gb', 'c#', 'db', 'ab', 'g#', 'eb', 'd#', 'bb', 'a#', 'f', 'e#']
  }
}
