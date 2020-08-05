import React, { Component } from 'react';
import {Button} from 'react-bootstrap';
import {SpecialChars} from '../notation/SpecialChars.js'
import ReactHtmlParser from 'react-html-parser'
import {CSSTransition} from 'react-transition-group';
import Sort from '../theoryTools/sort.js'

export class Panel extends Component {
  constructor(props){
    super(props)
    this.state = {activate: []}
    this.knowledge = [] //start as empty to animate mounting.
  }

  get buttons(){
    const {answer, newKnowledge, wrong, disableAll} = this.props
    //don't get confuse about knowledge here. Only the values are relevant, so it's changed to an array since we don't need the record or id.
    const knowledge = new Sort(Object.keys(this.props.knowledge))
    let r = []
    let a = {}

    knowledge.circle().forEach(elem => {
      let display = this.knowledgeDisplay(elem)
      let value = this.knowledgeValue(elem)
      if(a[value]) return //Already made this button
      a[value] = true
      let showAnswer = (newKnowledge || wrong) && answer === value ? 'showAnswer' : ''
      let wrongAnswer = wrong === value ? 'wrongAnswer' : ''
      let disabled = ((newKnowledge || wrong) && answer !== value) || disableAll
      r.push(
        <CSSTransition
          key={elem}
          in={!this.state.activate.includes(display[0])}
          classNames='panelButtonTrans'
          timeout={250}
          >
            <Button
              key={elem}
              answer={answer}
              onClick={!/Mobi/.test(navigator.userAgent) ? this.response : null}
              onTouchStart={!disabled ? this.response : null}
              value={value}
              className={`panelButton ${showAnswer} ${wrongAnswer}`}
              disabled={disabled}
              >
            {display}
            </Button>
        </CSSTransition>
      )
    })
    return r
  }

  componentDidMount(){ //prevProps does not show the old array. I don't know why.
    this.animateDiffs()
  }

  componentDidUpdate(){ //prevProps does not show the old array. I don't know why.
    this.animateDiffs()
  }

  animateDiffs = () => {
    let diffArray = []
    let prevKnowledge = Array.from(new Set(this.knowledge.map((elem) => {return this.knowledgeDisplay(elem)[0]}))) || []
    let knowledge = Array.from(new Set(Object.keys(this.props.knowledge).map((elem) => {return this.knowledgeDisplay(elem)[0]}))) || []
    // let prevKnowledge = JSON.parse(JSON.stringify(this.knowledge || []))
    // let knowledge = JSON.parse(JSON.stringify(this.props.knowledge || []))
    while(knowledge.length){
      if(knowledge[knowledge.length - 1] === prevKnowledge[prevKnowledge.length - 1]){
        knowledge.pop()
        prevKnowledge.pop()
      } else if(knowledge.length > prevKnowledge.length){
        diffArray.push(knowledge.pop())
      } else if(knowledge.length < prevKnowledge.length){
        diffArray.push(prevKnowledge.pop())
      } else {
        diffArray.push(knowledge.pop(), prevKnowledge.pop())
      }
    }
    if(diffArray.length){
      this.setState({activate: diffArray}, () => {this.setState({activate: []})})
    }
    this.knowledge = Object.keys(this.props.knowledge)
  }

  response = (e) => {
    const answer = e.target.getAttribute('answer')
    const input = e.target.getAttribute('value')
    const {handleAnswer} = this.props
    handleAnswer(answer, input)
  }

  knowledgeDisplay = (text) => {
    const {knowledgeType} = this.props
    switch(knowledgeType){
      case 'notes':
        let displayText = text.split('/')[0]
        displayText = displayText.replace(/#/g, new SpecialChars().sharp)
        displayText = displayText.replace(/(?!^)b/g, new SpecialChars().flat)
        return ReactHtmlParser(displayText)
      default:
        return text
    }
  }

  knowledgeValue = (text) => {
    const {knowledgeType, answer} = this.props
    if(!answer) return answer
    switch(knowledgeType){
      case 'notes':
        return `${text.split('/')[0]}/${answer.split('/')[1]}`
      default:
        return text
    }
  }

  render(){
    return (
      <div id='buttonPanel'>
        {this.buttons}
      </div>)
  }
}
