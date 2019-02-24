firebase.auth().onAuthStateChanged(function(user){
  if(user){
    $(".profilePic").attr("src", user.photoURL);
    $(".displayName").text(user.displayName);
  }else{
    window.open("./login.html", "_self");
  }
});
function logOut(){
  firebase.auth().signOut().catch(function(error){
    alert(error);
  });
}
