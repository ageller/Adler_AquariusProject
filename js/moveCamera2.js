//takes us from outer solar system to watch asteroid and Mars swoop by
function ZoomIn1() {
      
      var JDtoday = JD0 + (params.Year - 1990.);
      //var JDstart1 = JD0 + (2015.5 - 1990.)
	var JDstart1 = JD0 + (2014.51 - 1990.)      


      //zoom out from Asteroid
      if ((params.counter == 0) && (JDtoday > JDstart1)) {
     
      var CameraTween1 = new TWEEN.Tween(camera.position)
		.to({ x: 9.408948356323043, y: 2.3754693874766266, z: 9.046989569058946 }, 10000)
                .easing(TWEEN.Easing.Quintic.InOut);
 
      var CameraTween2 = new TWEEN.Tween(camera.position)						
		//.to({ x: 0.7448025457837447, y: -0.542700457564619, z: 1.3863427066124339 }, 30000)
        	.to({ x: 0.7448025457837447, y: -0.542700457564619, z: 1.3863427066124339 }, 20000)      
		.easing(TWEEN.Easing.Quintic.InOut)
		//.start(); // Start the tween immediately.     

	CameraTween1.chain(CameraTween2);
	CameraTween1.start();

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

	//CameraTween1.onStart(function() {console.log(params.Year)} );
	CameraTween1.onComplete(function() {console.log(params.Year)} );
	CameraTween1.onStart( function(){

                        console.log("testing", params.videoSaveTime)
                        params.captureCanvas = true;
                        capturer = new CCapture( {
                                format: params.videoFormat,
                                workersPath: 'resources/CCapture/',
                                framerate: params.videoFramerate,
                                name: params.filename,
                                timeLimit: params.videoDuration,
                                autoSaveTime: params.videoSaveTime,
                                verbose: true,
                        } );

                        capturer.start();
			console.log(params.Year);

                }
	);
	CameraTween2.onStart(function() {console.log(params.Year)});
	CameraTween2.onComplete(function() {
			
		capturer.stop();
		
		console.log(params.Year)
			
		}

	);


      params.counter = params.counter + 1;
      
      }
}

