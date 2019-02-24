firebase.auth().onAuthStateChanged(function(user){
  if(user){
    user.updateProfile({
      displayName: document.getElementById("name").value
    }).then(function(){
      console.log(user.displayName);
      window.open('./index.html', '_self');
    }).catch(function(error){
      alert(error);
    });
  }
});
function register(){
  var email = document.getElementById("username").value;
  var pass = document.getElementById("password1").value;
  var confPass = document.getElementById("password2").value;
  if(pass == confPass){
    firebase.auth().createUserWithEmailAndPassword(email, pass).catch(function(error){
      alert(error);
    });
  }else{
    alert("passwords dont match bruh");
  }
}
