import React, { Component } from 'react';
import {Button, Spinner, Modal} from 'react-bootstrap';
import {apiPath} from '../../App.js'

export default class SubmitTake extends Component{
  constructor(props){
    super(props)
    this.state = {show: false, loading: false, error: ''}
  }

  handleClose = () => {
    if(this._isMounted) this.setState({show: false})
  }

  componentDidMount() {
    this._isMounted = true
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  submitTake = (callback) => {
    const {id, setTakes} = this.props
    this.setState({loading: true})
    window.jquery.ajax({
      type:'POST',
      data:{
        action:'submit_take',
        recordingId: id
      },
      url: `${apiPath}`,
    }).done((data) => {
      this.setState({error: ''})
      try{data = JSON.parse(data)}
      catch(e){throw new Error(data)}
      setTakes()
      if(callback && this._isMounted) callback()
    }).fail((xrh, status, e) => {
      this.setState({error: xrh.responseText})
      console.error(xrh.responseText)
    }).always(() => {
      if(this._isMounted) this.setState({loading: false})
    })
  }

  render(){
      const {show, error, loading} = this.state
      const {takeNumber} = this.props
      return (
        <>
          <Button disabled={!Boolean(takeNumber)} variant="primary" onClick={() => (this.setState({show: true}))}>{`Submit Take`}</Button>
          <Modal show={show} onHide={this.handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>{`Submit take ${takeNumber}?`}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {`Are you sure you want to submit take ${takeNumber}? This cannot be undone.`}
              {error ? <div className='errorMessage'>{error}</div> : null}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={this.handleClose}>
                {`No, don't!`}
              </Button>
              <Button variant="primary" onClick={() => {
                this.submitTake(() => {
                  this.handleClose()
                })
              }}>
                {`Yeah, I like it.`}
              </Button>
              {loading ? <Spinner animation="border" variant="primary" /> : null}
              {error ? <div className={'errorMessage'}>{error}</div> : null}
            </Modal.Footer>
          </Modal>
        </>
      )
  }

}
