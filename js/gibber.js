var currentUser;
var firebaseUpdate;
var c;
var time;
$( document ).ready(function() {

});
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
    }
  });
  firebase.database().ref('session92103/startTime').on('value', function(snap){
    time = snap.val();
  });
document.getElementById('body').addEventListener('click', function(){
  firebaseUpdate = !firebaseUpdate;
  firebase.database().ref('session92103/status').once('value', function(snap){
      firebase.database().ref('session92103/status').set(!snap.val());
  });
});
function doStuff() {
Gibber.init()
  firebase.database().ref('session92103/startTime').set(Math.floor(new Date().getTime())+5000);
  onStart();
  $("#instructions").text("move your hand");
  handPos = {x: -1, y: -1};
  // mousePos.x = -1;
  // mousePos.y = -1;
  window.setInterval(function(){
      var center = getCenter();
      var note = xyToFreqAmp(center[0], center[1]);
      handPos.x = note[0];
      handPos.y = note[1];

    if(Math.floor(new Date().getTime()) > time && firebaseUpdate){
      firebase.database().ref('session92103/' + currentUser.displayName).push({
        'x': handPos.x,
        'y': handPos.y
      });
      notes = [-1,-1,-1];
      vol = [-1, -1, -1];
    firebase.database().ref('session92103/user1').limitToLast(1).once('value', function(snap){
      snap.forEach(function(snapshot){
        notes[0] = snapshot.val().x;
        vol[0] = snapshot.val().y;
        firebase.database().ref('session92103/user2').limitToLast(1).once('value', function(snap){
          snap.forEach(function(snapshot){
            notes[1] = snapshot.val().x;
            vol[1] = snapshot.val().y;
            firebase.database().ref('session92103/user3').limitToLast(1).once('value', function(snap){
              snap.forEach(function(snapshot){
                notes[2] = snapshot.val().x;
                vol[2] = snapshot.val().y;
              });
              console.log(notes);
			  var prev = [-2, -2, -2]
      var a = FM('bass', { maxVoices:4, waveform:'PWM', attack:ms(1), decay:23 });
      var b = Synth({ maxVoices:4, waveform:'PWM', attack:ms(1), decay:23 });
      var c = Synth({ maxVoices:4, waveform:'PWM', attack:ms(1), decay:23 });
        var numUsers = 3
    console.log("hi")
	document.body.onkeydown = function(e){
    if(e.keyCode == 32){
        for (i = 0; i < numUsers; i++) {
       if (notes[i] != prev[i]) {
          prev[i] = notes[i]
          if (i == 0) {a.kill(); console.log("a");}
          if (i == 1) {b.kill()}
          if (i == 2) {c.kill()}
          if (notes[i] != -1) {
              if (i == 0) {
                  a = FM('bass', { maxVoices:4, waveform:'PWM', attack:ms(1), decay:23});
                  a.note(notes[i], 1);
                  console.log(notes[i])
              }
              if (i == 1) {
                  b = Synth({ maxVoices:4, waveform:'PWM', attack:ms(1), decay:23});
                  b.note(notes[i], 0.7);
                  console.log(notes[i])
              }
              if (i == 2) {
                  c = Synth({ maxVoices:4, waveform:'PWM', attack:ms(1), decay:23});
                  c.note(notes[i], 0.7);
                  console.log(notes[i])
              }
          }
        }
      }
    }
}
      
      console.log("Hi")
            });
          });
        });
      });
    });
    }
}, 2000);
}
/*
syncing

start time
mea
*/
