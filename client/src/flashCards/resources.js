import {storageManager} from './local_storage_manager.js';

//var lineOver = "&#773;"
//var halfDiminished = "&#8960;";

var answerBoxSizer = window.innerWidth/350;
window.addEventListener("resize", function(){answerBoxSizer = window.innerWidth/385;});
function flat(){
    return "<span style=\"font-size: " + (8 * answerBoxSizer) + "px\">&#9837;</span>"
}
function sharp(){
    return "<span style=\"font-size: " + (10 * answerBoxSizer) + "px\">&#9839;</span>"
}

export var resources = {
  intervals: {"PU":[0],"m&#773;2":[1],"M2":[2],"m&#773;3":[3],"M3":[4],"P4":[5],
                   "TT":[6],"P5":[7],"m&#773;6":[8],"M6":[9],"m&#773;7":[10],"M7":[11]},
  notes: {"C#|Db":[1],"D#|Eb":[3],"F#|Gb":[6],"G#|Ab":[8],"A#|Bb":[10],
               "C":[0],"D":[2],"E":[4, true],"F":[5],"G":[7],"A":[9],"B":[11]},
  notesOrdered: {"B#|C":[0],"G":[7],"D":[2],"A":[9],"E|Fb":[4],"B|Cb":[11],
                      "F#|Gb":[6],"C#|Db":[1],"G#|Ab":[8],"D#|Eb":[3],"A#|Bb":[10],"F|E#":[5]},
  notesOrdered2: {"B#|C":[0],"C#|Db":[1],"D":[2],"D#|Eb":[3],"E|Fb":[4],"F|E#":[5],
                       "F#|Gb":[6],"G":[7],"G#|Ab":[8],"A":[9],"A#|Bb":[10],"B|Cb":[11]},
  keySigs: {"major": {"C":[0],"G":[7],"D":[2],"A":[9],"E":[4],"B":[11],"Cb":[11],
                           "F#":[6],"Gb":[6],"Db":[1],"C#":[1],"Ab":[8],"Eb":[3],"Bb":[10],"F":[5]},
                 "minor": {"C":[0],"G":[7],"D":[2],"A":[9],"E":[4],"B":[11],"F#":[6],
                           "C#":[1],"G#":[8],"Ab":[8],"D#":[3],"Eb":[3],"Bb":[10],"A#":[10],"F":[5]}},
  aboveBelow: {"above": "+", "below": "-"},
  downToUpTo: {"down to": "-", "up to": "+"},
  sevenChords: {"M<sup>7</sup>": [0], //MM
                      "m&#773;<sup>7</sup>": [1], //mm
                      "<sup>o7</sup>": [2], //fully diminished
                      "<sup>+</sup>": [3], //augmentent
                      "<sup>&#8960;7</sup>": [4], //half diminished
                      "<sup>7</sup>": [5]}, //Mm
  majorOrMinor: {"major": 0, "minor": 1},

  //sevenChords is accessed to get the index of the arrays below.
  //If the chord value does not exist, the questions will simply ask a different question (these values should be false).
  //The last member of the array tells the question whether or not the member has been made available to ask by the user.
  //If false, the function will call itself again until it finds a useable question. The user should not be allowed to set all of these to false.
  chordValues: {"root": [0,0,0,0,0,0],
                     "3<sup>rd</sup>": [4,3,3,4,3,4],
                     "5<sup>th</sup>": [7,7,6,8,6,7],
                     "7<sup>th</sup>": [11,10,9,false,10,10]},

  //rnChords' first array member refers to the sevenChords object to know which index to use for the invervals in the chordValues object.
  //The second array member tells us if it is from the major or minor mode. When asking the question, if this does not match in the
  //keySigs object it will try again.
  rnChords: {"I<sup>7</sup>": ["M<sup>7</sup>","major",0], //MM
                  "i<sup>7</sup>": ["m&#773;<sup>7</sup>","minor",0], //mm
                  "ii<sup>7</sup>": ["m&#773;<sup>7</sup>","major",2], //mm
                  "ii<sup>&#8960;7</sup>": ["<sup>&#8960;7</sup>","minor",2],//half diminished
                  "iii<sup>7</sup>": ["m&#773;<sup>7</sup>","major",4], //mm
                  "III<sup>7</sup>": ["M<sup>7</sup>","minor",3], //MM
                  "IV<sup>7</sup>": ["M<sup>7</sup>","major",5], //MM
                  "iv<sup>7</sup>": ["m&#773;<sup>7</sup>","minor",5], //mm
                  "V<sup>7</sup>": ["<sup>7</sup>","major",7], //Mm
                  "v<sup>7</sup>": ["m&#773;<sup>7</sup>","minor",7], //mm
                  //"V<sup>7</sup>": ["<sup>7</sup>","minor",7], //Mm This property isn't doing anything...
                  "vi<sup>7</sup>": ["m&#773;<sup>7</sup>","major",9], //mm
                  "VI<sup>7</sup>": ["M<sup>7</sup>","minor",8], //MM
                  "vii<sup>&#8960;7</sup>": ["<sup>&#8960;7</sup>","major",11], //half diminished
                  "vii<sup>o7</sup>": ["<sup>o7</sup>","minor",11], //fully diminished
                  "VII<sup>7</sup>": ["<sup>7</sup>", "minor",10]}, //Mm
  //I assign properties to this when I set up the objects with browser storage.
  //look for rnChords in controlPanel.js

  enharmonicVariance: {
    "C": ["C", "B" + sharp(), "D" + flat() + flat()],
    "C#|Db": ["C" + sharp(), "D" + flat(), "B" + sharp() + sharp()],
    "Db": ["C" + sharp(), "D" + flat(), "B" + sharp() + sharp()],
    "C#": ["C" + sharp(), "D" + flat(), "B" + sharp() + sharp()],
    "D": ["D", "C" + sharp() + sharp(), "E" + flat() + flat()],
    "D#|Eb": ["E" + flat(), "D" + sharp(), "F" + flat() + flat()],
    "Eb": ["E" + flat(), "D" + sharp(), "F" + flat() + flat()],
    "D#": ["E" + flat(), "D" + sharp(), "F" + flat() + flat()],
    "E": ["E","F" + flat(),"D" + sharp() + sharp()],
    "F": ["F","E" + sharp(),"G" + flat() + flat()],
    "F#|Gb": ["F" + sharp(),"G" + flat(),"E" + sharp() + sharp()],
    "Gb": ["F" + sharp(),"G" + flat(),"E" + sharp() + sharp()],
    "F#": ["F" + sharp(),"G" + flat(),"E" + sharp() + sharp()],
    "G": ["G","F" + sharp() + sharp(),"A" + flat() + flat()],
    "G#|Ab": ["A" + flat(),"G" + sharp()],
    "Ab": ["A" + flat(),"G" + sharp()],
    "G#": ["A" + flat(),"G" + sharp()],
    "A": ["A","G" + sharp() + sharp(),"B" + flat() + flat()],
    "A#|Bb": ["B" + flat(),"A" + sharp(),"C" + flat() + flat()],
    "A#": ["B" + flat(),"A" + sharp(),"C" + flat() + flat()],
    "Bb": ["B" + flat(),"A" + sharp(),"C" + flat() + flat()],
    "B": ["B","C" + flat(),"A" + sharp() + sharp()],
    "Cb": ["B","C" + flat(),"A" + sharp() + sharp()],
    "vary": function(theNote, difficulty){
        var randomNumber = Math.random()
        if(difficulty === 1 && /^(D|G|A|)$/.test(theNote))
            return this[theNote][0];
        else
            return this[theNote][Math.floor(randomNumber * Math.min(this[theNote].length, difficulty + 1))];
    }
  },

  formatNote: function(note){
      var newNote = note;
      if(!/&#.*;/.test(newNote)){
          newNote = newNote.replace("#", sharp());
      }
      newNote = newNote.replace("b", flat());
      return newNote;
  },

  toSharps: function(anInt){
      var resultString = "";
      for(var idx = 0; idx < anInt; idx += 1){
          resultString += "#";
      }
      return resultString;
  },

  rnRootNum: function(rn, theKey){
      return Object.keys(resources.notesOrdered2)[(resources.rnChords[rn].root + resources.keySigs[resources.rnChords[rn].mode][theKey][0]) % 12];
  },

  randomOctave: function(){
      return Math.floor(Math.random() * 3) + 2;
  }
}

