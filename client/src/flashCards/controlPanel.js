import React, { Component } from 'react';
import $ from 'jquery';
import ReactHtmlParser from 'react-html-parser';

export class ControlPanel extends Component{
  constructor(props){
    super(props);
    this.state = {selectedPanel: 'Question Types',
      controlPanelWidth: 600, /*Keep it out of view on load.*/
      questionTypeFeedback: '',
      validateSettingsTrigger: false
    }
    this.settingsValidation = this.settingsValidation.bind(this);
  }

  componentDidUpdate(prevProps, prevState){
    if($('#controlTable').outerWidth() > this.state.controlPanelWidth){
      this.setState({controlPanelWidth: $('#controlTable').outerWidth()})
      /*This is a good spot for initializing validation since control panel
      settings will have value by this time and it's ok if it fires a little extra.*/
      this.settingsValidation();
    }
    if(prevState.validateSettingsTrigger !== this.state.validateSettingsTrigger){
      this.settingsValidation();
    }
  }

  componentDidMount(){
    this.setState({controlPanelWidth: $('#controlTable').outerWidth()})
  }

  settingsValidation(){
    //if(!this.props.controlPanelSettings['Question Types']) return //still loading
    var validated = true;
    var questionSettings = this.props.controlPanelSettings['Question Types'];
    var questionSelected = false
    for(let questionType in questionSettings){
      if(questionSettings[questionType]){//Don't validate unselected questions.
        questionSelected = true;
      }
    }
    this.setState({questionTypeFeedback: questionSelected ? '' : 'Select a question type.'})
    this.props.validateSettings(validated && questionSelected)
  }

  render(){
    var buttonPanels = [];
    for(let currentDataLabel in this.props.controlPanelSettings){
      let buttonsObj = this.props.controlPanelSettings[currentDataLabel]
      buttonPanels.push(<ButtonPanel
        settingsValidation={() => this.setState({validateSettingsTrigger: !this.state.validateSettingsTrigger})}
        key={currentDataLabel}
        label={currentDataLabel}
        active={this.state.selectedPanel === currentDataLabel}
        select={() => {this.setState({selectedPanel: currentDataLabel})}}
        toggleResource={this.props.toggleResource}
        buttonsObj={buttonsObj}/>)
    }
    return (
      <div id='controls'>
        <div id='controlTable'
          style={{left: this.props.controlPanelActive ? '0px' : `-${this.state.controlPanelWidth}px`}}>
          <table>
            <tbody>
              <tr>
                <td><label htmlFor='spelling'>Spelling:</label></td>
                <td><input type='button' id='spelling' onClick={this.props.toggleEnharmonicDifficulty}
                  value={this.props.enharmonicDifficulty}></input></td>
              </tr>
              <tr>
                <td><label htmlFor='keyboardNotesVisible'>Keyboard Notes Visible</label></td>
                <td><input type='button' id='keyboardNotesVisible' onClick={this.props.toggleKeyboardNotesVisible}
                value={this.props.keyboardNotesVisible ? 'On' : 'Off'}></input></td>
              </tr>
              <tr>
                <td><label htmlFor='answerWithKeyboard'>Answer Using Keyboard</label></td>
                <td><input type='button' id='answerWithKeyboard' onClick={this.props.toggleKeyboard} value={this.props.keyboardQuestions}></input></td>
              </tr>
            </tbody>
          </table>
          {buttonPanels}
        </div>
      </div>)
  }
}

class ButtonPanel extends Component{
  constructor(props){
    super(props);
    this.mainDivId = this.props.label.replace(/\s/g, '').toLowerCase();
    this.dimensions = {x: 1000, y: 1000}
    this.state = {measured: false}
  }

  componentDidUpdate(){
    if($(`#${this.mainDivId}`)[0] && !this.state.measured){
      this.dimensions = {
        x: $(`#${this.mainDivId}`)[0].clientWidth,
        y: $(`#${this.mainDivId}`)[0].clientHeight
      }
      this.setState({measured: true}) //Tell the render function that we've recorded the dimensions.
    }
  }

  render(){
    if(!this.props.buttonsObj){
      console.log(`${this.props.label} had an issue.`)
      return null;
    }
    var idx = 0,
      columns = Math.ceil(Math.sqrt(Object.keys(this.props.buttonsObj).length));
    columns = (this.props.buttonsObj === this.props.questionTypes) ? Math.floor(Math.sqrt(Object.keys(this.props.buttonsObj).length)) :
      Math.ceil(Math.sqrt(Object.keys(this.props.buttonsObj).length));
    var rows = [];
    var cells = [];
    for (var objectMemberString in this.props.buttonsObj) {
      if (idx % columns === 0 && idx > 0) {
        rows.push(<tr key={idx}>{cells}</tr>)
        cells = [];
      }
      let currentButtonCell = <Button
                                key={objectMemberString}
                                active={this.props.buttonsObj[objectMemberString]}
                                toggleResource={this.props.toggleResource}
                                settingsValidation={this.props.settingsValidation}
                                objectMemberString={objectMemberString}
                                parentPanel={this.props.label}/>
      idx += 1;
      cells.push(currentButtonCell)
    }
    if(cells.length > 0) rows.push(<tr key={idx}>{cells}</tr>);
    return (<React.Fragment>
      <div className={`tableLabel${this.props.active ? ' activeTableLabel' : ''}`}
        id={`${this.props.label}label`}
        onClick={this.props.select}>
        {this.props.label}
      </div>
      <div className={`objectButtonPanels${this.props.active ? ' activeObjectButtonPanel' : ''}`}
        id={this.mainDivId}
        style={{
          overflow: 'hidden',
          maxWidth: this.state.measured ? (this.props.active ? `${this.dimensions.x}px` : '0px') : '',
          maxHeight: this.state.measured ? (this.props.active ? `${this.dimensions.y}px` : '0px') : ''
        }}>
        <table id={`${this.props.label}table`}>
          <tbody>{rows}</tbody>
        </table>
      </div>
    </React.Fragment>);
  }
}

class Button extends Component {
  render(){
    return (<td
              key={this.props.objectMemberString}
              id={`${this.props.objectMemberString}button`}
              style={{backgroundColor: this.props.active ? "lightgreen" : "lightgrey"}}
              onClick={() => {
                this.props.toggleResource(this.props.parentPanel, this.props.objectMemberString);
                this.props.settingsValidation();
              }}>
              {ReactHtmlParser(this.props.objectMemberString)}
            </td>)
  }
}
