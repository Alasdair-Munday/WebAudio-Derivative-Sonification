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
var firstDerivative, secondDerivative, yGauge, xGauge;
$(document).ready(function () {
     firstDerivative = new Gauge(d3.select(document.getElementById('first-derivative')),0,10,0,"f\'(x)");
     secondDerivative = new Gauge(d3.select(document.getElementById('second-derivative')),0,10,0,"f\'\'(x)");
    yGauge = new Gauge(d3.select(document.getElementById('y-gauge')),0,1,0,"Y");
    xGauge =  new Gauge(d3.select(document.getElementById('x-gauge')),0,5,0,"X");
});


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
            fn: eqnString,
            color: "#ffffff"
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

        var firstDerivativeVal = (deltaY - yVal)/ 0.001;
        var deltafirstDerivative = (thirdY - deltaY)/0.001;
        var secondDerivativeVal = ( deltafirstDerivative - firstDerivativeVal)/ 0.001;
        options.annotations = [{x:x}];
        var plot = functionPlot(options);
        firstDerivative.setData(firstDerivativeVal);
        secondDerivative.setData(secondDerivativeVal);
        xGauge.setData(x);
        yGauge.setData(yVal);


        synth.sonifyValues(yVal,firstDerivativeVal,secondDerivativeVal);

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