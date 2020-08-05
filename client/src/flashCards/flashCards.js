import React, { Component } from 'react';
import {resources} from './resources.js';
import {QuestionMaker} from './questionMaker.js'

export class AnswerButtons extends Component{
  render(){
    return null;
  }

  buttonMaker(questionType) {
    var currentButton, buttonAnswer, buttonIdx = 0,
      buttonIdx2 = 0,
      weirdCorrection = 0;
    var box = {};
    var isThereAKeyboard = (Math.random() < 0.5) ? true : false;
    if (this.props.keyboardQuestions === 'Always') isThereAKeyboard = true;
    if (this.props.keyboardQuestions === 'Never') isThereAKeyboard = false;
    if (!isThereAKeyboard && questionType === resources.notes) questionType = resources.notesOrdered;
    box.width = (questionType === resources.notes && isThereAKeyboard) ? 273 * answerBoxSizer : 165 * answerBoxSizer
    answerBox.innerHTML = "";
    answerBox.answer = "";
    //replayButton.style.display = "none";
    //loadPianoButton.style.display = "none";
    //box.left cannot be set yet because we don't know the width.
    //box.left = answerBox.getBoundingClientRect().left;// - mainArea.getBoundingClientRect().left;
    box.top = answerBox.getBoundingClientRect().top; // - mainArea.getBoundingClientRect().top;
    box.offSet = Math.floor(Math.random() * 7);
    box.padding = 5;
    box.buttonHeight = 22 * answerBoxSizer;
    box.buttonWidth = 39 * answerBoxSizer;
    box.additionalWidth = 0 * answerBoxSizer;
    box.blackOffSet = 0 * answerBoxSizer;
    box.fontSize = 10 * answerBoxSizer;
    answerBox.style.height = (questionType === resources.notes && isThereAKeyboard) ? (box.buttonHeight * 2) - 6 + "px" : "";
    for (buttonAnswer in questionType) {
      currentButton = document.createElement("button")
      if (questionType === resources.notes && isThereAKeyboard) {
        currentButton.style.position = "absolute";
        if (/C|F/.test(buttonAnswer)) {
          buttonIdx2 += 1;
        }
        if (/1|2|3|5|6/.test(box.offSet)) {
          box.additionalWidth = box.buttonWidth / 2;
        } else {
          box.blackOffSet = box.buttonWidth / 2;
          weirdCorrection = -18 * answerBoxSizer;
        }
        var predictedWidth = box.width + (box.additionalWidth * 2);
        answerBox.style.width = predictedWidth + "px"
          //now we know the width. But we have to calculate ouselves because of transitions. :(
        box.left = (window.innerWidth - predictedWidth) / 2;
        if (/#|b/.test(buttonAnswer)) {
          currentButton.style.top = (box.top + box.padding) + "px";
          currentButton.style.left = box.left + weirdCorrection + 3 + box.padding + (((box.buttonWidth * (box.offSet + buttonIdx2)) % (box.buttonWidth * 7))) + "px";
          currentButton.className = "blackNotes";
          buttonIdx2 += 1;
        } else {
          currentButton.className = "whiteNotes";
          currentButton.style.top = (box.top + box.buttonHeight + box.padding) + "px";
          currentButton.style.left = box.left + box.blackOffSet + weirdCorrection + box.padding + box.additionalWidth + 3 + ((box.buttonWidth * (box.offSet + buttonIdx)) % (box.buttonWidth * 7)) + "px";
          buttonIdx += 1;
        }
      }
      currentButton.style.width = box.buttonWidth + "px";
      currentButton.style.height = box.buttonHeight + "px";
      currentButton.style.fontSize = box.fontSize + "px";
      answerBox.style.width = box.width + (box.additionalWidth * 2) + "px"

      answerBox.appendChild(currentButton)
      currentButton.innerHTML = resources.formatNote(buttonAnswer);
      if (!this.props.keyboardNotesVisible && questionType === resources.notes && isThereAKeyboard)
        currentButton.textContent = "";
      currentButton.answer = buttonAnswer;
      currentButton.questionType = questionType;
      currentButton.className += " answerButton";
      if (!questionType[buttonAnswer][questionType[buttonAnswer].length - 1]) {
        currentButton.disabled = true;
        currentButton.className = "";
      }
      currentButton.addEventListener("click", function sendAnswer() {
        var finalAnswer = (this.questionType === resources.rnChords) ? this.answer : this.questionType[this.answer][0]
        if (questionBox.answer === finalAnswer) {
          statsBox.scoresArray[0] += 1;
          this.props.newQuestion();
        } else {
          statsBox.scoresArray[1] += 1;
          this.className = "wrong";
          this.removeEventListener("click", sendAnswer);
        }
        statsBox.update();
      })
    }
  }
}

var answerBox, questionBox, statsBox, menuPanel, answerBoxSizer
