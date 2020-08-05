import React, { Component } from 'react';
import {Button, Spinner, Modal} from 'react-bootstrap';
import {apiPath} from '../../App.js'

export default class DeleteTake extends Component{
  constructor(props){
    super(props)
    this.state = {show: false, loading: false, error: ''}
  }

  handleClose = () => {
    this.setState({show: false})
  }

  componentDidMount() {
    this._isMounted = true
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  deleteTake = (callback) => {
    const {id, setTakes} = this.props
    this.setState({loading: true})
    window.jquery.ajax({
      type:'POST',
      data:{
        action:'delete_take',
        recordingId: id
      },
      url: `${apiPath}`,
    }).done((data) => {
      try{data = JSON.parse(data)}
      catch(e){throw new Error(data)}
      setTakes(data)
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
          <Button variant="danger" onClick={() => (this.setState({show: true}))}>{`Delete`}</Button>
          <Modal show={show} onHide={this.handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>{`Delete take ${takeNumber}?`}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {`Are you sure you want to delete take ${takeNumber}? This cannot be undone.`}
              {error ? <div className='errorMessage'>{error}</div> : null}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={this.handleClose}>
                {`No, don't!`}
              </Button>
              <Button variant="danger" onClick={() => {
                this.deleteTake(() => {
                  this.handleClose()
                })
              }}>
                {`Yeah, I don't like it.`}
              </Button>
              {loading ? <Spinner animation="border" variant="primary" /> : null}
            </Modal.Footer>
          </Modal>
        </>
      )
  }

}
