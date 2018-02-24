//Note: TRAPPIST-1 only shows 6 planets because the outer one is marked "controversial"
function animate(time) {
	requestAnimationFrame( animate );
	update(time);
	render();

}

function update(time){
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
	if ( keyboard.down("left") ) {
		params.timeStepFac = -1. * Math.abs(params.timeStepFac);
		params.resetSlider('timeStepFac', gui, params.timeStepFac);

	}
	if ( keyboard.down("right") ) {
		params.timeStepFac = Math.abs(params.timeStepFac);
		params.resetSlider('timeStepFac', gui, params.timeStepFac);

	}
	controls.update();

	SunMesh.material.uniforms.cameraCenter.value = camera.position;


}

function updateBillboards(){
	coronaMesh.lookAt(camera.position);
}

function render() {
	camPrev = camDist;
	camDist = CameraDistance();



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




	//render the scene (with the Milky Way always in the back)
	if (params.renderer != effect) params.renderer.clear();
	params.renderer.render( MWInnerScene, camera );
	if (params.renderer != effect) params.renderer.clearDepth();
	params.renderer.render( scene, camera );




}