/*function playChord(theRoot, quality){
    var arrayOfInt = [];
    var valueIdx = sevenChords[quality][0];
    var currentValue;
    theRoot = theRoot.split("|")[0];
    console.log(theRoot);
    for(currentValue in chordValues){
        if(chordValues[currentValue][valueIdx] !== false && chordValues[currentValue][chordValues[currentValue].length - 1] !== false)
            arrayOfInt.push(chordValues[currentValue][valueIdx]);
    }
    for(var idx = 0; idx < arrayOfInt.length; idx += 1){
        if(piano){
            piano.play(theRoot + toSharps(arrayOfInt[idx]) + randomOctave(), "mf", 1);
            if($('#questionBox')[0].innerHTML == "Piano is loading. Please hit replay in a few seconds.")
                $('#questionBox')[0].innerHTML = $('#questionBox')[0].storedQuestion;
        }
        else{
            if($('#questionBox')[0].innerHTML != "Piano is loading. Please hit replay in a few seconds.")
                $('#questionBox')[0].storedQuestion = $('#questionBox')[0].innerHTML;
            $('#questionBox')[0].innerHTML = "Piano is loading. Please hit replay in a few seconds.";
            $('#replayButton')[0].disabled = true;
            //triangle.play(theRoot + toSharps(arrayOfInt[idx]) + randomOctave(), "mf", 1);
        }
    }
}*/
