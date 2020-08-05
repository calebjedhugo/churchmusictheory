export default class SoundManager{
  constructor(){
      //Get this nonsense out of the way...
      this.verifySoundUnlocked = this.verifySoundUnlocked.bind(this);
      this.soundscape = this.createAudioContext(44100);
      this.soundUnlocked = false;
  }

  createAudioContext (desiredSampleRate) {
      var AudioCtor = window.AudioContext || window.webkitAudioContext

      desiredSampleRate = typeof desiredSampleRate === 'number'
      ? desiredSampleRate
      : 44100
      var context = new AudioCtor()

      // Check if hack is necessary. Only occurs in iOS6+ devices
      // and only when you first boot the iPhone, or play a audio/video
      // with a different sample rate
      var buffer = context.createBuffer(1, 1, desiredSampleRate)
      var dummy = context.createBufferSource()
      dummy.buffer = buffer
      dummy.connect(context.destination)
      dummy.start(0)
      dummy.disconnect()

      context.close() // dispose old context
      context = new AudioCtor()
      return context
  }

  verifySoundUnlocked() {
    if (this.soundUnlocked || !this.soundscape) {
        return;
    }

    var buffer = this.soundscape.createBuffer(1, 1, 22050);
    var source = this.soundscape.createBufferSource();
    source.buffer = buffer;
    source.connect(this.soundscape.destination);
    source.start(0);

    // by checking the play state after some time, we know if we're really unlocked
    setTimeout(() => {
      if((source.playbackState === source.PLAYING_STATE || source.playbackState === source.FINISHED_STATE)) {
          this.soundUnlocked = true;
      }
    }, 0);
  }

  primeArrayBuffer = (arrayBuffer) => {
    return new Promise(resolve => {
      let newSource = this.soundscape.createBufferSource()

      newSource.gainNode = this.soundscape.createGain()
      newSource.connect(newSource.gainNode)
      newSource.gainNode.connect(this.soundscape.destination)

      this.soundscape.decodeAudioData(arrayBuffer, buffer => {
        newSource.buffer = buffer
        resolve(newSource)
      })
    })
  }
}
