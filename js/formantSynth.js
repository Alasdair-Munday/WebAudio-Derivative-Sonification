var formantDictionary = {
    'a' : [600, 1040, 2250],
    'e' : [400, 1620, 2400],
    'i' : [250, 1750, 2600]
};

function FormantSynth(audioContext){
    var audioContext = audioContext || AudioContext ? new AudioContext() : new webkitAudioContext();

    this.source = audioContext.createOscillator();
    this.inverted = audioContext.createOscillator();

    this.formantOne = audioContext.createBiquadFilter();
    this.formantTwo = audioContext.createBiquadFilter();
    this.formantThree = audioContext.createBiquadFilter();
    this.amp = audioContext.createGain();
    this.panner = audioContext.createStereoPanner();

    //set up source
    this.source.type = 'sawtooth';
    this.source.frequency.value = 150;
    this.source.start();

    this.inverted.type = 'sawtooth';
    this.inverted.frequency.value = 150;
    this.inverted.start();

    var invert = audioContext.createGain();
    invert.gain.value = -1;

    this.inverted.connect(invert);

    var invertedDelay = audioContext.createDelay();
    invert.connect(invertedDelay);

    invertedDelay.delayTime.value = 0.5 / 150;


    //set up formants
    this.formantOne.type = 'bandpass';
    this.formantOne.frequency = 600;
    this.formantOne.Q.value = 10;
    this.formantOne.gain.value = 10;
    this.formantTwo.type = 'bandpass';
    this.formantTwo.frequency = 1040;
    this.formantTwo.Q.value = 5;
    this.formantTwo.gain.value = 10;
    this.formantThree.type = 'bandpass';
    this.formantThree.frequency = 2250;
    this.formantThree.gain.value = 2;
    this.formantThree.Q.value = 10;

    var lowPass = audioContext.createBiquadFilter();
    lowPass.type = 'lowpass';
    lowPass.frequency.value = 5000;


    this.panner.pan.value = 0;
    this.amp.gain.value = 0.5;

    this.source.connect(lowPass);
    invertedDelay.connect(lowPass);


    var sourceGain = audioContext.createGain();
    lowPass.connect(sourceGain);

    sourceGain.gain.value = 0.5;


    sourceGain.connect(this.formantOne);
    sourceGain.connect(this.formantTwo);
    sourceGain.connect(this.formantThree);
    this.formantThree.connect(this.amp);
    this.formantTwo.connect(this.amp);
    this.formantOne.connect(this.amp);
    this.amp.connect(this.panner);
    this.panner.connect(audioContext.destination);


    this.setVowel = function(vowel){
        var formants = formantDictionary[vowel];

        this.formantOne.frequency.value = formants[0];
        this.formantTwo.frequency.value = formants[1];
        this.formantThree.frequency.value = formants[2];
    }

}