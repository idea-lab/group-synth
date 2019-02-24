var currentUser;
var firebaseUpdate;
var c;
Gibber.init()
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      currentUser = user;
    }else{
      window.location("./login.html", "_self");
    }
  });
  firebase.database().ref('session92103/status').on('value', function(snap){
    firebaseUpdate = snap.val();
    if(firebaseUpdate){
      doStuff();
    }else{
      $("#instructions").text("Click Anywhere to Resume");
      c.kill();
      firebaseUpdate = !firebaseUpdate;
    }
  });
document.getElementById('body').addEventListener('click', function(){
  firebase.database().ref('session92103/status').once('value', function(snap){
      firebase.database().ref('session92103/status').set(!snap.val());
  });
});
function doStuff() {
  onStart();
  $("#instructions").text("move your mouse");
  c = Sine(Mouse.x, Mouse.y);
  mousePos = {};
  mousePos.x = -1;
  mousePos.y = -1;
  window.setInterval(function(){
    if(Math.floor(new Date().getTime())%1000 == 0 && firebaseUpdate){
      $(window).mousemove(function (e) {
        mousePos.x = e.pageX;
        mousePos.y = e.pageY;
      });

      firebase.database().ref('session92103/' + currentUser.displayName).push({
         'x' : mousePos.x,
         'y' : mousePos.y,
         'time': Math.floor(new Date().getTime())
      })
      // console.log(event.clientX/window.innerWidth * 1000 + ": " + event.clientY/window.innerHeight);
    }
}, 10);

}


function myTimer() {
  var d = new Date();
  var t = d.toLocaleTimeString();
  document.getElementById("demo").innerHTML = t;
}

function myStopFunction() {
  clearInterval(myVar);
}
/*
syncing

start time
mea
*/
