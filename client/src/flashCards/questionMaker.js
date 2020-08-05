import React, { Component } from 'react';
import {resources} from './resources.js';
import {AnswerButtons} from './flashCards.js';
import ReactHtmlParser from 'react-html-parser';
import $ from 'jquery';

export class QuestionMaker extends Component{
  constructor(props){
    super(props);
    this.state = {
      answerType: 'notes',
      question: '',
      answer: '',
      selectedType: '',
      notAQuestion: false
    }
    this.newQuestion = this.newQuestion.bind(this);
  }

  componentDidUpdate(prevProps){
    if(prevProps.questionTrigger !== this.props.questionTrigger){
      console.log(prevProps.questionTrigger, this.props.questionTrigger)
      //for loop is for testing. Remove it before pushing code.
      for(var idx = 0; idx < 1; idx ++){this.newQuestion()};
    }
  }

  newQuestion(questionType) { //undefined means random.
    //Control Panel validation
    if(!this.props.settingsValidated){
      return this.setState({
        notAQuestion: true,
        question: `Please correct invalid settings in control panel.`
      })
    }

    var settings = this.props.controlPanelSettings
    var selectedType = questionType ? questionType : this.randomThing(settings['Question Types'], 'question type');
    if(!selectedType) return; //The user is notified through this.randomThing.
    var question, answer, answerType

    try{ //There is a lot that can go wrong here, so let's keep this for now.
      switch(selectedType){
        case 'Interval Note':
          var theInterval = this.randomThing(settings['Intervals'], 'interval');
          if(!theInterval) return; //The user is notified through this.randomThing.
          var theNote = this.randomThing(resources.notes);
          var direction = this.randomThing(resources.aboveBelow);
          question = "Which note is a " + theInterval + " " + direction + " " +
            resources.enharmonicVariance.vary(theNote, this.props.enharmonicDifficulty) + "?";
          var rawAnswer = direction === 'above' ?
            resources.notes[theNote][0] + resources.intervals[theInterval][0] :
            resources.notes[theNote][0] - resources.intervals[theInterval][0]
          var answer = (rawAnswer + 12) % 12;
          answerType = 'notes';
          break;
        case 'Interval Number':
          var note1 = this.randomThing(resources.notes);
          var note2 = this.randomThing(resources.notes);
          var direction = this.randomThing(resources.downToUpTo);
          var interval, allFalse = true;
          question = "What interval is " +
            resources.enharmonicVariance.vary(note1, this.props.enharmonicDifficulty) + " " + direction + " " +
            resources.enharmonicVariance.vary(note2, this.props.enharmonicDifficulty) + "?"
          if (direction === "down to")
            answer = (resources.notes[note1][0] - resources.notes[note2][0] + 12) % 12;
          else
            answer = (resources.notes[note2][0] - resources.notes[note1][0] + 12) % 12;
          var answerInSet = false
          for (interval in settings['Intervals']) {
            if (settings['Intervals'][interval]) {
              allFalse = false
              if(answer === resources.intervals[interval][0]){
                answerInSet = true
              }
            }
          }
          if (allFalse) {
            return this.setState({
              notAQuestion: true,
              question: `Select an interval from the control panel.`
            })
          }
          if (!answerInSet) {
            this.newQuestion('Interval Number');
            return;
          }
          answerType = 'intervals';
          break;
        case 'Transpose':
          var majorOrMinor = Math.random() < .5 ? 'Major Keys' : 'Minor Keys'
          var note1 = this.randomThing(settings[majorOrMinor], majorOrMinor);
          var note2 = this.randomThing(settings[majorOrMinor], majorOrMinor);
          var note3 = this.randomThing(resources.notes);
          if(!note1 || !note2) return this.setState({
            notAQuestion: true,
            question: `Select a ${majorOrMinor.slice(0, 9)} from the control panel.`
          })
          question = "When transposing from " +
            resources.enharmonicVariance.vary(note1, this.props.enharmonicDifficulty) + " to " +
            resources.enharmonicVariance.vary(note2, this.props.enharmonicDifficulty) + ", what is " +
            resources.enharmonicVariance.vary(note3, this.props.enharmonicDifficulty) + "?";
          answer = (
            resources.keySigs[majorOrMinor.slice(0,5).toLowerCase()][note1][0]
            - resources.keySigs[majorOrMinor.slice(0,5).toLowerCase()][note2][0]
            + resources.notes[note3][0] + 12
          ) % 12;
          //We should add restricting the questions by the user's chosen intervals.
          answerType = 'notes';
          break;
        case 'Chord Numerals':
          var chordMember = this.randomThing(resources.chordValues);
          var theChord = this.randomThing(resources.rnChords);
          var majorTried = false,
            minorTried = false;
          var idx = 100;
          while (this.randomThing(resources.keySigs[resources.rnChords[theChord].mode]) === false && (!majorTried || !minorTried)) {
            majorTried = (resources.rnChords[theChord].mode === "major" && !majorTried) ? true : majorTried;
            minorTried = (resources.rnChords[theChord].mode === "minor" && !minorTried) ? true : minorTried;
            theChord = this.randomThing(resources.rnChords);
            idx -= 1;
            if (idx <= 0) break;
          }
          var theKey = this.randomThing(resources.keySigs[resources.rnChords[theChord].mode]);
          question = "What is the " + chordMember +
            " of a " + theChord + "In " + theKey + " " + resources.rnChords[theChord].mode + "?";
          answer = (resources.keySigs[resources.rnChords[theChord].mode][theKey][0] +
            resources.chordValues[chordMember][resources.sevenChords[resources.rnChords[theChord].quality][0]] +
            resources.rnChords[theChord].root + 12) % 12;
          answerType = 'notes';
          break;
        case 'Chords':
          var chordMember = this.randomThing(settings['Chord Members']);
          if(!chordMember) {
            return this.setState({
              notAQuestion: true,
              question: `Select a chord member from the control panel.`
            })
          }
          var majorOrMinor = Math.random() < .5 ? 'Major Keys' : 'Minor Keys'
          var theRoot = this.randomThing(settings[majorOrMinor], majorOrMinor);
          var chordQuality = this.randomThing(resources.sevenChords);
          if (resources.chordValues[chordMember][resources.sevenChords[chordQuality][0]] === false) {
            this.Chords();
            return; //augmented 7ths will do this.
          }
          question = "What is the " + chordMember + " of a " +
            resources.enharmonicVariance.vary(theRoot, this.props.enharmonicDifficulty) + chordQuality + " chord?"
          answer = (resources.notes[theRoot][0] + resources.chordValues[chordMember][resources.sevenChords[chordQuality][0]]) % 12;
          answerType = 'notes';
          break;
        case 'Chord Listen':
          /*var referenceChord = this.randomThing(resources.rnChords)
          var theKey = this.randomThing(resources.keySigs[resources.rnChords[referenceChord].mode])
          var selectChord = this.randomThing(resources.rnChords)
          while (resources.rnChords[selectChord].mode != resources.rnChords[referenceChord].mode) selectChord = this.randomThing(resources.rnChords);
          question = "The first chord is a " + referenceChord + " in " + theKey + " " +
            resources.rnChords[referenceChord].mode + ". What is the second chord?"
          buttonMaker(resources.rnChords);
          answer = selectChord;
          replayButton.style.display = "";
          loadPianoButton.style.display = (piano) ? "none" : "";
          this.playTheChords = function() {
            playChord(rnRootNum(referenceChord, theKey), resources.rnChords[referenceChord].quality);
            setTimeout(function() {
              playChord(rnRootNum(selectChord, theKey), resources.rnChords[selectChord].quality)
            }, 1000);
          }
          replayButton.click();*/
        default: console.log(`${selectedType} is not coded for.`)
      }
      console.log('fired')
      this.setState({selectedType: selectedType, question: question,
        answer: answer, answerType: answerType, notAQuestion: false});
    }
    catch(e){
      this.setState({
        notAQuestion: false,
        question: `Something went wrong with the question type "${selectedType}"`
      })
      console.log(e, e.message, selectedType)
    }
  }

