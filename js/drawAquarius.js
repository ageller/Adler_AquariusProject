
function clearAquarius(){

	params.aquariusGroup.remove(params.aquariusMesh);
	params.scene.remove(params.aquariusGroup);
}



function makeAquarius( geo, tperi, day, radius, rotation = null) {

	var rotPeriodAquarius = day;
	var JDtoday = params.JD0 + (params.Year - 1990.);
	var tdiff = JDtoday - tperi;
	var phaseAquarius = (tdiff % rotPeriodAquarius)/rotPeriodAquarius;

	var sc = radius*params.earthRad/20.; //factor of 20 to account for actual size of the model?

	params.aquariusMesh.position.set(geo.x,geo.y,geo.z);
	params.aquariusMesh.scale.set(sc, sc, sc);

	params.aquariusGroup = new THREE.Group(); // group Aquarius mesh, then orient orbit 
	if (rotation != null){
		params.aquariusGroup.rotation.x = rotation.x;
		params.aquariusGroup.rotation.y = rotation.y;
		params.aquariusGroup.rotation.z = rotation.z;
	}
	params.aquariusGroup.add(params.aquariusMesh);
	params.scene.add(params.aquariusGroup);

	params.scene.updateMatrixWorld(true);
	params.planetPos[10].setFromMatrixPosition( params.aquariusMesh.matrixWorld );

}



function drawAquarius()
{

	geo = createOrbit(params.aquarius.semi_major_axis, params.aquarius.eccentricity, THREE.Math.degToRad(params.aquarius.inclination), THREE.Math.degToRad(params.aquarius.longitude_of_ascending_node), THREE.Math.degToRad(params.aquarius.argument_of_periapsis), params.aquarius.tperi, params.aquarius.period, Ntheta = 1., thetaMin = 0, thetaMax = 0.);

	//rotate meteorid slightly, and make size approximately 2m in radius, given in Earth radii
	makeAquarius( geo.vertices[0], params.aquarius.tperi, 0.0001, params.aquariusRad, rotation = params.SSrotation);	

}

function moveAquarius()
{
	var rotPeriodAquarius = 0.0001;
	var JDtoday = params.JD0 + (params.Year - 1990.);
	var tdiff = JDtoday - params.aquarius.argument_of_periapsis;
	var phaseAquarius = (tdiff % rotPeriodAquarius)/rotPeriodAquarius;
	
	geo = createOrbit(params.aquarius.semi_major_axis, params.aquarius.eccentricity, THREE.Math.degToRad(params.aquarius.inclination), THREE.Math.degToRad(params.aquarius.longitude_of_ascending_node), THREE.Math.degToRad(params.aquarius.argument_of_periapsis), params.aquarius.tperi, params.aquarius.period, Ntheta = 1., thetaMin = 0, thetaMax = 0.);

	//set position
	params.aquariusMesh.position.set(geo.vertices[0].x,geo.vertices[0].y,geo.vertices[0].z);

	//should we move aquarius toward Earth
	if (params.Year > params.collisionYear0){
		//for Earth's position (not the same as params.planetPos because of rotation applied to mesh?)
		geoE = createOrbit(params.planets[2].semi_major_axis, params.planets[2].eccentricity, THREE.Math.degToRad(params.planets[2].inclination), THREE.Math.degToRad(params.planets[2].longitude_of_ascending_node), THREE.Math.degToRad(params.planets[2].argument_of_periapsis), params.planets[2].tperi, params.planets[2].period, Ntheta = 1., thetaMin = 0, thetaMax = 0.);

		//var offset = new THREE.Vector3(params.earthRad/Math.sqrt(3), params.earthRad/Math.sqrt(3), params.earthRad/Math.sqrt(3))
		//var offset  = new THREE.Vector3(0.000014,-0.00004,params.earthRad/Math.sqrt(3)) //closer
		var offset  = new THREE.Vector3(0.000018,-0.0000345,0.0000175)

		//like mix in glsl, but I need to have the correct offset from Earth relative to the Aquarius orbit
		var a = (params.Year - params.collisionYear0)/(params.collisionYear - params.collisionYear0)
		var x = geo.vertices[0].x*(1. - a) + (geoE.vertices[0].x + offset.x)*a; 
		var y = geo.vertices[0].y*(1. - a) + (geoE.vertices[0].y + offset.y)*a; 
		var z = geo.vertices[0].z*(1. - a) + (geoE.vertices[0].z + offset.z)*a; 
		//console.log(a, offset, x,y,z)
		params.aquariusMesh.position.set(x,y,z);

	}

	//set rotation of meteoriod
	params.aquariusMesh.rotation.y = (2.*phaseAquarius*Math.PI) % (2.*Math.PI); //rotate meteoroid around axis

	params.scene.updateMatrixWorld(true);
	params.planetPos[10].setFromMatrixPosition( params.aquariusMesh.matrixWorld );
}
