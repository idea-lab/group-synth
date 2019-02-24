document.getElementById('body').addEventListener('click', function(){
Gibber.init()
  onStart();
  $("#instructions").text("move your mouse");
  c = Sine(879, 0.78);
window.setInterval(function(){
  c.frequency = Add(220, Sine(.1, 110)._)
  // console.log(event.clientX/window.innerWidth * 1000 + ": " + event.clientY/window.innerHeight);
}, 10);
});
