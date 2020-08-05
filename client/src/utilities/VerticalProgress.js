import React, { Component } from 'react'

export default class VerticalProgress extends Component{
  render(){
    let {percentage} = this.props
    percentage = percentage || 0
    return (
      <div className='verticalProgress'>
        <div style={{flexGrow: Math.abs(percentage - 1).toString()}}></div>
        <div style={{flexGrow: percentage.toString(), backgroundColor: 'green'}}></div>
      </div>
    )
  }
}
