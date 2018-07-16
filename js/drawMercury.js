
function clearMercury(){

	MovingMercury.remove(MovingMercuryMesh);
	scene.remove(MovingMercury);
}


function makeMercury( geo, tperi, day, radius, tilt, rotation = null) {

	var rotPeriodMercury = day/1000.;
	var tdiff = params.JDtoday - tperi;
	var phaseMercury = (tdiff % rotPeriodMercury)/rotPeriodMercury;

	var MercuryRad = radius;
	//rescale the mesh after creating the sphere.  Otherwise, the sphere will not be drawn correctly at this small size
	var sc = params.earthRad;

	var geometry = new THREE.SphereGeometry(MercuryRad,32,32);
	var MercuryMaterial = new THREE.MeshPhongMaterial( {
		map: MercuryTex,
	} );

	var mesh = new THREE.Mesh( geometry, MercuryMaterial );
	if (rotation != null){
		mesh.rotation.x = THREE.Math.degToRad(90.+tilt); // orient map
		mesh.rotation.y = (2.*phaseMercury*Math.PI) % (2.*Math.PI); //rotate Mercury around axis
		mesh.rotation.z = THREE.Math.degToRad(0.); 
	}
	mesh.position.set(geo.x,geo.y,geo.z);
	mesh.scale.set(sc, sc, sc);
	MovingMercuryMesh = mesh;

	MovingMercury = new THREE.Group(); // group Mercury mesh, then orient orbit 
	if (rotation != null){
		MovingMercury.rotation.x = rotation.x;
		MovingMercury.rotation.y = rotation.y;
		MovingMercury.rotation.z = rotation.z;
	}
	MovingMercury.add(MovingMercuryMesh);
	scene.add(MovingMercury);

	scene.updateMatrixWorld(true);
	params.MercuryPos.setFromMatrixPosition( MovingMercuryMesh.matrixWorld );
}


function drawMercury()
{
	var i = 0;
	geo = createOrbit(planets[i].semi_major_axis, planets[i].eccentricity, THREE.Math.degToRad(planets[i].inclination), THREE.Math.degToRad(planets[i].longitude_of_ascending_node), THREE.Math.degToRad(planets[i].argument_of_periapsis), planets[i].tperi, planets[i].period*params.daytoyr, Ntheta = 1., thetaMin = 0, thetaMax = 0.);

	makeMercury( geo.vertices[0], planets[i].tperi, planets[i].day, planets[i].radius, planets[i].tilt, rotation = SSrotation);	

}

function moveMercury()
{
	var i = 0;

	var rotPeriodMercury = planets[i].day;
	var tdiff = params.JDtoday - planets[i].tperi;
	var phaseMercury = (tdiff % rotPeriodMercury)/rotPeriodMercury;

	geo = createOrbit(planets[i].semi_major_axis, planets[i].eccentricity, THREE.Math.degToRad(planets[i].inclination), THREE.Math.degToRad(planets[i].longitude_of_ascending_node), THREE.Math.degToRad(planets[i].argument_of_periapsis), planets[i].tperi, planets[i].period*params.daytoyr, Ntheta = 1., thetaMin = 0, thetaMax = 0.);
	
	//set position
	MovingMercuryMesh.position.set(geo.vertices[0].x, geo.vertices[0].y, geo.vertices[0].z);

	//set rotation of planet
	MovingMercuryMesh.rotation.y = (2.*phaseMercury*Math.PI) % (2.*Math.PI); //rotate Mercury around axis

	scene.updateMatrixWorld(true);
	params.MercuryPos.setFromMatrixPosition( MovingMercuryMesh.matrixWorld );

}
