function onStart(){

  var mousePos = {};

 function getRandomInt(min, max) {
   return Math.round(Math.random() * (max - min + 1)) + min;
 }
 window.setInterval(function(){
   var center = getCenter();
   mousePos.x = center[0];
   mousePos.y = center[1];
   // console.log(event.clientX/window.innerWidth * 1000 + ": " + event.clientY/window.innerHeight);
 }, 10);

  $(window).mouseleave(function(e) {
    mousePos.x = -1;
    mousePos.y = -1;
  });

  var draw = setInterval(function(){
    if(mousePos.x > 0 && mousePos.y > 0){

      var range = 15;

      var color = "background: rgb("+getRandomInt(0,255)+","+getRandomInt(0,255)+","+getRandomInt(0,255)+");";

      var sizeInt = getRandomInt(10, 30);
      size = "height: " + sizeInt + "px; width: " + sizeInt + "px;";

      var left = "left: " + getRandomInt(mousePos.x-range-sizeInt, mousePos.x+range) + "px;";

      var top = "top: " + getRandomInt(mousePos.y-range-sizeInt, mousePos.y+range) + "px;";

      var style = left+top+color+size;
      $("<div class='ball' style='" + style + "'></div>").appendTo('#wrap').one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function(){$(this).remove();});
    }
  }, 1);
}
