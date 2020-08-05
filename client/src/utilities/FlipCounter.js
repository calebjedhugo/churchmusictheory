import React, { Component } from 'react'
import {Badge} from 'react-bootstrap';
import {CSSTransition} from 'react-transition-group';

export default class FlipCounter extends Component {
  constructor(props){
    super(props)
    this.state = {
      currentNumber: <div>{this.props.count}</div>,
      pastNumber: null,
      transitioning: false
    }
  }

  render(){
    const {currentNumber, pastNumber, transitioning} = this.state
    return (
      <Badge className='flipCounter'>
        {currentNumber ?
          <CSSTransition
            timeout={250}
            classNames='flipCounterNew'
            onEntered={() => {this.setState({transitioning: false})}}
            in={transitioning}>
              {currentNumber}
          </CSSTransition> : null}
          {pastNumber ?
            <CSSTransition
              timeout={250}
              classNames='flipCounterOld'
              onExited={() => this.setState({transitioning: false})}
              in={transitioning}
              unmountOnExit>
                {pastNumber}
            </CSSTransition> : null}
      </Badge>
    )
  }

  componentDidUpdate(prevProps){
    if(this.props.count !== prevProps.count){
      this.setState({
        currentNumber: <div>{this.props.count}</div>,
        pastNumber: this.state.currentNumber
      }, () => {this.setState({transitioning: true})})
    }
  }
}
