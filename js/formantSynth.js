var formantDictionary = {
    'a' : [600, 1040, 2250],
    'e' : [400, 1620, 2400],
    'i' : [250, 1750, 2600]
};

function FormantSynth(audioContext){
    var audioContext = audioContext || AudioContext ? new AudioContext() : new webkitAudioContext();

    this.source = audioContext.createOscillator();
    this.formantOne = audioContext.createBiquadFilter();
    this.formantTwo = audioContext.createBiquadFilter();
    this.formantThree = audioContext.createBiquadFilter();
    this.amp = audioContext.createGain();
    this.panner = audioContext.createStereoPanner();

    //set up source
    this.source.type = 'sawtooth';
    this.source.frequency.value = 200;
    //this.source.start();

    //set up formants
    this.formantOne.type = 'peaking';
    this.formantOne.frequency = 600;
    this.formantOne.Q.value = 10;
    this.formantOne.gain.value = 10;
    this.formantTwo.type = 'peaking';
    this.formantTwo.frequency = 1040;
    this.formantTwo.Q.value = 5;
    this.formantTwo.gain.value = 5;
    this.formantThree.type = 'peaking';
    this.formantThree.frequency = 2250;
    this.formantThree.gain.value = 2;
    this.formantThree.Q.value = 2;

    var lowPass = audioContext.createBiquadFilter();
    lowPass.type = 'lowpass';
    lowPass.frequency.value = 5000;


    this.panner.pan.value = 0;
    this.amp.gain.value = 0.5;

    this.source.connect(this.formantOne);
    this.formantOne.connect(this.formantTwo);
    this.formantTwo.connect(this.formantThree);
    this.formantThree.connect(this.amp);
    this.amp.connect(lowPass);
    lowPass.connect(this.panner);
    this.panner.connect(audioContext.destination);


    this.setVowel = function(vowel){
        var formants = formantDictionary[vowel];

        this.formantOne.frequency.value = formants[0];
        this.formantTwo.frequency.value = formants[1];
        this.formantThree.frequency.value = formants[2];
    }

}