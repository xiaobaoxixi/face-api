let video = document.querySelector("#camera-stream");
let image = document.querySelector("#snap");
let takePhoto = document.querySelector("#take-photo");

// get video stream
window.addEventListener("DOMContentLoaded", init);
function init() {
  navigator.getUserMedia(
    // Options
    {
      video: true
    },
    // Success Callback
    function(stream) {
      // Create an object URL for the video stream and
      // set it as src of our HTLM video element.
      video.src = window.URL.createObjectURL(stream);

      // Play the video element to show the stream to the user.
      video.play();
    },
    // Error Callback
    function(err) {
      // Most common errors are PermissionDenied and DevicesNotFound.
      console.error(err);
    }
  );
}
takePhoto.addEventListener("click", takeSnapshot);
function takeSnapshot() {
  let hidden_canvas = document.querySelector("canvas");
  // Get the exact size of the video element.
  let width = video.videoWidth;
  let height = video.videoHeight;
  // Context object for working with the canvas.
  let context = hidden_canvas.getContext("2d");

  // Set the canvas to the same dimensions as the video.
  hidden_canvas.width = width;
  hidden_canvas.height = height;

  // Draw a copy of the current frame from the video on the canvas.
  context.drawImage(video, 0, 0, width, height);

  // Get an image dataURL from the canvas.
  var imageDataURL = hidden_canvas.toDataURL("image/png");

  // Set the dataURL as source of an image element, showing the captured photo.
  image.setAttribute("src", imageDataURL);
  var urlFixed = hidden_canvas
    .toDataURL("image/png")
    .replace("image/png", "image/octet-stream");
  console.log(urlFixed);
  window.location.href = urlFixed;
}

//////////////////////////////
// face API
//////////////////////////////

$(function() {
  var params = {
    returnFaceId: "true",
    returnFaceLandmarks: "true",
    returnFaceAttributes: "emotion"
  };

  $.ajax({
    url:
      "https://westeurope.api.cognitive.microsoft.com/face/v1.0/detect?" +
      $.param(params),
    beforeSend: function(xhrObj) {
      // Request headers, also supports "application/octet-stream"
      xhrObj.setRequestHeader("Content-Type", "application/json");
      xhrObj.setRequestHeader(
        "Ocp-Apim-Subscription-Key",
        "7aa6b095decb4b0d9624979844008941"
      );
    },
    type: "POST",
    data:
      '{"url": "https://i.pinimg.com/originals/37/8f/fa/378ffa7b4bc07f190ee35f85ed816377.jpg"}'
  })
    .done(function(data) {
      // Get face rectangle dimensions
      console.log(data);
      var faceRectangle = data[0].faceRectangle;
      var faceRectangleList = $("#faceRectangle");

      // Append to DOM
      for (var prop in faceRectangle) {
        faceRectangleList.append(
          "<li> " + prop + ": " + faceRectangle[prop] + "</li>"
        );
      }

      // Get emotion confidence scores
      var scores = data[0].scores;
      var scoresList = $("#scores");

      // Append to DOM
      for (var prop in scores) {
        scoresList.append("<li> " + prop + ": " + scores[prop] + "</li>");
      }
    })
    .fail(function(err) {
      alert("Error: " + JSON.stringify(err));
    });
});
