import React, { Component } from 'react';
import {storageManager} from './local_storage_manager.js';
import {ControlPanel} from './controlPanel';
import {resources} from './resources.js';
import {QuestionMaker} from './questionMaker.js'
import $ from 'jquery';

export class FlashCards extends Component{
  constructor(props){
    super(props)
    this.enharmonicOptions = ['Standard','Expert','Pro']
    this.keyboardQuestionOptions = ['Sometimes', 'Always', 'Never'];
    this.setQuestionTypes = this.setQuestionTypes.bind(this);
    this.toggleResource = this.toggleResource.bind(this);
    this.state = {
      controlPanelActive: false,
      enharmonicDifficulty: this.enharmonicOptions[0],
      keyboardNotesVisible: true,
      keyboardQuestions: this.keyboardQuestionOptions[0],
      controlPanelSettings: {},
      menuPanelSize: {x: 0, y: 0},
      questionTrigger: false,
      settingsValidated: false
    }
  }

  get menuPanelSize(){
    return {
      x: $('#menuPanel').outerWidth(),
      y: $('#menuPanel').outerHeight()
    }
  }

  componentDidUpdate(prevProps, prevState){
    if(this.state.menuPanelSize.x < this.menuPanelSize.x || this.state.menuPanelSize.y < this.menuPanelSize.y){
      this.setState({menuPanelSize: this.menuPanelSize})
    }
    if(prevState.settingsValidated !== this.state.settingsValidated){
      this.setState({questionTrigger: !this.state.questionTrigger})
    }
  }

  componentDidMount(){
    this.setState({menuPanelSize: this.menuPanelSize})
    //This little function takes the resources' keys and gives them a true boolean value.
    var keysTotrue = function(myObj){
      var newObj = {};
      for(let prop in myObj){
        newObj[prop] = true
      }
      return newObj
    }
    //This will eventually be replaced by an ajax call that gets the customized user data.
    //For now it is hard coded.
    this.setState({
      controlPanelSettings: {
        'Question Types': {
          'Interval Note': false,
          'Interval Number': false,
          'Transpose': false,
          'Chord Numerals': true,
          'Chords': false/*,
          "Chord Listen": [true]*/
        },
        'Major Keys': keysTotrue(resources.keySigs.major),
        'Minor Keys': keysTotrue(resources.keySigs.minor),
        'Chord Members': keysTotrue(resources.chordValues),
        'Chord Types': keysTotrue(resources.sevenChords),
        'Roman Numeral Chords': keysTotrue(resources.rnChords),
        'Intervals': keysTotrue(resources.intervals)
      },
      questionTrigger: !this.state.questionTrigger
    })

    /*var answerBox = document.getElementById("answerBox");
    var questionBox = document.getElementById("questionBox");
    var statsBox = document.getElementById("statsBox");
    var menuPanel = document.getElementById('menuPanel')

    var answerBoxSizer = window.innerWidth/350;
    window.addEventListener("resize", function(){answerBoxSizer = window.innerWidth/385;});
    statsBox.update = function() {
      this.innerHTML = "Right answers: " + this.scoresArray[0] + "<br>Wrong answers: " + this.scoresArray[1];
      storageManager.setScores(statsBox.scoresArray);
    }*/

    //this.props.newQuestion() //This should be called from the QuestionBox component.
    //statsBox.update(); //This should be called from the StatsBox component.
    /*function menuPanelLowerRight(){ //This should be done with css if possible
        menuPanel.style.top = window.innerHeight - menuPanel.clientHeight - 5 + "px";
        menuPanel.style.left = window.innerWidth - menuPanel.clientWidth - 10 + "px";
    }
    window.addEventListener("resize", menuPanelLowerRight)
    menuPanelLowerRight(); //This needs to be done last.*/

    /*var touch = 'ontouchstart' in document.documentElement || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;

    if (touch) { // remove all :hover stylesheets
      try { // prevent exception on browsers not supporting DOM styleSheets properly
        for (var si in document.styleSheets) {
          var styleSheet = document.styleSheets[si];
          if (!styleSheet.rules) continue;

          for (var ri = styleSheet.rules.length - 1; ri >= 0; ri--) {
            if (!styleSheet.rules[ri].selectorText) continue;

            if (styleSheet.rules[ri].selectorText.match(':hover')) {
              styleSheet.deleteRule(ri);
            }
          }
        }
      } catch (ex) {}
    }*/
  }

  setQuestionTypes(newObject){
    this.setState({questionTypes: newObject})
  }

  toggleResource(resourceType, resource){
    try{
      var newSettings = JSON.parse(JSON.stringify(this.state.controlPanelSettings))
      newSettings[resourceType][resource] = !this.state.controlPanelSettings[resourceType][resource]
      this.setState({controlPanelSettings: newSettings})
    }
    catch(e){
      console.log(e.message, this.state.controlPanelSettings, resourceType, resource)
    }
  }

  render(){
    return(<React.Fragment>
            <div id='mainArea' onClick={() => {
              if(this.state.controlPanelActive) this.setState({controlPanelActive: false})
            }}>
              <QuestionMaker
                settingsValidated={this.state.settingsValidated}
                controlPanelSettings={this.state.controlPanelSettings}
                questionTrigger={this.state.questionTrigger}
                enharmonicDifficulty={this.enharmonicOptions.indexOf(this.state.enharmonicDifficulty)}/>
              <div id='statsBox'></div>
            </div>
            <ControlPanel
              validateSettings={bool => {this.setState({settingsValidated: bool})}}
              controlPanelSettings={this.state.controlPanelSettings}
              toggleResource={this.toggleResource}
              questionTypes={this.questionTypes}
              setQuestionTypes={this.setQuestionTypes}
              controlPanelActive={this.state.controlPanelActive}
              keyboardNotesVisible={this.state.keyboardNotesVisible}
              toggleKeyboardNotesVisible={() => {this.setState({keyboardNotesVisible: !this.state.keyboardNotesVisible})}}
              enharmonicDifficulty={this.state.enharmonicDifficulty}
              toggleEnharmonicDifficulty={() => {
                this.setState({
                  enharmonicDifficulty: this.enharmonicOptions[
                    (this.enharmonicOptions.indexOf(this.state.enharmonicDifficulty) + 1) % 3]
                  })
                }}
              keyboardQuestions={this.state.keyboardQuestions}
              toggleKeyboard={() => {
                this.setState({
                  keyboardQuestions: this.keyboardQuestionOptions[
                    (this.keyboardQuestionOptions.indexOf(this.state.keyboardQuestions) + 1) % 3]
                })
              }}
            />
            <div id='menuPanel' style={{
              top: `calc(100% - ${this.state.menuPanelSize.y}px)`, left: `calc(100% - ${this.state.menuPanelSize.x}px)`}}>
              {/*<button onClick='loadPiano()' id='loadPianoButton'>Load Piano</button><br></br>
              <button onClick='questionMaker.playTheChords()' id='replayButton'>Replay Chords</button><br></br>*/}
              <input type='button' onClick={() => this.setState({
                questionTrigger: !this.state.questionTrigger,
                controlPanelActive: false
              })
              } id='skipQuestion' value='Skip Question'></input>
              <input type='button'
                onClick={() => this.setState({controlPanelActive: !this.state.controlPanelActive})}
                id='toggleControlButton'
                value={this.state.controlPanelActive ? 'Flash Cards' : 'Control Panel'}>
              </input>
              <input type='button' onClick={() => {storageManager.setScores([0,0]); $('#statsBox').scoresArray = [0,0]; $('#statsBox').update();}}
                value='Reset Score'></input>
            </div>
            </React.Fragment>)
  }
}
