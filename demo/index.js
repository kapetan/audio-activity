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
