/**
 * Created by alasd on 22/01/2016.
 */


function Synth (audioContext){
    var audioContext = audioContext || AudioContext ? new AudioContext() : new webkitAudioContext();
    var playing  = false;
    this.fMin = 200;
    this.fxSemitoneRatio = 24/2;


    this.panner = audioContext.createStereoPanner();
    this.osc1 =  audioContext.createOscillator();
    this.osc2 = audioContext.createOscillator();
    this.amp = audioContext.createGain();
    this.filter = audioContext.createBiquadFilter();
    this.lfo = audioContext.createOscillator();

    //the two oscillators

    this.osc1.type = 'sawtooth';
    this.osc1.start();
    this.osc2.type = 'square';
    this.osc2.start();
    this.sub = audioContext.createOscillator();
    this.sub.start();



    //the gain node at the oscilators output

    this.amp.gain.value = 0;
    //the detune between the two oscilators
    this.detune = 5;


    this.filter.type = 'bandpass';

    this.lfo.frequency.value = 0;
    this.lfo.start();
    this.filter.Q.value = 10;

    var lfoGain = audioContext.createGain();
    lfoGain.gain.value =  300;
    this.lfo.connect(lfoGain);

    this.filter.frequency = 400;
    lfoGain.connect(this.filter.detune);


    //setup audio graph
    this.osc1.connect(this.filter);
    this.osc2.connect(this.filter);
    var subAmp = audioContext.createGain();
    subAmp.gain.value = 0.2;

    this.sub.connect(subAmp);
    subAmp.connect(this.amp);

    this.filter.connect(this.amp);
    this.amp.connect(this.panner);
    this.panner.connect(audioContext.destination);


    this.setNoteRange = function(fMax,fMin,yMax,yMin){
        this.fMin = fMin;
        var semitones = 12*Math.log2(fMax/fMin);

        var yRange = yMax - yMin;

        this.fxSemitoneRatio = semitones/yRange;
    };

    this.getPitch = function(fx){

        var n = fx* this.fxSemitoneRatio;

        return Math.pow(2,n/12)* this.fMin;
    };

    //methods
    this.setFrequency = function(frequency){
        this.osc1.frequency.value = frequency;
        this.osc2.detune.value = this.detune;
        this.osc2.frequency.value = frequency/2;
        this.sub.frequency.value = frequency/2;
    };

    this.sonifyValues = function(fx,dx,dx2){
        this.lfo.frequency.value = 3* Math.abs(dx) ;
        this.filter.frequency.value = 200 + 50*Math.abs(dx2);
        this.setFrequency(this.getPitch(fx));
    };

    this.start = function () {
        this.amp.gain.value = 1;
        playing = true;
    };

    this.stop = function(){
        this.amp.gain.value = 0;
        playing = false;
    };

    this.toggle = function(){
        this.amp.gain.value = playing? 0:1;
        playing = ! playing;
    }
}