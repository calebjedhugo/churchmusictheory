import React, { Component } from 'react';
import {Spinner, Tabs, Tab, Table, Card} from 'react-bootstrap';
import Leave from './Leave.js'
import Join from './Join.js'
import AddSong from './AddSong.js'
import Sing from './Sing.js'
import jQuery from 'jquery'
import {apiPath} from '../../App.js'
import RoleChanger from './RoleChanger.js'
import PendingSubmissions from './PendingSubmissions.js'
import LogginButtons from '../../globalComponents/LoginButtons.js'
import Help from './Help.js'

if(!window.jquery){
  window.jquery = jQuery
}

export default class Worship extends Component {
  constructor(props){
    super(props)
    this.searchBox = React.createRef()
    this.state = {
      songName: '',
      church: '',
      role: '',
      recordingBuffer: '',
      playing: false,
      recording: false,
      loading: false,
      mixdown: false,
      error: '',
      members: [],
      songs: [],
      pendingSubmissions: [],
      initialized: false
    }
  }

  componentDidMount(){
    this.init()
  }

  init = () => {
    this.setState({loading: true})
    window.jquery.ajax({
      type:'GET',
      data:{
        action:'chuch_data'
      },
      url: apiPath,
    }).done((data) => {
      try{data = JSON.parse(data)}
      catch(e){throw new Error(data)}
      this.setState({
        church: data ? data.church : '',
        role: data ? data.role : '',
        initialized: true
      })
      if(!data) return
      this.getMembers()
      this.getPendingSubmissions()
    }).fail((xrh, status, e) => {
      this.setState({error: xrh.responseText})
      console.error(xrh.responseText)
    }).always(() => {
      this.setState({loading: false})
    })
    this.getSongs()
  }

  componentDidUpdate(prevProps){
    if(this.props.role === 'leader' && prevProps.role !== 'leader'){
      this.getMembers()
    }
  }

  getMembers = () => {
    window.jquery.ajax({
      type:'GET',
      data:{
        action:'church_members'
      },
      url: `${apiPath}`,
    }).done((data) => {
      try{data = JSON.parse(data)}
      catch(e){throw new Error(data)}
      if(!data) return
      this.setState({
        members: data
      })
    }).fail((xrh, status, e) => {
      this.setState({error: xrh.responseText})
      console.error(xrh.responseText)
    })
  }

  getSongs = () => {
    window.jquery.ajax({
      type:'GET',
      data:{
        action:'songs'
      },
      url: `${apiPath}`,
    }).done((data) => {
      try{data = JSON.parse(data)}
      catch(e){throw new Error(data)}
      if(!data) return
      this.setState({
        songs: data
      })
    }).fail((xrh, status, e) => {
      this.setState({error: xrh.responseText})
      console.error(xrh.responseText)
    })
  }

  resetUI = () => {
    this.setState({church: '', role: '', leaveModal: false})
  }

  setChurchAndRole = (data) => {
    this.setState({
      church: data.church || this.state.church,
      role: data.role || this.state.role
    })
  }

  getRecording = (id) => {
    this.setState({loading: true})
    return new Promise((resolve) => {
      window.jquery.ajax({
        type:'GET',
        data:{
          action:'get_recording',
          id: id
        },
        url: `${apiPath}`
      }).done((data) => {
        try{data = JSON.parse(data)}
        catch(e){throw new Error(data)}
        resolve(data)
      }).fail((xrh, status, e) => {
        this.setState({error: xrh.responseText})
        console.error(xrh.responseText)
        resolve(xrh.responseText)
      }).always(() => {
        this.setState({loading: false})
      })
    })
  }

  getTakes = (id) => {
    return new Promise(resolve => {
      this.setState({loading: true})
      window.jquery.ajax({
        type:'GET',
        data:{
          action:'get_takes',
          masterRef: id
        },
        url: `${apiPath}`,
      }).done((data) => {
        try{data = JSON.parse(data)}
        catch(e){throw new Error(data)}
        if(!data) return
        resolve(data)
      }).fail((xrh, status, e) => {
        this.setState({error: xrh.responseText})
        console.error(xrh.responseText)
        resolve(xrh.responseText)
      }).always(() => {
        this.setState({loading: false})
      })
    })
  }

