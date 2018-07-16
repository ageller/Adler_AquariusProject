//Note: TRAPPIST-1 only shows 6 planets because the outer one is marked "controversial"
function animate(time) {
	requestAnimationFrame( animate );
	update(time);
	render();

}

function update(time){
	TWEEN.update(time);
	keyboard.update();
	if (params.timeStepFac > 0){
		params.pause = false;
	}


	//pause the time evolution
	if ( keyboard.down("space") ) {
		params.pause = !params.pause;
		if (params.pause){
			if (params.timeStepFac != 0 && params.timeStepUnit != 0){
				params.saveTimeStepFac = params.timeStepFac;
				flashplaystop("#stop");
				params.timeStepFac = 0.;
			}

		} else {
			if (params.timeStepFac == 0 && params.timeStepUnit != 0){
				flashplaystop("#play")
				params.timeStepFac = params.saveTimeStepFac;
			}
		}
		params.resetSlider('timeStepFac', gui, params.timeStepFac);

	}

	if (keyboard.down("T")) {
		//params.inTween = true;
		console.log("tweening")	
		runTweens()
	}
	if (keyboard.down("Y")) {
		params.inTween = false;
	}
	if (keyboard.down("Q")) {
		params.Year = t0;
		params.updateSolarSystem();
	}
	if (keyboard.down("W")) {
		params.Year = t1;
		params.updateSolarSystem();
	}
	if (keyboard.down("E")) {
		params.Year = t2;
		params.updateSolarSystem();
	}
	if (keyboard.down("R")) {
		params.Year = tf;
		params.updateSolarSystem();
	}	
	if (keyboard.down("C")) {
		console.log(camera.position, camera.rotation, params.Year, params.JDtoday);
	}

	if ( keyboard.down("left") ) {
		params.timeStepFac = -1. * Math.abs(params.timeStepFac);
		params.resetSlider('timeStepFac', gui, params.timeStepFac);

	}
	if ( keyboard.down("right") ) {
		params.timeStepFac = Math.abs(params.timeStepFac);
		params.resetSlider('timeStepFac', gui, params.timeStepFac);

	}
	if (! params.inTween){
		controls.update();
	}

	SunMesh.material.uniforms.cameraCenter.value = camera.position;

}

function updateBillboards(){
	coronaMesh.lookAt(camera.position);
}

function myRender(){

	//render the scene (with the Milky Way always in the back)
	if (params.renderer != effect) params.renderer.clear();
	params.renderer.render( MWInnerScene, camera );
	if (params.renderer != effect) params.renderer.clearDepth();
	params.renderer.render( scene, camera );
}

function render() {
	camPrev = camDist;
	camDist = CameraDistance();



	if (!params.pause){
		params.saveTimeStepFac = params.timeStepFac;
	}

	params.timeStep = parseFloat(params.timeStepUnit)*parseFloat(params.timeStepFac);
	if ((params.timeStep != 0)){// && (params.Year + params.timeStep <= params.tmax) && (params.Year + params.timeStep >= params.tmin)){
		params.Year += params.timeStep;
		params.updateSolarSystem();
	}



	//make sure that the billboards are always looking at the camera
	updateBillboards();

	//update the corona/glow size based on the camera position
	var dist,vFoc,height,width;
	if (camDist  > 50.){
	 // visible width
		dist = SunMesh.position.distanceTo(camera.position);
		vFOV = THREE.Math.degToRad( camera.fov ); // convert vertical fov to radians
		height = 2 * Math.tan( vFOV / 2 ) * dist; // visible height
		width = height * camera.aspect;  
		coronaMesh.scale.x = width/width0;
		coronaMesh.scale.y = height/height0;
	}


	myRender();


	if (params.captureCanvas){
		var screenWidth = window.innerWidth;
		var screenHeight = window.innerHeight;
		var aspect = screenWidth / screenHeight;
		
		params.renderer.setSize(params.captureWidth, params.captureHeight);
		camera.aspect = params.captureWidth / params.captureHeight;;
		camera.updateProjectionMatrix();

		myRender();

		capturer.capture( params.renderer.domElement );

		//restore the original
		params.renderer.setSize(screenWidth, screenHeight);
		camera.aspect = aspect;
		camera.updateProjectionMatrix();
		myRender();


	}

}
