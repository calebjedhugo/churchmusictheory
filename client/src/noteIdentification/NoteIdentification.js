import React, { Component } from 'react'
import {Question} from './Question.js'
import {Panel} from '../inputs/panel.js'
import {NoteKnowledge} from './NoteKnowledge.js'
import {CSSTransition} from 'react-transition-group';
import {Card} from 'react-bootstrap';
import FlipCounter from '../utilities/FlipCounter.js'
import VerticalProgress from '../utilities/VerticalProgress.js'

export class NoteIdentification extends Component{
  constructor(props){
    super(props)

    this.knowledge = this.props.knowledge
    this.state = {
      wrong: null,
      showNewQuestion: false,
      lastQuestion: null,
      points: this.points || 0
    }
    this.noteRegExp = /^(a|b|c|d|e|f|g)(#{0,2}|b{0,2})\/\d\d?$/
  }

  componentDidMount(){
    let firstNote = this.randomNote
    this.setState({
      showNewQuestion: true,
      activeNote: firstNote,
      newKnowledge: !Boolean(this.knowledge[firstNote].record),
      currentQuestion: this.question(firstNote)
    })
  }

  componentDidUpdate(prevProps){
    if(this.props.knowledge && prevProps.knowledge){
      if(Object.keys(this.props.knowledge).length !== Object.keys(prevProps.knowledge).length && this.state.activeNote === 'c/4'){
        this.knowledge = this.props.knowledge
        this.nextQuestion()
      }
    }
  }

  handleNotesAnswer = (answer, input) => {
    const {handleAnswer} = this.props
    const {wrong} = this.state


    // correct answers don't count if in a faulted state.
    if(!wrong) this.knowledge = handleAnswer(answer, input)

    //If it's a number, put it into the percentage
    let note = new NoteKnowledge(this.knowledge).nextStandard
    this.setState({percentage: typeof note === 'number' ? note : 1})

    if(answer !== input){
      this.setState({
        wrong: this.question(input, true),
        showWrongAnswer: false
      }, () => this.setState({showWrongAnswer: true}))
      return
    } else {
      if(wrong){
        return this.nextQuestion() //We don't reward wrong answers!
      }
    }

    if(typeof note === 'number') return this.nextQuestion() //current record does not demand adding knowledge

    if(typeof note !== 'string') throw new Error('note must be a string')
    note = note.toLowerCase()

    if(!this.noteRegExp.test(note)) throw new Error(`${note} is not a valid note (ab/4)`)

    this.props.newKnowledge(note, this.nextQuestion)
  }

  nextQuestion = () => {
    const {newNote, knowledge, question} = this

    this.setState({
      activeNote: newNote,
      newKnowledge: !Boolean(knowledge[newNote].record),
      lastQuestion: question(this.state.activeNote),
      showLastQuestion: true,
      showNewQuestion: false,
      currentQuestion: question(newNote)
    }, () => {this.setState({showLastQuestion: false, showNewQuestion: true})})
  }

  question = (newNote, wrong) => {
    let grand = Boolean(this.knowledge['c/3'] || newNote === 'c/3')
    if(!newNote) return <div></div>
    return <Question note={newNote} wrong={wrong} grand={grand}/>
  }

  get randomNote(){ //random, but weighted using the answer record
    const {knowledge} = this.props
    let a = [] //all knowledge with weights.
    let f = [] //recently learned or forgotten knowledge.
    let points = 0
    for(let elem in knowledge){
      if(!knowledge[elem].record){
        this.points = points //we'll update the state elsewhere since this is called on init.
        return elem
      }

      let lastTen = knowledge[elem].record.slice(Math.max(knowledge[elem].record.length - 10, 0))
      //recently learned
      if(lastTen.length < 3) {
        f.push(elem)
      } else {
        for(let i2 = lastTen.length - 1; i2 >= lastTen.length - 3; i2--){
          if(lastTen[i2] !== '1'){
            f.push(elem)
            break
          }
        }
      }

      let w = knowledge[elem].record.split('0').length + (Math.floor(knowledge[elem].record.split('?').length / 2)) + Math.abs(lastTen.length - 10)
      for(let i2 = 0; i2 < w; i2++){
        if(this.state.activeNote !== elem) a.push(elem)
      }

      for(let i2 = lastTen.length - 1; i2 >= 0; i2--){
        if(lastTen[i2] === '1') points++
        else if(lastTen[i2] === '0') break
      }
    }
    this.points = points //we'll update the state elsewhere since this is called on init.
    if(f.length && Math.random() > .75){
      return f[Math.floor(f.length * Math.random())]
    }
    return a[Math.floor(a.length * Math.random())]
  }

  get newNote(){
    const {activeNote} = this.state
    const {knowledge} = this.props
    let note = this.randomNote

    let i = 0
    while(note === activeNote && Object.keys(knowledge).length > 1){
      note = this.randomNote
      if(!knowledge[note].record) break
      i++
      if(i > 1000) throw new Error(`activeNote and note are always the same: ${activeNote}, ${note}`)
    }

    return note
  }

  render(){
    const {points, percentage, activeNote, newKnowledge, wrong, currentQuestion, lastQuestion, showLastQuestion, showNewQuestion, showWrongAnswer, transitioning} = this.state
    const {knowledge} = this.props
    return (
      <React.Fragment>
        <div className='hcenter'>
          <CSSTransition
            timeout={500}
            classNames='newQuestion'
            in={showNewQuestion && !(wrong && !transitioning)}>
              <Card className={`question${wrong && !transitioning ? '-badAnswer' : ''}`}>
                  {currentQuestion}
              </Card>
          </CSSTransition>
          {wrong ? <CSSTransition
              unmountOnExit
              timeout={250}
              in={showWrongAnswer}
              classNames={'wrongAnswerNote'}>
                {wrong}
            </CSSTransition> : null}
          {lastQuestion ?
            <CSSTransition
              unmountOnExit
              onExit={() => {this.setState({transitioning: true, showWrongAnswer: false})}}
              onExited={() => {this.setState({transitioning: false, wrong: null, points: this.points})}}
              in={showLastQuestion}
              timeout={250}
              classNames={wrong ? 'failedQuestion' : 'answeredQuestion'}>
                <Card>{lastQuestion}{wrong}</Card>
            </CSSTransition> : null}
            <div className='vertical-div'>
              <div><FlipCounter count={points}/></div>
              <VerticalProgress percentage={percentage}/>
            </div>
        </div>
        <div className='hcenter'>
          <Panel
            newKnowledge={newKnowledge}
            knowledge={knowledge}
            answer={activeNote}
            knowledgeType='notes'
            handleAnswer={this.handleNotesAnswer}
            wrong={wrong ? wrong.props.note : false}
            disableAll={transitioning}
          />
        </div>
      </React.Fragment>
    )
  }
}
