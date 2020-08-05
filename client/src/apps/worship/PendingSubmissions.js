import React, { Component } from 'react';
import {Table, Button, Modal} from 'react-bootstrap';
import RecordButton from './RecordButton.js'
import RoleChanger from './RoleChanger.js'
import {apiPath} from '../../App.js'

export default class PendingSubmissions extends Component{

  render(){
    const {pendingSubmissions, setMembers, getRecording} = this.props
    return (
      <Table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
            <th>Recording</th>
            <th>Approve</th>
          </tr>
        </thead>
        <tbody>
          {pendingSubmissions.map((elem, i) => {
            return (
              <tr key={i}>
                <td>{elem.display_name}</td>
                <td>
                  <RoleChanger id={elem.user_id} selected={elem.role} setMembers={setMembers} />
                </td>
                <td>
                  <RecordButton
                    soundManager={this.props.soundManager}
                    recorderContext={this.props.recorderContext}
                    getRecording={getRecording}
                    recordingId={elem.recording_id}
                    completedTake={true}
                    reviewing={true}
                  />
                </td>
                <td><ApproveButton id={elem.recording_id} display_name={elem.display_name} /></td>
              </tr>
            )
          })}
        </tbody>
      </Table>
    )
  }
}

class ApproveButton extends Component{
  constructor(props){
    super(props)
    this.state = {
      loading: false,
      error: '',
      show: false,
      approved: false
    }
  }

  approveRecording = () => {
    const {id} = this.props
    this.setState({loading: true})
    window.jquery.ajax({
      type:'POST',
      data:{
        action:'approve_recording',
        id: id
      },
      url: `${apiPath}`,
    }).done((data) => {
      try{data = JSON.parse(data)}
      catch(e){throw new Error(data)}
      this.setState({error: '', show: false, approved: true})
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
    const {show, error, approved} = this.state
    const {display_name} = this.props
    return !approved ? (
      <>
        <Button onClick={() => {
          this.setState({show: true})
        }}>{'Approve'}</Button>
        <Modal show={show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Approve this recording</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {`You are publishing this submission from ${display_name}. This cannot be undone.`}
            {error ? <div className='errorMessage'>{error}</div> : null}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleClose}>
              Oops, not yet.
            </Button>
            <Button variant="primary" onClick={() => {
              this.approveRecording()
            }}>
              Yeah, it's good.
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    ) : <div>Approved</div>
  }
}
