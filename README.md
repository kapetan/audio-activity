# audio-activity

Detect audio activity of a MediaStream. Only works in modern browsers that support the Web Audio API.

	npm install audio-activity

See the [live demo](https://kapetan.github.io/audio-activity/demo/index.html).

# Usage

```javascript
var audioActivity = require('audio-activity');

navigator.getUserMedia({ audio: true, video: false },
	function(stream) {
		var audio = audioActivity(stream, function(level) {
			// 'level' indicates the audio activity in percentage
			console.log(level);
		});

		setTimeout(function() {
			// Call the destroy method to cleanup resources
			audio.destroy();
		}, 5000);
	},
	function(e) {
		console.error(e);
	});
```

The callback function is optional, by omitting it it's still possible to read the activity level using the `audio.get()` method.

```javascript
requestAnimationFrame(function draw() {
	var level = audio.get();
	console.log(level);

	requestAnimationFrame(draw);
});
```
