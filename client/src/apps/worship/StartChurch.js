import React, { Component } from 'react';
import {Button, InputGroup, FormControl, Spinner, Modal} from 'react-bootstrap';
import {apiPath} from '../../App.js'

export default class StartChurch extends Component{
  constructor(props){
    super(props)
    this.state = {
      church: '',
      show: false,
      loading: false
    }
  }

  componentDidMount() {
    this._isMounted = true
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  startChurch = () => {
    const {church} = this.state
    const {init} = this.props
    this.setState({loading: true})
    window.jquery.ajax({
      type: 'POST',
      data:{
        action: 'start_church',
        church: church
      },
      url: apiPath
    }).done((data) => {
      try{data = JSON.parse(data)}
      catch(e){this.setState({error: data})}
      this.setState({show: false})
      init()
    }).fail((xrh, status, e) => {
      this.setState({error: xrh.responseText})
      console.error(xrh.responseText)
    }).always(() => {
      this._isMounted && this.setState({loading: false})
    })
  }

  render() {
    const {show, church, loading, error} = this.state
    const handleClose = () => {this._isMounted && this.setState({show: false})}
    return (
      <>
        <Button onClick={() => {this.setState({show: true})}}>{'Start a Church'}</Button>
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>{`Start a Church`}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <InputGroup>
              <FormControl
                ref={this.searchBox}
                placeholder={`Type your church's name`}
                aria-label="church"
                aria-describedby="basic-addon1"
                onChange={(e) => {
                  this.setState({church: e.target.value})
                }}
                value={church}
              />
            </InputGroup>
            {loading ? <Spinner animation="border" variant="primary" /> : null}
            {error ? <div className='errorMessage'>{error}</div> : null}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              {`Cancel`}
            </Button>
            <Button disabled={!church} variant="primary" onClick={this.startChurch}>
              {`Start Church`}
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    )
}
}
