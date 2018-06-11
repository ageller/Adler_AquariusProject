//takes us from outer solar system to watch asteroid and Mars swoop by
function ZoomIn1() {
      
      var JDtoday = JD0 + (params.Year - 1990.);
      var JDstart1 = JD0 + (2015.5 - 1990.)
      
      //zoom out from Asteroid
      if ((params.counter == 0) && (JDtoday > JDstart1)) {
      
      var CameraTween1 = new TWEEN.Tween(camera.position)						
		.to({ x: 0.7448025457837447, y: -0.542700457564619, z: 1.3863427066124339 }, 30000)
              	.easing(TWEEN.Easing.Quintic.InOut)
		.start(); // Start the tween immediately.     

	//var framecount1 = 10; 
	//var stepsXYZ = [];
	//var CameraTween1 = new TWEEN.Tween(camera.position)
  	//	.to({ x: 0.7448025457837447, y: -0.542700457564619, z: 1.3863427066124339 }, framecount1)
	//	.easing(TWEEN.Easing.Quintic.InOut)
  	//	.onUpdate(function() {
    	//	stepsXYZ.push({x: this.x, y: this.y, z: this.z});
  	//	})
  	//	.start();
	//for (var i = 0; i <= framecount1; ++i) {
  	//	CameraTween1.update(i);
	//}	

      params.counter = params.counter + 1;
      
      }
}

