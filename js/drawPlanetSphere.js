function clearPlanet(group){
	for (var i = group.children.length - 1; i >= 0; i--) {
		group.remove(group.children[i]);
	}
	params.scene.remove(group);
}


function makePlanet(geo, tperi, day, radius, tilt, tex, sc, radScale=1., rotation=null, offset=null, ringTex=null, nightTex=null, specTex=null, bumpTex=null, cloudTex=null, cloudRotScale=0.75, cloudRadScale=1.01) {

	var group = new THREE.Group(); // group planet mesh, then orient orbit 
	if (rotation != null){
		group.rotation.x = rotation.x;
		group.rotation.y = rotation.y;
		group.rotation.z = rotation.z;
	}


	var tdiff = params.JDtoday - tperi;
	var phase = (tdiff % day)/day;

	//rescale the mesh after creating the sphere.  Otherwise, the sphere will not be drawn correctly at this small size
	var rad = radius * radScale;

	var geometry = new THREE.SphereGeometry(rad,32,32);
	var material = new THREE.MeshPhongMaterial( {
		map: tex,
	} );

	//currently only used for Earth, and could be written more scalable
	if (nightTex != null){
		var uniforms = THREE.UniformsUtils.merge( [
			THREE.UniformsLib[ "lights" ],
			{
				dayTexture: { type: "t" },
				nightTexture: { type: "t"},
				specTexture: { type: "t"},
				bumpTexture: { type: "t"},
			},
		] );
		var material = new THREE.ShaderMaterial( {
			uniforms: uniforms,
			vertexShader: EarthVertexShader,
			fragmentShader: EarthFragmentShader,
			lights: true,
		} );
			//for some reason, I have to set this here.  I wasn't recognized within the var uniforms
		material.uniforms.dayTexture.value = tex;
		material.uniforms.nightTexture.value = nightTex;
		material.uniforms.specTexture.value = specTex;
		material.uniforms.bumpTexture.value = bumpTex;
	}


	var mesh = new THREE.Mesh( geometry, material );
	if (rotation != null){
		mesh.rotation.x = THREE.Math.degToRad(90.+tilt); // orient map
		mesh.rotation.y = (2.*phase*Math.PI) % (2.*Math.PI); //rotate planet around axis
		mesh.rotation.z = THREE.Math.degToRad(0.); 
	}
	mesh.position.set(geo.x,geo.y,geo.z);
	if (offset != null){
		mesh.position.x += offset.x;
		mesh.position.y += offset.y;
		mesh.position.z += offset.z;
	}
	mesh.scale.set(sc, sc, sc);
	group.add(mesh);

	var ringMesh =null;
	if (ringTex != null){
		//create the rings here, then add to group below. 

		var geometry = new THREE.RingGeometry(1.2*rad, 2.0*rad, 64, 5, 0, Math.PI*2.);
		var RingMaterial = new THREE.MeshBasicMaterial( {
			map: ringTex,
			side: THREE.DoubleSide,
			transparent: true,
			opacity: 0.6,
		} );

		var ringMesh = new THREE.Mesh( geometry, RingMaterial );
		if (rotation != null){
			ringMesh.rotation.x = THREE.Math.degToRad(0.+tilt); 
			ringMesh.rotation.y = THREE.Math.degToRad(0.); 
			ringMesh.rotation.z = (2.*phase*Math.PI) % (2.*Math.PI); //this rotates rings at same rate as planet
		}
		ringMesh.position.set(geo.x,geo.y,geo.z);
		if (offset != null){
			ringMesh.position.x += offset.x;
			ringMesh.position.y += offset.y;
			ringMesh.position.z += offset.z;
		}
		ringMesh.scale.set(sc, sc, sc);
		group.add(ringMesh);

	}

	//make cloud layer
	var cloudMesh=null;
	if (cloudTex != null){
		var geometry = new THREE.SphereGeometry( rad*cloudRadScale, 32, 32)
		var CloudMaterial = new THREE.MeshPhongMaterial( {
			map: cloudTex,
			transparent: true,
		} );
		cloudMesh = new THREE.Mesh( geometry, CloudMaterial );
		phaseCloud = (tdiff % (day*cloudRotScale))/(day*cloudRotScale); //some offset in cloud
		if (rotation != null){
			cloudMesh.rotation.x = THREE.Math.degToRad(90.+tilt); // orient map and tilt Cloud
			cloudMesh.rotation.y = (2.*phaseCloud*Math.PI) % (2.*Math.PI); //rotate Cloud around axis
			cloudMesh.rotation.z = THREE.Math.degToRad(0.);
		}
		cloudMesh.position.set(geo.x,geo.y,geo.z);
		if (offset != null){
			cloudMesh.position.x += offset.x;
			cloudMesh.position.y += offset.y;
			cloudMesh.position.z += offset.z;
		}
		cloudMesh.scale.set(sc, sc, sc);
		group.add(cloudMesh);
	}
	
	params.scene.add(group);

	params.scene.updateMatrixWorld(true);

	return {
		mesh: mesh,
		ringMesh: ringMesh,
		cloudMesh: cloudMesh,
		group: group
	};
}



