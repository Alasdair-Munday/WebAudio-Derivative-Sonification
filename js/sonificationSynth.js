/**
 * Created by alasd on 20/01/2016.
 */
//setup audio context
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioCtx = new AudioContext();
var synth={};
var formantSynth;
var eqnString;
var graph;
var fMax = 800;
var fMin = 200;

var axies = {
    xMin : -5,
    xMax : 5,
    yMin : -1,
    yMax : 1
};

var example ={
    y:0,
    dx:0,
    dx2:0
};


function startExample(){
    synth.start();
    synth.sonifyValues(example.y,example.dx,example.dx2);
}

function stopExample(){
    synth.stop();
}

$("#example-y").change(updateExample);

function updateExample(){
    example.y = $("#example-y").val() /100 * axies.yMax;
    example.dx = $("#example-dx").val()/25;
    example.dx2 = $("#example-dx2").val()/10;

    $("#example-y-value").html(example.y);
    $("#example-dx-value").html(example.dx);
    $("#example-dx2-value").html(example.dx2);
    startExample();
}


function setView(viewString){
    if(viewString == "main"){
        $("#main-tab").addClass("active");
        $("#help-tab").removeClass("active");
        $("#help").hide();
        $("#main").show();
    }else{
        $("#help-tab").addClass("active");
        $("#main-tab").removeClass("active");
        $("#main").hide();
        $("#help").show();
    }
}

function setRange(parameterString,element){

    document.getElementById(parameterString+'RangeLabel').innerHTML = element.value;

    switch(parameterString) {
        case 'x':
            axies.xMax = element.value;
            axies.xMin = -element.value;
            xGauge.setData(playhead,0, axies.xMax);
            break;
        case 'y' :
            axies.yMax = element.value;
            axies.yMin = -element.value;
            yGauge.setData(playhead,0, axies.yMax);
            synth.setNoteRange(fMax,fMin,axies.yMax,axies.yMin);
            break;
    }
    updateOptions();
    sonifyEquation();

}

function audioSetup(){
    synth = new Synth(audioCtx);
    //formantSynth = new FormantSynth(audioCtx);
}
audioSetup();
var firstDerivative, secondDerivative, yGauge, xGauge;
$(document).ready(function () {
    firstDerivative = new Gauge(d3.select(document.getElementById('first-derivative')),0,10,0,"f\'(x)");
    secondDerivative = new Gauge(d3.select(document.getElementById('second-derivative')),0,10,0,"f\'\'(x)");
    yGauge = new Gauge(d3.select(document.getElementById('y-gauge')),0,axies.yMax,0,"Y");
    xGauge =  new Gauge(d3.select(document.getElementById('x-gauge')),0,axies.xMax,0,"X");
    sonifyEquation();
});


d3.select(document.getElementById('speed-slider'))
    .append('svg')
    .append('path')
    .attr('stroke-width',5)


var playhead = axies.xMin;
var playId = null;
var playtime = 10;
var sampleRate = 20;
var reverse = false;

function play(){
    playId = setInterval(nextFrame,1/(sampleRate*1000));
    synth.start();
}
function pause(){
    clearInterval(playId);
    playId = null;
    synth.stop();
}

function stop(){
    if(playId)
        pause();
    reset();
}

function reset(){
    playhead = axies.xMin;
}

function nextFrame(){

    if(playhead > axies.xMax)
        stop();

    setX(playhead);
    playhead += (axies.xMax - axies.xMin)/(sampleRate*playtime);
}

function setVowel(vowel){
    formantSynth.setVowel(vowel);
}

var options = {};
function updateOptions(){
    options = {
        target: '#graph',
        yAxis: {domain: [axies.yMin, axies.yMax]},
        xAxis: {domain: [axies.xMin, axies.xMax]},
        width: 600,
        disableZoom: true
    }
}
updateOptions();

function sonifyEquation(){
    eqnString = document.getElementById("mathTxt").value;
    options.data = [{
        fn: eqnString,
        color: "#ffffff"
    }];


    graph = functionPlot(options);

    graph.on('mouseover',function(){
        synth.start();
    });

    graph.on('mousemove',function(x,y){
        setX(x);
    });

    graph.on('mouseout',function(){
        if(!playId)
            synth.stop();
    });

}

function setX(x){
    playhead = x;
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

    synth.panner.pan.value = (x)/axies.xMax;
}

var previous = false;
Leap.loop(function(frame){

    if(frame.pointables.length){
        previous = true;
        var tool = frame.pointables[0];
        if(! synth.amp.gain.value){
            synth.start();
        }
        setX(tool.stabilizedTipPosition[0]/25);
    }else if(previous){
        previous = false;
        synth.stop();
    }
});