  getPendingSubmissions = () => {
    //pendingSubmissions
    const {role} = this.state
    if(role !== 'leader') return
    this.setState({loading: true})
    window.jquery.ajax({
      type:'GET',
      data:{
        action:'pending_submissions'
      },
      url: `${apiPath}`,
    }).done((data) => {
      try{data = JSON.parse(data)}
      catch(e){throw new Error(data)}
      this.setState({pendingSubmissions: data})
    }).fail((xrh, status, e) => {
      this.setState({error: xrh.responseText})
      console.error(xrh.responseText)
    }).always(() => {
      this.setState({loading: false})
    })
  }

  setMembers = data => {
    this.setState({members: data})
  }

  get tabs(){
    const {members, songs, role, pendingSubmissions} = this.state
    return (
      <Tabs defaultActiveKey="worship" id="tabs" className="worshipTabs">
        <Tab eventKey="worship" title="Worship">
          {songs.length ?
          <Tabs id="songTabs" defaultActiveKey={songs[0].id}>
            {songs.map(elem => {
              return (
                <Tab key={elem.id} eventKey={elem.id} title={elem.song_title}>
                  <Sing getSongs={this.getSongs} role={role} getTakes={this.getTakes} getRecording={this.getRecording} {...elem} soundManager={this.props.soundManager} recorderContext={this.props.recorderContext}/>
                </Tab>
              )
            })}
          </Tabs> : <div>{'No songs are being sung right now.'}</div>}

        </Tab>
        {role === 'leader' ? <Tab eventKey="addSong" title="Add Songs">
          <AddSong existingSongNumber={songs.length} getSongs={this.getSongs} getTakes={this.getTakes} getRecording={this.getRecording} soundManager={this.props.soundManager} recorderContext={this.props.recorderContext}/>
        </Tab> : null}
        <Tab eventKey="members" title="Members">
          <Table className='membersTable'>
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                {role !== 'leader' ? null : <th>Email</th>}
              </tr>
            </thead>
            <tbody>
              {members.map((elem, i) => {
                return (
                  <tr key={i}>
                    <td>{elem.display_name}</td>
                    <td>{role !== 'leader' ? elem.role : <RoleChanger id={elem.user_id} selected={elem.role} setMembers={this.setMembers}/>}</td>
                    {role !== 'leader' ? null :  <td>{elem.user_email}</td>}
                  </tr>
                )
              })}
            </tbody>
          </Table>
        </Tab>
        {pendingSubmissions.length ?
          <Tab eventKey="approve" title="Pending Submissions">
            <PendingSubmissions getRecording={this.getRecording} setMembers={this.setMembers} pendingSubmissions={pendingSubmissions} soundManager={this.props.soundManager} recorderContext={this.props.recorderContext}/>
          </Tab> : null}
          <Tab eventKey="tips" title="Help">
            <Help />
          </Tab>
      </Tabs>
    )
  }

  get worship(){
    const {church, role, members} = this.state
    return (
      <Card>
        <Card.Header>{`Worship with ${church}`}</Card.Header>
        <Card.Body>{this.tabs}</Card.Body>
        <Card.Footer>
          <div className='dangerButtonDiv'>
            <Leave resetUI={this.resetUI} setChurchAndRole={this.setChurchAndRole} role={role} church={church} members={members}/>
          </div>
        </Card.Footer>
      </Card>
    )
  }

  render(){
    const {church, error, loading, initialized} = this.state
    const {loggedIn} = this.props
    return loggedIn ? (
      <>
        <>
          {error ? <div className='errorMessage'>{error}</div> : null}
          {church ? this.worship : initialized ? <Join init={this.init}/> : null}
          {loading ? <Spinner animation="border" variant="primary" /> : null}
        </>
      </>
    ) :
    <>
      <Card>
        <Card.Body>
          <Card.Title>{'Please Create an account.'}</Card.Title>
          <LogginButtons />
        </Card.Body>
      </Card>
    </>
  }
}
