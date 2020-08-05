import React, { Component } from 'react'
import {Button, Spinner, Modal, Form} from 'react-bootstrap'
import {apiPath} from '../../App.js'

export default class EditButton extends Component{
  constructor(props){
    super(props)
    this.state = {
      show: false,
      loading: false,
      error: '',
      lyrics: this.props.lyrics,
      songTitle: this.props.song_title,
      unSaved: false
    }
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

  updateDraft = () => {
    const {id, getSongs} = this.props
    const {songTitle, lyrics} = this.state
    this.setState({loading: true})
    window.jquery.ajax({
      type:'POST',
      data:{
        action:'save_draft',
        masterRef: id,
        lyrics: lyrics,
        songTitle: songTitle
      },
      url: `${apiPath}`,
    }).done((data) => {
      try{data = JSON.parse(data)}
      catch(e){throw new Error(data)}
      this.handleClose()
      getSongs()
      this.setState({error: ''})
    }).fail((xrh, status, e) => {
      this.setState({error: xrh.responseText})
      console.error(xrh.responseText)
    }).always(() => {
      this.setState({loading: false})
    })
  }

  handleClose = () => {
    this.setState({show: false})
  }

  render(){
    const {unSaved, songTitle, lyrics, show, error, loading} = this.state
    return (
      <>
        <Button variant="primary" onClick={() => (this.setState({show: true}))}><i className="fa fa-pencil-square-o"></i></Button>
        <Modal show={show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>{`Editing ${songTitle}`}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="songTitleEdit">
                <Form.Control value={songTitle} type="text" placeholder="Song Title" onChange={
                  e => {this.setState({songTitle: e.target.value, unSaved: true})}
                }/>
              </Form.Group>
                <Form.Group controlId="lyricsEdit">
                  <Form.Control value={lyrics} as="textarea" rows="10" placeholder="lyrics" onChange={
                    e => {this.setState({lyrics: e.target.value, unSaved: true})}
                  }/>
              </Form.Group>
            </Form>
            {error ? <div className='errorMessage'>{error}</div> : null}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleClose}>
              {`Cancel`}
            </Button>
            <Button disabled={!unSaved} variant="primary" onClick={this.updateDraft}>
              {`Update`}
            </Button>
            {loading ? <Spinner animation="border" variant="primary" /> : null}
          </Modal.Footer>
        </Modal>
      </>
    )
  }
}
