import React, { Component } from 'react';
import './App.css';
import {NoteIdentification} from './noteIdentification/NoteIdentification.js'
import {Navbar, NavDropdown, Button} from 'react-bootstrap';
import LocalStorage from './globalComponents/LocalStorage.js'
import RegisterModal from './globalComponents/RegisterModal.js'
import Worship from './apps/worship/Worship.js'
import SoundManager from './webAudio/SoundManager'

export const apiPath = function(){
  let s = window.location.href[4] === 's' ? 's' : ''
  let host = window.location.host
  let apiPath = `http${s}://${window.location.host}`
  if(host.slice(host.length - 5) === ':3000'){
    apiPath = apiPath.slice(0, apiPath.length - 1) + '1'
  }
  return apiPath + '/wp-admin/admin-ajax.php';
}()

class App extends Component {
  constructor(props){
    super(props);
    this.localStorage = new LocalStorage()
    this.state = {
      loggedIn: true,
      selectedApp: 'worship',
      knowledge: undefined //defined in componentDidMount
    }
    this.erredKnowledge = this.localStorage.erredKnowledge || []
    this.erredRecords = this.localStorage.erredRecords || []
    this.setSelected = this.setSelected.bind(this);
    this.menuIcon = <span className="fas fa-bars"></span>
    this.soundManager = new SoundManager()
    this.recorderContext = this.soundManager.createAudioContext()
  }

  componentDidMount(){
    if(!window.jQuery){
      console.log('jQuery not present')
      let knowledge = this.convertData(this.erredKnowledge)
      this.setState({
        knowledge: knowledge,
        registerModal: this.erredKnowledge.length > 4,
        modalSeen: false
      }, () => {
        if(!this.erredKnowledge.length){
          this.newKnowledge('notes', 'c/4')
        }
      })
      return
    }
    window.jQuery.ajax({
      type:'GET',
      data:{
        action:'app_data'
      },
      url: "/wp-admin/admin-ajax.php",
      success: (data) => {
        if(data === 'login required'){
          let knowledge = this.convertData(this.erredKnowledge)
          this.setState({
            loggedIn: false,
            knowledge: knowledge,
            registerModal: this.erredKnowledge.length > 4
          }, () => {
            if(!this.erredKnowledge.length){
              this.newKnowledge('notes', 'c/4')
            }
          })
        } else {
          try{data = JSON.parse(data)}
          catch(e){throw new Error(data)}
          let allData = [...data, ...this.erredKnowledge]
          let knowledge = this.convertData(allData)
          this.setState({
            loggedIn: true,
            knowledge: knowledge
          }, () => {
            if(!allData.length){
              this.newKnowledge('notes', 'c/4')
            }
          })
        }
      },
      error: (e) => {
        console.error(e)
        this.setState({error: e.message})
      }
    });
  }

  convertData = (data = []) => {
    let knowledge = {notes: {'c/4': {record: ''}}}
    data.forEach(elem => {
      if(!knowledge[elem.type]) knowledge[elem.type] = {}
      knowledge[elem.type][elem.value] = {record: elem.record, id: elem.id}
    })
    return knowledge
  }

  newKnowledge = (type, data, callback) => {
    let {knowledge, loggedIn} = this.state
    let {erredKnowledge} = this

    //Set up the client with new knowledge.
    if(!knowledge[type]){
      knowledge[type] = []
    }
    if(!knowledge[type][data]){
      knowledge[type][data] = {record: ''}
      this.setState({knowledge: knowledge})
    }
    if(callback) callback()

    //Set up the account with the new knowledge
    let knowledgeArray = [{type: type, value: data, record: ''}]

    if(window.jQuery && loggedIn){
      this.setState({loading: true})
      window.jQuery.ajax({
        type: 'POST',
        data:{
          action: 'app_data',
          knowledge: [...knowledgeArray, ...erredKnowledge]
        },
        url: "/wp-admin/admin-ajax.php",
        success: data => {
          if(data === 'login required'){
            return this.setState({loggedIn: false})
          }
          try{data = JSON.parse(data)}
          catch(e){throw new Error(data)}
          this.localStorage.erredKnowledge = []
          this.erredKnowledge = []
          for(let elem in data){
            knowledge[type][elem].id = data[elem]
          }
          this.setState({
            error: '',
            knowledge: knowledge
          })
        },
        complete: (value) => {
          this.setState({
            loading: false
          })
        },
        error: e => {
          let found = false
          for(let i = 0; i < erredKnowledge.length; i++){
            if(erredKnowledge[i].value === knowledgeArray[0].value && erredKnowledge[i].type === knowledgeArray[0].type) found = true
          }
          let newErredKnowledge = found ? [] : knowledgeArray
          this.erredKnowledge = [...newErredKnowledge, ...erredKnowledge]
          this.setState({
            error: 'Something went wrong and your data is not being saved.'
          })
        }
      });
    } else if(!loggedIn){
      let found = false
      for(let i = 0; i < erredKnowledge.length; i++){
        if(erredKnowledge[i].value === knowledgeArray[0].value && erredKnowledge[i].type === knowledgeArray[0].type) found = true
      }
      let newErredKnowledge = found ? [] : knowledgeArray
      this.localStorage.erredKnowledge = [...newErredKnowledge, ...erredKnowledge]
      this.erredKnowledge = [...newErredKnowledge, ...erredKnowledge]
      this.setState({
        registerModal: [...newErredKnowledge, ...erredKnowledge].length > 4
      })
    }
    if(!window.jQuery) console.error('jQuery not available')
  }

  get registerButton(){
    return <Button className='showAnswer' onClick={() => {
      window.location = 'https://churchmusictheory.com/register/'
    }}>{'Save'}</Button>
  }

