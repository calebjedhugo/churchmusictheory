import React, { Component } from 'react';
import {Button, Spinner, Modal} from 'react-bootstrap';
import {apiPath} from '../../App.js'

export default class DeleteSong extends Component{
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

  deleteSong = (callback) => {
    const {id} = this.props
    window.jquery.ajax({
      type:'POST',
      data:{
        action:'delete_song',
        recordingId: id
      },
      url: `${apiPath}`,
    }).done((data) => {
      try{data = JSON.parse(data)}
      catch(e){throw new Error(data)}
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
      const {getSongs, song_title, draft} = this.props
      return (
        <>
          <Button variant="danger" onClick={() => (this.setState({show: true}))}><i className="fas fa-trash"></i></Button>
          <Modal show={show} onHide={this.handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>{`Delete this ${!draft ? 'Song' : 'Draft'}?`}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <>{!draft ?
                `You are deleting "${song_title}". This is reccomended if the song is a week old. Continue?` :
                `Are you sure you want to delete this draft for '${song_title || 'untitled'}'?`
              }</>
              {error ? <div className='errorMessage'>{error}</div> : null}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={this.handleClose}>
                {`No!`}
              </Button>
              <Button variant="danger" onClick={() => {
                this.deleteSong(() => {
                  this.handleClose()
                  getSongs()
                })
              }}>
                {`Yes, please.`}
              </Button>
              {loading ? <Spinner animation="border" variant="primary" /> : null}
            </Modal.Footer>
          </Modal>
        </>
      )
  }

}