  randomThing(objectType, objLabel) { //randomThing:
    var item, allFalse = true;
    for (item in objectType) { //Let's see if this is an array with a true/false value at the end.
      if (objectType[item]) {
        allFalse = false; //found a true one!
        break;
      }
    }
    if (allFalse) {
      this.setState({
        notAQuestion: true,
        question: `Select ${/a|e|i|u|o/i.test(objLabel[0]) ? 'an' : 'a'} ${objLabel} from the control panel.`})
      return false;
    }
    this.setState({notAQuestion: false})
    var pickANumber = Math.floor(Math.random() * Object.keys(objectType).length)
    var propertyinquestion = Object.keys(objectType)[pickANumber]
    var isItTrue = objectType[propertyinquestion];
    if (isItTrue === false) {
      return this.randomThing(objectType);
    }
    else return Object.keys(objectType)[pickANumber] //returns a string
  }

  /*"Chord Listen": function() {
  },*/

  playTheChords() { //"playTheChords":
    console.log("Please program me!")
  }

  render(){ //We will be adding the question here too.
    return (
      <React.Fragment>
        <div id='questionBox' className={this.state.notAQuestion ? 'feedbackBox' : ''}>
          {ReactHtmlParser(this.state.question)}
        </div>
        <div id='answerBox'>
          <AnswerButtons newQuestion={this.props.newQuestion} answertype={this.state.answerType} />
        </div>
      </React.Fragment>)
  }
}
