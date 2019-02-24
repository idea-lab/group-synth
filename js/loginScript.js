firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      window.open('./mouseIndex.html', '_self');
    }
  });
function login(){
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;
  firebase.auth().signInWithEmailAndPassword(username, password).catch(function(error) {
    window.alert(error);
  });
}
