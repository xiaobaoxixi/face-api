let imageDataURL;
let urlFixed;
let fileName;

window.addEventListener("DOMContentLoaded", init);
function init() {
  const start = document.querySelector("#startBtn"); // need to let the user interact with the page to trigger video allowance
  start.addEventListener("click", startVideo);
}

function startVideo() {
  let image = document.querySelector("#snap");
  let video = document.querySelector("#camera-stream");
  let checkPhoto = document.querySelector("#check-photo");
  let downloadPhoto = document.querySelector("#download-photo");

  // get video stream
  navigator.getUserMedia(
    // Options
    {
      video: true,
      audio: false
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
    imageDataURL = hidden_canvas.toDataURL();
    //"image/png"

    // Set the dataURL as source of an image element, showing the captured photo.
    image.setAttribute("src", imageDataURL);
    urlFixed = hidden_canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    console.log(imageDataURL);
    downloadPhoto.addEventListener("click", downloadFile);
    function downloadFile() {
      window.location.href = urlFixed;
    }
  }

  checkPhoto.addEventListener("click", sentToPHP);
  function sentToPHP() {
    takeSnapshot();
    $(function() {
      // upload to server
      $.ajax({
        type: "POST",
        url: "https://onestepfurther.nu/semester3/h/uploadImg.php",
        data: { img: imageDataURL }
      })
        .done(function(msg) {
          //   fileName = "https://onestepfurther.nu/semester3/b/" + msg;
          //   console.log(fileName.toString());
          //////////////////////////////
          // face API
          //////////////////////////////
          $(function() {
            var params = {
              returnFaceId: "true",
              returnFaceLandmarks: "true",
              returnFaceAttributes: "emotion"
            };
            let filePath = "https://onestepfurther.nu/semester3/h/" + msg;
            console.log(filePath);
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
              data: '{"url": "' + filePath + '"}'
            })
              .done(function(data) {
                // Get face rectangle dimensions
                console.log(data);
                //   var faceRectangle = data[0].faceRectangle;
                //   var faceRectangleList = $("#faceRectangle");

                //   // Append to DOM
                //   for (var prop in faceRectangle) {
                //     faceRectangleList.append(
                //       "<li> " + prop + ": " + faceRectangle[prop] + "</li>"
                //     );
                //   }

                //   // Get emotion confidence scores
                //   var scores = data[0].scores;
                //   var scoresList = $("#scores");

                //   // Append to DOM
                //   for (var prop in scores) {
                //     scoresList.append("<li> " + prop + ": " + scores[prop] + "</li>");
                //  }
              })
              .fail(function(err) {
                alert("Error: " + JSON.stringify(err));
              });
          });
        })
        .fail(function(err) {
          console.log("no php");
        });
    });
  }
}