  handleAnswer = (type, answer, input) => {
    let {knowledge, loggedIn} = this.state
    let {erredKnowledge, erredRecords} = this
    let correct = answer === input
    knowledge[type][answer].record += correct ? '1' : '0'
    knowledge[type][input].record += correct ? '' : '?' //? means the knowledge was used poorly

    //Tructate record down to 100 chars
    knowledge[type][answer].record = knowledge[type][answer].record.slice(knowledge[type][answer].record.length - Math.min(100, knowledge[type][answer].record.length))
    knowledge[type][input].record = knowledge[type][input].record.slice(knowledge[type][input].record.length - Math.min(100, knowledge[type][input].record.length))

    let erredRecordAvailable = false
    for(let i = 0; i < erredKnowledge.length; i++){
      if(erredKnowledge[i].type === type && erredKnowledge[i].value === answer){
        erredKnowledge[i].record = knowledge[type][answer].record
        this.localStorage.erredKnowledge = erredKnowledge
        erredRecordAvailable = true
      }
      if(erredKnowledge[i].type === type && erredKnowledge[i].value === input){
        erredKnowledge[i].record = knowledge[type][input].record
        this.localStorage.erredKnowledge = erredKnowledge
        erredRecordAvailable = true
      }
    }

    if(!erredRecordAvailable){ //if true, we already changed the record in the erredKnowledge obect and that's all we should do. There is no id to work with.
      let knowledgeArray = [
        {record: knowledge[type][answer].record, id: knowledge[type][answer].id}
      ]

      if(!correct){
        knowledgeArray.push({record: knowledge[type][input].record, id: knowledge[type][input].id})
      }

      this.setState({loading: true})
      if(window.jQuery && loggedIn){
        window.jQuery.ajax({
          type: 'POST', //This should be patch, but admin-ajax doesn't allow this. We'll fix this another time.
          data:{
            action: 'app_data',
            patchHack: true,
            knowledge: [...knowledgeArray, ...erredRecords]
          },
          url: "/wp-admin/admin-ajax.php",
          success: data => {
            if(data === 'login required'){
              return this.setState({loggedIn: false})
            }
            try{data = JSON.parse(data)}
            catch(e){throw new Error(data)}
            this.localStorage.erredRecords = []
            this.erredRecords = []
            this.setState({
              error: ''
            })
          },
          error: e => {
            let newErredRecords = [knowledgeArray, ...erredRecords]
            this.localStorage.erredRecords = newErredRecords
            this.erredRecords = newErredRecords
            this.setState({
              error: 'Something went wrong and your data is not being saved.'
            })
          },
          complete: (value) => {
            this.setState({
              loading: false,
            })
          },
        });
      } else if(!loggedIn){
        let newErredRecords = [knowledgeArray, ...erredRecords]
        this.localStorage.erredRecords = newErredRecords
        this.setState({
          erredRecords: newErredRecords
        })
      }
      if(!window.jQuery) console.error('jQuery not available')
    } //erredRecordAvailable

    this.setState({knowledge: knowledge})
    return knowledge[type]
  }

  setSelected(selectedApp){
    this.setState({selectedApp: selectedApp});
  }

  render(){
    const {error, registerModal, loggedIn, modalSeen} = this.state
    return (<React.Fragment>
      <Navbar bg="light" expand="lg">
        <Navbar.Brand>
            ChurchMusicTheory.com
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" className={modalSeen ? 'showAnswer' : ''}/>
        <Navbar.Collapse id="basic-navbar-nav">
          <NavDropdown.Item onClick={() => {
            this.setState({selectedApp: 'notes'})
          }}>Notes</NavDropdown.Item>
          <NavDropdown.Item onClick={() => {
            this.setState({selectedApp: 'worship'})
          }}>Worship</NavDropdown.Item>
          <NavDropdown.Item onClick={() => {
            window.location = 'https://churchmusictheory.com/about/'
          }}>About</NavDropdown.Item>
          {loggedIn ? null : <NavDropdown.Item className={modalSeen ? 'showAnswer' : ''} onClick={() => {
            window.location = 'https://churchmusictheory.com/register/'
          }}>Create Account</NavDropdown.Item>}
          {loggedIn ? null : <NavDropdown.Item onClick={() => {
            window.location = 'https://churchmusictheory.com/wp-login.php'
          }}>Login</NavDropdown.Item>}
        </Navbar.Collapse>
      </Navbar>
      {error ? <div className='error hcenter'>{error}</div> : null}
      {<CurrentApp
        {...this.state}
        newKnowledge={this.newKnowledge}
        handleAnswer={this.handleAnswer}
        soundManager={this.soundManager}
        recorderContext={this.recorderContext}
      />}
      <RegisterModal show={registerModal && !modalSeen} handleClose={() => {this.setState({registerModal: false, modalSeen: true})}} />
    </React.Fragment>)
  }
}

class CurrentApp extends Component {
  render(){
    var currentApp;
    const {knowledge, newKnowledge, handleAnswer, selectedApp, loggedIn} = this.props
    if(!knowledge) return null //don't load any apps until knowledge is initialized.
    switch(selectedApp){
      case 'notes':
        currentApp =
          <NoteIdentification
            knowledge={knowledge.notes}
            handleAnswer={(data, correct) => {return handleAnswer('notes', data, correct)}}
            newKnowledge={(data, callback) => {newKnowledge('notes', data, callback)}}
          />
          break
      case 'worship':
        currentApp = <Worship loggedIn={loggedIn} soundManager={this.props.soundManager} recorderContext={this.props.recorderContext} />
        break
      default:
        console.log('App not coded for');
        currentApp = null;
        break;
    }
    return (<div id='appContainer'>{currentApp}</div>)
  }
}

export default App;
