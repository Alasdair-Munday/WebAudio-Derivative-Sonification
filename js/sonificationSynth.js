/**
 * Created by alasd on 20/01/2016.
 */
//setup audio context
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioCtx = new AudioContext();
var synth={};
var formantSynth;
function audioSetup(){
    synth = new Synth(audioCtx);
    //formantSynth = new FormantSynth(audioCtx);
}
audioSetup();


function setVowel(vowel){
    formantSynth.setVowel(vowel);
}

function sonifyEquation(){
    var eqnString = document.getElementById("mathTxt").value;

    var options = {
        target: '#graph',
        yAxis: {domain: [-1, 1]},
        xAxis: {domain: [-5,5]},
        width: 600,
        disableZoom: true,
        data: [{
            fn: eqnString
        }]
    };

    var graph = functionPlot(options);

    graph.on('mouseover',function(){
        synth.amp.gain.value = 0.5;
    });

    graph.on('mousemove',function(x,y){
        setX(x);
    });

    graph.on('mouseout',function(){
        synth.amp.gain.value = 0;
    });

    function setX(x){
        var yVal = Parser.evaluate(eqnString, { x: x  });
        var deltaY = Parser.evaluate(eqnString, {x: x+0.001});
        var thirdY = Parser.evaluate(eqnString, {x: x+0.002});

        var firstDerivative = (deltaY - yVal)/ 0.001;
        var deltafirstDerivative = (thirdY - deltaY)/0.001;
        var secondDerivative = ( deltafirstDerivative - firstDerivative)/ 0.001;
        options.annotations = [{x:x}];
        var plot = functionPlot(options);
        document.getElementById('first_derivative').innerHTML = firstDerivative;
        document.getElementById('second_derivative').innerHTML = secondDerivative;


        synth.sonifyValues(yVal,firstDerivative,secondDerivative);

        synth.panner.pan.value = (x)/5;
    }

    var previous = false;
    Leap.loop(function(frame){

        if(frame.pointables.length){
            previous = true;
            var tool = frame.pointables[0];
            if(! synth.amp.gain.value){
                synth.amp.gain.value = 0.5;
            }
            setX(tool.stabilizedTipPosition[0]/25);
        }else if(previous){
                previous = false;
                synth.amp.gain.value = 0;
        }
    });
}