function drawPlanets()
{
	for (var i=0; i<params.planets.length; i++){

		geo = createOrbit(params.planets[i].semi_major_axis, params.planets[i].eccentricity, THREE.Math.degToRad(params.planets[i].inclination), THREE.Math.degToRad(params.planets[i].longitude_of_ascending_node), THREE.Math.degToRad(params.planets[i].argument_of_periapsis), params.planets[i].tperi, params.planets[i].period, Ntheta = 1., thetaMin = 0, thetaMax = 0.);

		var offset = null;
		if (i == 9){ //for the Moon
			g = createOrbit(params.planets[2].semi_major_axis, params.planets[2].eccentricity, THREE.Math.degToRad(params.planets[2].inclination), THREE.Math.degToRad(params.planets[2].longitude_of_ascending_node), THREE.Math.degToRad(params.planets[2].argument_of_periapsis), params.planets[2].tperi, params.planets[2].period, Ntheta = 1., thetaMin = 0, thetaMax = 0.);
			offset = g.vertices[0]; //Earth's position
		}	


		var vals = makePlanet(geo.vertices[0], params.planets[i].tperi, params.planets[i].day, params.planets[i].radius, params.planets[i].tilt, params.planets[i].tex, params.earthRad, radScale=1., rotation=params.SSrotation, offset=offset, ringTex=params.planets[i].ringTex, nightTex=params.planets[i].nightTex, specTex=params.planets[i].specTex, bumpTex=params.planets[i].bumpTex, cloudTex=params.planets[i].cloudTex);	



		params.movingMesh[i].push(vals.mesh);
		if (vals.ringMesh != null){
			params.movingMesh[i].push(vals.ringMesh);
		}
		if (vals.cloudMesh != null){
			params.movingMesh[i].push(vals.cloudMesh);
		}
		params.movingGroup[i] = vals.group;

		params.planetPos[i].setFromMatrixPosition( params.movingMesh[i][0].matrixWorld );
	}
}

function movePlanets()
{

	for (var i=0; i<params.planets.length; i++){

		var tdiff = params.JDtoday - params.planets[i].tperi;
		var phase = (tdiff % params.planets[i].day)/params.planets[i].day;

		geo = createOrbit(params.planets[i].semi_major_axis, params.planets[i].eccentricity, THREE.Math.degToRad(params.planets[i].inclination), THREE.Math.degToRad(params.planets[i].longitude_of_ascending_node), THREE.Math.degToRad(params.planets[i].argument_of_periapsis), params.planets[i].tperi, params.planets[i].period, Ntheta = 1., thetaMin = 0, thetaMax = 0.);

		//set position
		for (var j=0; j<params.movingMesh[i].length; j++){
			params.movingMesh[i][j].position.set(geo.vertices[0].x, geo.vertices[0].y, geo.vertices[0].z);
		}

		if (i == 9){ //for the Moon
			g = createOrbit(params.planets[2].semi_major_axis, params.planets[2].eccentricity, THREE.Math.degToRad(params.planets[2].inclination), THREE.Math.degToRad(params.planets[2].longitude_of_ascending_node), THREE.Math.degToRad(params.planets[2].argument_of_periapsis), params.planets[2].tperi, params.planets[2].period, Ntheta = 1., thetaMin = 0, thetaMax = 0.);
			offset = g.vertices[0]; //Earth's position
			params.movingMesh[i][0].position.x += offset.x;
			params.movingMesh[i][0].position.y += offset.y;
			params.movingMesh[i][0].position.z += offset.z;
		}	

		//set rotation of planet
		params.movingMesh[i][0].rotation.y = (2.*phase*Math.PI) % (2.*Math.PI); 

		params.scene.updateMatrixWorld(true);
		params.planetPos[i].setFromMatrixPosition( params.movingMesh[i][0].matrixWorld );
	}


}
