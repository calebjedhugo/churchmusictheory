import React, { Component } from 'react'
import {Modal, Button} from 'react-bootstrap'
import LogginButtons from './LoginButtons.js'

export default class RegisterModal extends Component {
  constructor(props){
    super(props)
    this.state = {twoSeconds: false}
  }

  componentDidUpdate(prevProps){
    const {show} = this.props
    if(!prevProps.show && show){
      setTimeout(() => {
        this.setState({twoSeconds: true})
      }, 2000)
    }
    if(!show && prevProps.show){
      this.setState({twoSeconds: false})
    }
  }

  render(){
    const {show} = this.props
    const {twoSeconds} = this.state
    let handleClose = twoSeconds ? this.props.handleClose : function(){}

    return (
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Create Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>Your data is important. Please create an account or log in to continue.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Maybe Later</Button>
          <LogginButtons />
        </Modal.Footer>
      </Modal>
    )
  }
}
