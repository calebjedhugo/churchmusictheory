window.fakeStorage = {
    _data: {},

    setItem: function (id, val) {
        return this._data[id] = String(val);
    },

    getItem: function (id) {
        return this._data.hasOwnProperty(id) ? this._data[id] : undefined;
    },

    removeItem: function (id) {
        return delete this._data[id];
    },

    clear: function () {
        return this._data = {};
    }
};

function LocalStorageManager() {
    this.scores             = "scores";
    this.intervals          = "intervals";
    this.notes              = "notes";
    this.keySigs            = "keySigs";
    this.sevenChords        = "sevenChords";
    this.chordValues        = "chordValues";
    this.rnChords           = "rnChords";
    this.spelling           = "spelling";
    this.AnswerUsingKeyboard = "AnswerUsingKeyboard";
    this.KeyboardNotesVisible = "KeyboardNotesVisible";
    this["questionMaker.types"]      = "questionMaker.types";
    var supported = this.localStorageSupported();
    this.storage = supported ? window.localStorage : window.fakeStorage;
}

LocalStorageManager.prototype.localStorageSupported = function () {
    var testKey = "test";
    var storage = window.localStorage;
    try {
        storage.setItem(testKey, "1");
        storage.removeItem(testKey);
        return true;
    } catch (error) {
        return false;
    }
};

//Setters and getters
LocalStorageManager.prototype.setObject = function(theKey){ //You need to pass in the name of the Object as a string for this one.
    this.storage.setItem(this[theKey], JSON.stringify(eval(theKey)));
}

LocalStorageManager.prototype.getObject = function(theKey) { //You need to pass in the name of the Object as a string for this one.
    var stateJSON = this.storage.getItem(this[theKey]);
    return stateJSON ? JSON.parse(stateJSON) : {};
};

LocalStorageManager.prototype.setScores = function(theScoreArray){
    this.storage.setItem(this.scores, JSON.stringify(theScoreArray));
}

LocalStorageManager.prototype.getScores = function() {
    var stateJSON = this.storage.getItem(this.scores);
    return stateJSON ? JSON.parse(stateJSON) : {};
};

LocalStorageManager.prototype.setSpelling = function(spelling){
    this.storage.setItem(this.spelling, JSON.stringify(spelling));
}

LocalStorageManager.prototype.getSpelling = function() {
    var stateJSON = this.storage.getItem(this.spelling);
    return stateJSON ? JSON.parse(stateJSON) : {};
};

LocalStorageManager.prototype.setKeyboardNotesVisible = function(KeyboardNotesVisible){
    this.storage.setItem(this.KeyboardNotesVisible, JSON.stringify(KeyboardNotesVisible));
}

LocalStorageManager.prototype.getKeyboardNotesVisible = function() {
    var stateJSON = this.storage.getItem(this.KeyboardNotesVisible);
    return stateJSON ? JSON.parse(stateJSON) : {};
};

LocalStorageManager.prototype.setAnswerWithKeyboard = function(answerWithKeyboard){
    this.storage.setItem(this.answerWithKeyboard, JSON.stringify(answerWithKeyboard));
}

LocalStorageManager.prototype.getAnswerWithKeyboard = function() {
    var stateJSON = this.storage.getItem(this.answerWithKeyboard);
    return stateJSON ? JSON.parse(stateJSON) : {};
};

export var storageManager = new LocalStorageManager();

/*function link(page) {
    if (storageManager.getColorScheme() == 4 && page == "game.html") {
        window.location = "gameICIYL.html";
    } else {
        window.location = page;
    }
}*/
