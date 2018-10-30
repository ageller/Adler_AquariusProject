
function clearPlanetOrbitLines() {
	orbitLines.forEach( function( l, i ) {
		l.geometry.dispose();
		scene.remove( l );
	} );
	orbitLines = [];
}


function createOrbit(semi, ecc, inc, lan, ap, tperi, period, Ntheta = 10.){
//in this calculation the orbit line will start at peri
//but I'd like to move that so that it starts at roughly the correct spot for the given planet at the given time
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
	for (i=0; i<=Ntheta; i++) {
		E = (i*dTheta + 2.*phase*Math.PI) % (2.*Math.PI);
		pos = []
		for (j=0; j<3; j++){
			pos.push(semi * (Math.cos(E) - ecc) * P[j] + semi * Math.sqrt(1.0 - ecc * ecc) * Math.sin(E) * Q[j])
		}
		geometry.vertices.push( {"x":pos[0], "y":pos[1], "z":pos[2]} );

	}

	return geometry;
}


function makePlanetLine( geo , color = 'white', rotation = null, offset = null) {

	var g = new MeshLine();
	g.setGeometry( geo, function( p ) { return Math.pow(p, params.SSlineTaper ) ; });
	var material = new MeshLineMaterial({
		color: new THREE.Color(color),
		opacity: params.useSSalpha,
		//useAlphaMap: 1,
		//alphaMap: aTex,
		lineWidth: params.SSlineWidth,
		sizeAttenuation: 0,
		depthWrite: true,
		depthTest: true,
		transparent: true,

	}); 
	
	var mesh = new THREE.Mesh( g.geometry, material );
	mesh.geometry.dynamic = true;
	if (rotation != null){
		mesh.rotation.x = rotation.x;
		mesh.rotation.y = rotation.y;
		mesh.rotation.z = rotation.z;
	}
	if (offset != null){
		mesh.position.x += offset.x;
		mesh.position.y += offset.y;
		mesh.position.z += offset.z;
	}
	scene.add( mesh );
	orbitLines.push( mesh );



}

function makeAsteroidLine( geo , color = 'white', rotation = null) {

	var g = new MeshLine();
	g.setGeometry(geo)
	var material = new MeshLineMaterial({
		color: new THREE.Color(color),
		opacity: params.useASTalpha,
		//useAlphaMap: 1,
		//alphaMap: aTex,
		lineWidth: params.ASTlineWidth,
		sizeAttenuation: 0,
		depthWrite: true,
		depthTest: true,
		transparent: true,

	}); 
	
	var mesh = new THREE.Mesh( g.geometry, material );
	mesh.geometry.dynamic = true;
	if (rotation != null){
		mesh.rotation.x = rotation.x;
		mesh.rotation.y = rotation.y;
		mesh.rotation.z = rotation.z;
	}
	scene.add( mesh );


}
function drawPlanetOrbitLines()
{
	// line
	for (var i=0; i<params.planets.length; i++){
		geo = createOrbit(params.planets[i].semi_major_axis, params.planets[i].eccentricity, THREE.Math.degToRad(params.planets[i].inclination), THREE.Math.degToRad(params.planets[i].longitude_of_ascending_node), THREE.Math.degToRad(params.planets[i].argument_of_periapsis), params.planets[i].tperi, params.planets[i].period, Ntheta = 1000.);

		var offset = null;
		if (i == 9){ //for the Moon
			offset = params.planetPos[2];
		}

		makePlanetLine( geo ,  color = pcolors[params.planets[i].name], rotation = SSrotation, offset = offset);		
	}

}

function drawAsteroidOrbitLines()
{
	// line
	ak = Object.keys(params.asteroids); //a bit of a silly way to do this, could probably find a way to remake the file in the same format as params.planets.json
	for (var j=0; j<ak.length; j++){
		i = ak[j];
		geo = createOrbit(params.asteroids[i].semi_major_axis, params.asteroids[i].eccentricity, THREE.Math.degToRad(params.asteroids[i].inclination), THREE.Math.degToRad(params.asteroids[i].longitude_of_ascending_node), THREE.Math.degToRad(params.asteroids[i].argument_of_periapsis), params.asteroids[i].tperi, params.asteroids[i].period, Ntheta = 100.);
		makeAsteroidLine( geo ,  color = 'green', rotation = SSrotation);		
	}

}

function drawAquariusOrbitLine()
{
	// line
	geo = createOrbit(params.aquarius.semi_major_axis, params.aquarius.eccentricity, THREE.Math.degToRad(params.aquarius.inclination), THREE.Math.degToRad(params.aquarius.longitude_of_ascending_node), THREE.Math.degToRad(params.aquarius.argument_of_periapsis), params.aquarius.tperi, params.aquarius.period, Ntheta = 1000.);
	makePlanetLine( geo ,  color = 'white', rotation = SSrotation);		

}
