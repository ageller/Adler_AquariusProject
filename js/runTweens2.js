function runTweens(){

	camera.lookAt(params.AquariusPos);
	params.AquariusThetaMax= 2.*Math.PI;

	var duration = 10000;
	var dur1 = duration * (t1 - t0)/(tf - t0);
	var dur2 = duration * (t2 - t1)/(tf - t0);
	var dur3 = duration * (tf - t2)/(tf - t0) *50.;
	var dur4 = dur3/3.;
	console.log(dur1, dur2, dur3, dur4)

	var offset;
	var initialPos4;
	var initialRot4;

///////////////////////////////tween1
	var initialTime1 = {t:t0};
	var finalTime1 = {t:t1};
	var initialPos1 = {x: -1.5229923919239612, y: -1.392539191804188, z: 1.794524190150591 };
	var initialRot1 = {x: 0.7007383397082899, y: -1.0337449092016764, z: 0.7429190870044281};
	var finalPos1 = {x: 0.18289695665178268, y: -0.7375987331249219, z: 1.01813441075547};
	var finalRot1 = {x: 0.7076569428087275, y: -1.0310962401588097, z: 0.5660625965612196};
	// var finalPos1 = {x: 0.18291806368280125, y: -0.7375995944597667, z: 1.0181240718482598 };
	// var finalRot1 = {x: 0.7877242610262146, y: -0.9271183326009036, z: 0.7154204118270164};
	var timeTween1 = new TWEEN.Tween(initialTime1).to(finalTime1, dur1).easing(TWEEN.Easing.Linear.None)
		.onUpdate(function(object){
			params.Year = object.t;
			params.updateSolarSystem();
		});
	var rotTween1 = new TWEEN.Tween(initialRot1).to(finalRot1, dur1).easing(TWEEN.Easing.Quadratic.Out)
		.onUpdate(function(object){
			camera.rotation.x = object.x;
			camera.rotation.y = object.y;
			camera.rotation.z = object.z;
		});
	var posTween1 = new TWEEN.Tween(initialPos1).to(finalPos1, dur1).easing(TWEEN.Easing.Linear.None)
		.onUpdate(function(object){
			camera.position.x = object.x;
			camera.position.y = object.y;
			camera.position.z = object.z;
		})
		.onStart(function(){
			console.log("tween1")
///////////////////video
			params.filename = 'tween1Capture';
			params.videoDuration = 90;
			params.videoFramerate = 30;
			params.recordVideo();
///////////////////video
			timeTween1.start();
			rotTween1.start();
		})
		.onComplete(function(){
			offset = {
				x:(camera.position.x - params.AquariusPos.x), 
				y:(camera.position.y - params.AquariusPos.y), 
				z:(camera.position.z - params.AquariusPos.z)}; 
		});

///////////////////////////////tween2
	var initialTime2 = {t:t1};
	var finalTime2 = {t:t2};
	var foo1 = {x:0};
	var foo2 = {x:1};
	var timeTween2 = new TWEEN.Tween(initialTime2).to(finalTime2, dur2).easing(TWEEN.Easing.Linear.None)
		.onUpdate(function(object){
			params.Year = object.t;
			params.updateSolarSystem();
		});

	var posTween2 = new TWEEN.Tween(foo1).to(foo2, dur2).easing(TWEEN.Easing.Linear.None)
		.onUpdate(function(object){
			camera.position.x = params.AquariusPos.x + offset.x;
			camera.position.y = params.AquariusPos.y + offset.y;
			camera.position.z = params.AquariusPos.z + offset.z;
		})


//////////////////////tween3 (slow down)		
	var initialTime3 = {t:t2};
	var finalTime3 = {t:tf};
	var timeTween3 = new TWEEN.Tween(initialTime3).to(finalTime3, dur3).easing(TWEEN.Easing.Linear.None)
		.onUpdate(function(object){
			params.Year = object.t;
			params.updateSolarSystem();
		});
	var posTween3 = new TWEEN.Tween(foo1).to(foo2, dur3).easing(TWEEN.Easing.Linear.None)//Quintic.InOut)
		.onUpdate(function(object){
			camera.position.x = params.AquariusPos.x + offset.x;
			camera.position.y = params.AquariusPos.y + offset.y;
			camera.position.z = params.AquariusPos.z + offset.z;
		})

	///////////////////////////////tween4 rotate view and shrink asteroid
	var r1 = {r:5.e4};
	var r2 = {r:5.e2};
	var finalPos4 = {x: 0.726915625206527, y: -0.30257293527665774, z: 0.5939085205074811};
	var finalRot4 = {x: 0.11823860662221652, y: 0.7145724314949231, z: 0.39215904157947595};
	var rTween4 = new TWEEN.Tween(r1).to(r2, dur4).easing(TWEEN.Easing.Linear.None)
		.onUpdate(function(object){
			params.AquariusRadFac = object.r;
			clearAquarius();
			drawAquarius();								
		});
	var rotTween4 = new TWEEN.Tween(camera.rotation).to(finalRot4, dur4).easing(TWEEN.Easing.Cubic.Out)
		.onUpdate(function(object){
			camera.rotation.x = object.x;
			camera.rotation.y = object.y;
			camera.rotation.z = object.z;
		});
	var posTween4 = new TWEEN.Tween(camera.position).to(finalPos4, dur4).easing(TWEEN.Easing.Quintic.Out)
		.onUpdate(function(object){
			camera.position.x = object.x;
			camera.position.y = object.y;
			camera.position.z = object.z;
		})
		.onComplete(function() {
///////////////////video
			params.stopVideo();
			params.saveVideo();
///////////////////video
		});


//	posTween1.chain(posTween2).chain(posTween3).chain(posTween4).start();
	posTween1.chain(posTween2, timeTween2);
	posTween2.chain(posTween3, timeTween3);
	posTween3.chain(posTween4, rTween4, rotTween4);
	posTween1.start();

}
