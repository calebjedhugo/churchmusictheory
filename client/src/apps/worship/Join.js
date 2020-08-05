import React, { Component } from 'react';
import {Button, InputGroup, FormControl, Card, Spinner, Modal} from 'react-bootstrap';
import StartChurch from './StartChurch.js'
import {apiPath} from '../../App.js'

export default class Join extends Component {

  constructor(props){
    super(props)
    this.state = {
      searchBox: '',
      leaderSearch: '',
      joinModal: false,
      joinId: 0,
      churchList: [],
    }
  }

  componentDidMount() {
    this._isMounted = true
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  joinChurch = () => {
    const {joinId} = this.state
    const {init} = this.props
    this.setState({loading: true})
    window.jquery.ajax({
      type: 'POST',
      data:{
        action: 'join_church',
        id: joinId
      },
      url: `${apiPath}`
    }).done((data) => {
      try{data = JSON.parse(data)}
      catch(e){this.setState({error: data})}
      this.setState({joinModal: false})
      init()
    }).fail((xrh, status, e) => {
      this.setState({error: xrh.responseText})
      console.error(xrh.responseText)
    }).always(() => {
      this._isMounted && this.setState({loading: false})
    })
  }

  handleChurchText = (e) => {
    const {leaderSearch} = this.state
    this.setState({searchBox: e.target.value})
    if(e.target.value.length < 3) return
    this.setState({loading: true})
    window.jquery.ajax({
      type:'GET',
      data:{
        action: 'chuch_names',
        search: e.target.value,
        leader: leaderSearch
      },
      url: `${apiPath}`
    }).done((data) => {
      try{data = JSON.parse(data)}
      catch(e){this.setState({error: data})}
      if(!Array.isArray(data)) this.setState({error: data})
      this.setState({churchList: data})
    }).fail((xrh, status, e) => {
      this.setState({error: xrh.responseText})
      console.error(xrh.responseText)
    }).always(() => {
      this.setState({loading: false})
    })
  }

  handleLeaderText = (e) => {
    const {searchBox} = this.state
    this.setState({
      leaderSearch: e.target.value,
      loading: true
    })
    window.jquery.ajax({
      type:'GET',
      data:{
        action: 'chuch_names',
        leader: e.target.value,
        search: searchBox
      },
      url: `${apiPath}`
    }).done((data) => {
      try{data = JSON.parse(data)}
      catch(e){this.setState({error: data})}
      if(!Array.isArray(data)) this.setState({error: data})
      this.setState({churchList: data, loading: false})
    }).fail((xrh, status, e) => {
      this.setState({error: xrh.responseText})
      console.error(xrh.responseText)
    }).always(() => {
      this.setState({loading: false})
    })
  }

  get churchList(){
    const {searchBox, churchList} = this.state
    if(searchBox.length < 3) return <Card onClick={() => {this.searchBox.current.focus()}} className='churchOption'>{'Begin typing to search.'}</Card>
    let f = []
    if(!Array.isArray(churchList)) return <Card className='churchOption'>{'Something went wrong...'}</Card>
    churchList.forEach(elem => {
      f.push(
        <Card key={elem.church} className='churchOption' onClick={() => {
          this.setState({
            joinModal: true,
            searchBox: elem.church,
            leaderSearch: elem.leader,
            joinId: elem.id
          })
        }}>
          {`${elem.church} | ${elem.leader}`}
        </Card>
      )
    })
    return f.length ? f : <Card className='churchOption'>{'No churches found'}</Card>
  }

  render(){
    const {searchBox, loading, leaderSearch, joinModal} = this.state
    const {init} = this.props
    //this.state.joinModal is set to 'true' when a church name is clicked.
    const handleClose = () => {this.setState({joinModal: false})}
    return (
      <Card>
        <Card.Header>{'Join a church'}</Card.Header>
        <Card.Body>
          <InputGroup>
            <FormControl
              ref={this.searchBox}
              placeholder={`Church`}
              aria-label="church"
              aria-describedby="basic-addon1"
              onChange={this.handleChurchText}
              value={searchBox}
            />
            <FormControl
              ref={this.searchLeader}
              placeholder={`Leader`}
              aria-label="leader"
              aria-describedby="basic-addon1"
              onChange={this.handleLeaderText}
              value={leaderSearch}
            />
            {loading ? <InputGroup.Append><Spinner animation="border" variant="primary" /></InputGroup.Append> : null}
          </InputGroup>
          {this.churchList}
        </Card.Body>
        <Card.Footer>
          <span>or...</span>
          <StartChurch init={init}/>
          <Modal show={joinModal} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>{`Join ${searchBox}?`}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{`By joining ${searchBox}, ${leaderSearch} will gain access to your email address. Are you sure you want to join?`}</Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                {`No thanks!`}
              </Button>
              <Button variant="primary" onClick={this.joinChurch}>
                {`Yes, that's my church!`}
              </Button>
            </Modal.Footer>
          </Modal>
        </Card.Footer>
      </Card>
    )
  }
}
