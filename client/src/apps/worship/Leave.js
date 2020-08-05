import React, { Component } from 'react';
import {Button, Spinner, Modal, DropdownButton, Dropdown} from 'react-bootstrap';
import {apiPath} from '../../App.js'

export default class extends Component {
  constructor(props){
    super(props)
    this.state = {
      reliquishTo: {},
      leaveModal: false,
      relinquishModal: false,
      deleteModal: false,
      loading: false,
      error: ''
    }
  }

  componentDidMount() {
    this._isMounted = true
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  relinquish = () => {
    const {reliquishTo} = this.state
    const {setChurchAndRole} = this.props
    this.setState({loading: true})
    window.jquery.ajax({
      type: 'POST',
      data:{
        action: 'transfer_leadership',
        id: reliquishTo.user_id
      },
      url: apiPath
    }).done((data) => {
      try{data = JSON.parse(data)}
      catch(e){this.setState({error: data})}
      this.setState({relinquishModal: false})
      setChurchAndRole(data)
    }).fail((xrh, status, e) => {
      this.setState({error: xrh.responseText})
      console.error(xrh.responseText)
    }).always(() => {
      this._isMounted && this.setState({loading: false})
    })
  }

  leaveChurch = () => {
    const {resetUI} = this.props
    window.jquery.ajax({
      type: 'POST',
      data:{
        action: 'leave_church'
      },
      url: apiPath
    }).done((data) => {
      try{data = JSON.parse(data)}
      catch(e){this.setState({error: data})}
      this.setState({leaveModal: false})
      resetUI()
    }).fail((xrh, status, e) => {
      this.setState({error: xrh.responseText})
      console.error(xrh.responseText)
    }).always(() => {
      this._isMounted && this.setState({loading: false})
    })
  }

  deleteChurch = () => {
    const {resetUI} = this.props
    window.jquery.ajax({
      type: 'POST',
      data: {
        action: 'delete_church'
      },
      url: apiPath
    }).done((data) => {
      try{data = JSON.parse(data)}
      catch(e){this.setState({error: data})}
      this.setState({deleteModal: false})
      resetUI()
    }).fail((xrh, status, e) => {
      this.setState({error: xrh.responseText})
      console.error(xrh.responseText)
    }).always(() => {
      this._isMounted && this.setState({loading: false})
    })
  }

  render(){
    const {church, role, members} = this.props
    const {leaveModal, relinquishModal, deleteModal, reliquishTo, loading, error} = this.state
    if(role === 'leader'){
      if(members.length){
        const handleClose = () => {this.setState({relinquishModal: false})}
        return (
          <>
            <Button variant='danger' onClick={() => {this.setState({relinquishModal: true})}}>{members.length ? 'Relinquish Leadership' : 'Delete Church'}</Button>
            <Modal show={relinquishModal} onHide={handleClose}>
              <Modal.Header closeButton>
                <Modal.Title>{`Relinquish Leadership`}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {`Select a new leader:`}
                <DropdownButton title={reliquishTo.display_name || 'Choose Leader'}>
                  {members.map(elem => {
                    return (<Dropdown.Item key={elem.user_id} onSelect={() => this.setState({reliquishTo: elem})}>
                      {elem.display_name}
                    </Dropdown.Item>)
                  })}
                </DropdownButton>
                <div>{`Giving leadership to ${reliquishTo.display_name || ''}`}</div>
                {error ? <div className='errorMessage'>{error}</div> : null}
              </Modal.Body>
              <Modal.Footer>
                {loading ? <Spinner animation="border" variant="primary" /> : null}
                <Button variant="secondary" onClick={handleClose}>
                  {`Cancel`}
                </Button>
                {<Button variant="danger" disabled={!Boolean(reliquishTo.user_id)} onClick={this.relinquish}>
                  {`Transfer Leadership`}
                </Button>}
              </Modal.Footer>
            </Modal>
          </>
        )
      } else {
        const handleClose = () => {this.setState({deleteModal: false})}
        return (
          <>
            <Button variant='danger' onClick={() => {this.setState({deleteModal: true})}}>{`Delete ${church}`}</Button>
            <Modal show={deleteModal} onHide={handleClose}>
              <Modal.Header closeButton>
                <Modal.Title>{`Delete ${church}?`}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {`Are you sure you want to delete ${church}?`}
                {error ? <div className='errorMessage'>{error}</div> : null}
              </Modal.Body>
              <Modal.Footer>
                {loading ? <Spinner animation="border" variant="primary" /> : null}
                <Button variant="secondary" onClick={handleClose}>
                  {`No!`}
                </Button>
                {<Button variant="danger" onClick={this.deleteChurch}>
                  {`Yes, please.`}
                </Button>}
              </Modal.Footer>
            </Modal>
          </>
        )
      }
    } else {
      const handleClose = () => {this.setState({leaveModal: false})}
      return (
        <>
          <Button size='sm' variant='danger' className='dangerButton' onClick={() => {this.setState({leaveModal: true})}}>{`Leave ${church}`}</Button>
          <Modal show={leaveModal} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>{`Leave ${church}?`}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {`Are you sure you want to leave ${church}? You leader will not be notified.`}
              {error ? <div className='errorMessage'>{error}</div> : null}
            </Modal.Body>
            <Modal.Footer>
              {loading ? <Spinner animation="border" variant="primary" /> : null}
              <Button variant="secondary" onClick={handleClose}>
                {`No thanks!`}
              </Button>
              {<Button variant="danger" onClick={this.leaveChurch}>
                {`Yes, please.`}
              </Button>}
            </Modal.Footer>
          </Modal>
        </>
      )
    }
  }
}
