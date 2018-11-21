let imageDataURL;
let urlCleared;
let fileName;
const start = document.querySelector(".selfie"); // need to let the user interact with the page, otherwise triggering video play is not allowed
const checkPhoto = document.querySelector("#check-photo");
const restartPhoto = document.querySelector("#restart");
const imgFrame = document.querySelector(".frame.image");
const videoFrame = document.querySelector(".frame.video");
const modal = document.querySelector(".modal");
window.addEventListener("DOMContentLoaded", init);
function init() {
  start.addEventListener("click", startVideo);
}

function startVideo() {
  // show / hide buttons
  checkPhoto.classList.remove("hide");
  videoFrame.classList.remove("hide");
  modal.classList.remove("hide");

  let image = document.querySelector("#snapshot");
  let video = document.querySelector("#camera-stream");

  // get video stream
  navigator.getUserMedia(
    {
      video: true,
      audio: false
    },
    // Success Callback
    function(stream) {
      // Create an object URL for the video stream and set it as src of our HTLM video element.
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
    // swith from video view to still view
    imgFrame.classList.remove("hide");
    videoFrame.classList.add("hide");
    let hidden_canvas = document.querySelector("canvas");
    // Get the sizes of the video element and aspect ratio
    let width = video.videoWidth;
    let height = video.videoHeight;
    let ratio = width / height;
    // Get the size of the div frame
    const frameHeight = imgFrame.getBoundingClientRect().height;

    // Context object for working with the canvas.
    let context = hidden_canvas.getContext("2d");
    // Set the canvas to the same dimensions as the video.
    hidden_canvas.height = frameHeight;
    hidden_canvas.width = frameHeight * ratio;
    // Draw a copy of the current frame from the video on the canvas.
    context.drawImage(video, 0, 0, frameHeight * ratio, frameHeight);
    // Get the image dataURL from the canvas.
    imageDataURL = hidden_canvas.toDataURL();
    // Set the dataURL as source of an image element, showing the captured photo.
    image.setAttribute("src", imageDataURL);
    urlCleared = hidden_canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    // download the img file when button is clicked
    // downloadPhoto.addEventListener("click", downloadFile);
    // function downloadFile() {
    //   window.location.href = urlCleared;
    // }

    restartPhoto.addEventListener("click", showVideo);
    function showVideo() {
      videoFrame.classList.remove("hide");
      imgFrame.classList.add("hide");
    }
  }
  // take a snapshot, upload to server, send url to faceAPI
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
          // sent to face API
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
                console.table(data[0].faceAttributes.emotion);
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
