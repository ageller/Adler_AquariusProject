
function clearMercury(){

	MovingMercury.remove(MovingMercuryMesh);
	scene.remove(MovingMercury);
}


//get position of Mercury
function createMercuryOrbit(semi, ecc, inc, lan, ap, tperi, period, Ntheta = 10.){
	var JDtoday = JD0 + (params.Year - 1990.);
	var tdiff = JDtoday - tperi;
	var phase = (tdiff % period)/period;
	
	var i,j;
	var b = [-1.*inc, lan, ap];
	var c = [];
	var s = [];
	for (i=0; i<3; i++){
		c.push(Math.cos(b[i]));
		s.push(Math.sin(b[i]));
	}       
	semi = semi;
	var P = [];
	P.push(-1.*c[2]*c[1] + s[2]*c[0]*s[1]);
	P.push(-1.*c[2]*s[1] - s[2]*c[0]*c[1]);
	P.push(-1.*s[2]*s[0]); 
	var Q = [];
	Q.push(s[2]*c[1] + c[2]*c[0]*s[1]);
	Q.push(s[2]*s[1] - c[2]*c[0]*c[1]);
	Q.push(-1.*s[0]*c[2]);
	
	var dTheta = 2.*Math.PI / Ntheta;
	
	var geometry = new THREE.Geometry();
	var pos;
	
	var E = 0.0;
	i=0;
	E = (i*dTheta + 2.*phase*Math.PI) % (2.*Math.PI);
	pos = []
	for (j=0; j<3; j++){
		pos.push(semi * (Math.cos(E) - ecc) * P[j] + semi * Math.sqrt(1.0 - ecc * ecc) * Math.sin(E) * Q[j])                
	}       
	return pos;
}

function makeMercury( geo, tperi, day, radius, tilt, rotation = null) {

	var rotPeriodMercury = day;
	var JDtoday = JD0 + (params.Year - 1990.);
	var tdiff = JDtoday - tperi;
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
	mesh.position.set(geo[0],geo[1],geo[2]);
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
	geo = createMercuryOrbit(planets[i].semi_major_axis, planets[i].eccentricity, THREE.Math.degToRad(planets[i].inclination), THREE.Math.degToRad(planets[i].longitude_of_ascending_node), THREE.Math.degToRad(planets[i].argument_of_periapsis), planets[i].tperi, planets[i].period, Ntheta = 100.);

	makeMercury( geo, planets[i].tperi, planets[i].day, planets[i].radius, planets[i].tilt, rotation = SSrotation);	

}

function moveMercury()
{
	var i = 0;
	geo = createMercuryOrbit(planets[i].semi_major_axis, planets[i].eccentricity, THREE.Math.degToRad(planets[i].inclination), THREE.Math.degToRad(planets[i].longitude_of_ascending_node), THREE.Math.degToRad(planets[i].argument_of_periapsis), planets[i].tperi, planets[i].period, Ntheta = 100.);
	MovingMercuryMesh.position.set(geo[0],geo[1],geo[2]);
	params.MercuryPos.setFromMatrixPosition( MovingMercuryMesh.matrixWorld );

}
