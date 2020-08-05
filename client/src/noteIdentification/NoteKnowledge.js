import {noteArrays} from './noteArrays.js'

export class NoteKnowledge {

  constructor(knowledge){
    this.knowledge = knowledge
  }

  get nextStandard(){
    let {knowledge, eligible} = this
    if(eligible !== 1) return eligible

    let nextIdx = Object.keys(knowledge).length
    return noteArrays.standard[nextIdx]
  }

  get eligible(){
    let {knowledge} = this
    let n = 0, d = 0 //numerator and denomonator

    let s
    if(!knowledge['f/4']) s = 0
    else if(!knowledge['g/4']) s = 1
    else if(!knowledge['b/4']) s = 2
    else s = 3
    //Make sure the last s answer(s) in each record is a '1'. If not, return a percentage
    for(let note in knowledge){
      for(let i = 0; i < s; i++){
        d++
        if(knowledge[note].record[knowledge[note].record.length - i - 1] === '1'){
          n++
        } else {
          d+= (s - i)
          break
        }
      }
    }
    return d ? Number((n/d).toFixed(2)) : 1
  }
}
