let imageDataURL;
let urlCleared;
let fileName;
const start = document.querySelector("#startBtn"); // need to let the user interact with the page, otherwise triggering video play is not allowed
const checkPhoto = document.querySelector("#check-photo");
const downloadPhoto = document.querySelector("#download-photo");

window.addEventListener("DOMContentLoaded", init);
function init() {
  start.addEventListener("click", startVideo);
}

function startVideo() {
  // show / hide buttons
  start.classList.add("hide");
  checkPhoto.classList.remove("hide");
  downloadPhoto.classList.remove("hide");
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
    let hidden_canvas = document.querySelector("canvas");
    // Get the sizes of the video element and aspect ratio
    let width = video.videoWidth;
    let height = video.videoHeight;
    let ratio = width / height;
    // Get the size of the div frame
    const frame = document.querySelector(".frame.image");
    const frameHeight = frame.getBoundingClientRect().height;
    document.querySelector(".frame.video").classList.add("cornered");

    // Context object for working with the canvas.
    let context = hidden_canvas.getContext("2d");
    // Set the canvas height to the same height as the frame, set width keeping video aspect ratio.
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
    downloadPhoto.addEventListener("click", downloadFile);
    function downloadFile() {
      window.location.href = urlCleared;
    }
  }
  // take a snapshot, upload to server, send url to faceAPI
  checkPhoto.addEventListener("click", sentToPHP);
  function sentToPHP() {
    // take a snapshot
    takeSnapshot();
    // upload to server
    $(function() {
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
                if (data[0]) {
                  console.table(data[0].faceAttributes.emotion);
                }
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

// const spotify = document.querySelector("#spotify");
// spotify.addEventListener("click", login);
// function login() {
//   function login(callback) {
//     var CLIENT_ID = "6b284830006843e7ae7b170725715aed";
//     var REDIRECT_URI = "http://jmperezperez.com/spotify-oauth-jsfiddle-proxy/";
//     function getLoginURL(scopes) {
//       return (
//         "https://accounts.spotify.com/authorize?client_id=" +
//         CLIENT_ID +
//         "&redirect_uri=" +
//         encodeURIComponent(REDIRECT_URI) +
//         "&scope=" +
//         encodeURIComponent(scopes.join(" ")) +
//         "&response_type=token"
//       );
//     }

//     var url = getLoginURL(["user-read-email"]);

//     var width = 450,
//       height = 730,
//       left = screen.width / 2 - width / 2,
//       top = screen.height / 2 - height / 2;

//     window.addEventListener(
//       "message",
//       function(event) {
//         var hash = JSON.parse(event.data);
//         if (hash.type == "access_token") {
//           callback(hash.access_token);
//         }
//       },
//       false
//     );

//     var w = window.open(
//       url,
//       "Spotify",
//       "menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=" +
//         width +
//         ", height=" +
//         height +
//         ", top=" +
//         top +
//         ", left=" +
//         left
//     );
//   }

//   function getUserData(accessToken) {
//     return $.ajax({
//       url: "https://api.spotify.com/v1/me",
//       headers: {
//         Authorization: "Bearer " + accessToken
//       }
//     });
//   }

//   var templateSource = document.getElementById("result-template").innerHTML,
//     template = Handlebars.compile(templateSource),
//     resultsPlaceholder = document.getElementById("result"),
//     loginButton = document.getElementById("btn-login");

//   loginButton.addEventListener("click", function() {
//     login(function(accessToken) {
//       getUserData(accessToken).then(function(response) {
//         loginButton.style.display = "none";
//         resultsPlaceholder.innerHTML = template(response);
//       });
//     });
//   });
// }
