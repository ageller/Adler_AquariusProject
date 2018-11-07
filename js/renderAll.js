//Note: TRAPPIST-1 only shows 6 planets because the outer one is marked "controversial"
function animate(time) {
	requestAnimationFrame( animate );
	update(time);
	render();

}

function update(time){
	TWEEN.update(time);
	params.keyboard.update();
	params.controls.update();
	
	moveImpactCircle();

	// if (params.keyboard.down("up")){
	// 	params.aquarius.tperi += 0.001;
	// 	console.log(params.aquarius.tperi)
	// 	clearPlanetOrbitLines();
	// 	drawPlanetOrbitLines();
	// 	drawAquariusOrbitLine();
	// 	moveAquarius();
	// }
	// if (params.keyboard.down("down")){
	// 	params.aquarius.tperi -= 0.001;
	// 	console.log(params.aquarius.tperi)
	// 	clearPlanetOrbitLines();
	// 	drawPlanetOrbitLines();
	// 	drawAquariusOrbitLine();
	// 	moveAquarius();
	// }
	// if (params.keyboard.down("right")){
	// 	params.planets[2].tperi += 0.0001;
	// 	console.log(params.planets[2].tperi)
	// 	clearPlanetOrbitLines();
	// 	drawPlanetOrbitLines();
	// 	drawAquariusOrbitLine();
	// 	movePlanets();
	// }
	// if (params.keyboard.down("left")){
	// 	params.planets[2].tperi -= 0.0001;
	// 	console.log(params.planets[2].tperi)
	// 	clearPlanetOrbitLines();
	// 	drawPlanetOrbitLines();
	// 	drawAquariusOrbitLine();
	// 	movePlanets();
	// }

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

	params.timeStep = parseFloat(params.timeStepUnit)*parseFloat(params.timeStepFac);
	if (params.timeStep != 0 && !params.pause){
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
