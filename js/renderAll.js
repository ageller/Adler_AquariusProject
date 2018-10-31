//Note: TRAPPIST-1 only shows 6 planets because the outer one is marked "controversial"
function animate(time) {
	requestAnimationFrame( animate );
	update(time);
	render();

}

function update(time){
	TWEEN.update(time);
	params.keyboard.update();

	if (params.timeStepFac > 0){
		params.pause = false;
	}


    //pause the time evolution
	if (params.keyboard.down("space") ) {
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
	if ( params.keyboard.down("left") ) {
		params.timeStepFac = -1. * Math.abs(params.timeStepFac);
		params.resetSlider('timeStepFac', gui, params.timeStepFac);

	}
	if ( params.keyboard.down("right") ) {
		params.timeStepFac = Math.abs(params.timeStepFac);
		params.resetSlider('timeStepFac', gui, params.timeStepFac);

	}
	params.controls.update();

	params.SunMesh.material.uniforms.cameraCenter.value = params.camera.position;

}

function updateBillboards(){
	params.coronaMesh.lookAt(params.camera.position);
}

function myRender(){

	//render the scene (with the Milky Way always in the back)
	if (params.renderer != params.effect) params.renderer.clear();
	params.renderer.render( params.MWInnerScene, params.camera );
	if (params.renderer != params.effect) params.renderer.clearDepth();
	params.renderer.render( params.scene, params.camera );
}

function render() {


	if (!params.pause){
		params.saveTimeStepFac = params.timeStepFac;
	}

	params.timeStep = parseFloat(params.timeStepUnit)*parseFloat(params.timeStepFac);
	if (params.timeStep != 0){
		params.Year += params.timeStep;
		params.updateSolarSystem();
	}



	//make sure that the billboards are always looking at the camera
	updateBillboards();

	myRender();


	if (params.captureCanvas){
		var screenWidth = window.innerWidth;
		var screenHeight = window.innerHeight;
		var aspect = screenWidth / screenHeight;
		
		params.renderer.setSize(params.captureWidth, params.captureHeight);
		params.camera.aspect = params.captureWidth / params.captureHeight;;
		params.camera.updateProjectionMatrix();

		myRender();

		params.capturer.capture( params.renderer.domElement );

		//restore the original
		params.renderer.setSize(screenWidth, screenHeight);
		params.camera.aspect = aspect;
		params.camera.updateProjectionMatrix();
		myRender();


	}

}
