(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var activity = require('../');

var getUserMedia = navigator.getUserMedia ||
	navigator.webkitGetUserMedia ||
	navigator.mozGetUserMedia;

var that = null;

var bar = function(id) {
	var canvas = document.getElementById(id);
	var context = canvas.getContext('2d');
	var max = 0;

	return function(level) {
		var height = Math.round(200 * level);

		if(height > max) max = height;

		context.clearRect(0, 0, 50, 200);
		context.fillStyle = '#f4d7c9';
		context.fillRect(0, 200 - height, 50, height);

		context.beginPath();
		context.moveTo(0, 200 - max);
		context.lineTo(50, 200 - max);
		context.strokeStyle = '#e66e33';
		context.stroke();
	};
};

var drawProcessor = bar('canvas-processor');
var drawAnimation = bar('canvas-animation');

if(activity.supported && getUserMedia) {
	getUserMedia.call(navigator, { audio: true, video: false },
		function(media) {
			that = window.activity = activity(media, function(level) {
				drawProcessor(level);
			});

			requestAnimationFrame(function draw() {
				drawAnimation(that.get());
				requestAnimationFrame(draw);
			});
		},
		function(e) {
			console.error(e);
		});
} else {
	var p = document.createElement('p');
	p.textContent = 'Required APIs not supported in current browser';
	document.body.insertBefore(p, document.body.firstChild);
}

},{"../":2}],2:[function(require,module,exports){
var supported = !!(window.AudioContext &&
	window.MediaStreamAudioSourceNode &&
	window.AnalyserNode &&
	window.ScriptProcessorNode);

module.exports = function(media, options, callback) {
	if(!callback) {
		callback = options;
		options = null;
	}

	options = options || {};

	var that = {};
	var context = options.context || new AudioContext();
	var source = context.createMediaStreamSource(media);
	var analyser = context.createAnalyser();
	var processor = null;

	if(callback) {
		processor = context.createScriptProcessor(2048, 1, 1);
		processor.onaudioprocess = function() {
			callback(that.get());
		};
	}

	analyser.smoothingTimeConstant = 0.3;
	analyser.fftSize = 1024;

	source.connect(analyser);

	that.get = function() {
		var sum = 0;
		var data = new Uint8Array(analyser.frequencyBinCount);
		analyser.getByteFrequencyData(data);

		for(var i = 0; i < data.length; i++) {
			sum += data[i];
		}

		return (sum / data.length) / 255;
	};

	that.destroy = function() {
		if(processor) {
			processor.disconnect();
			analyser.disconnect();
		}

		source.disconnect();

		if(!options.context) context.close();
	};

	source.connect(analyser);

	if(processor) {
		analyser.connect(processor);
		processor.connect(context.destination);
	}

	return that;
};

module.exports.supported = supported;

},{}]},{},[1]);
