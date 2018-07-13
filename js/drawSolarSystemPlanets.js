
function clearPlanetOrbitLines() {
	orbitLines.forEach( function( l, i ) {
		l.geometry.dispose();
		scene.remove( l );
	} );
	orbitLines = [];
}



function createOrbit(semi, ecc, inc, lan, ap, tperi, period, Ntheta = 10., thetaMin = 0, thetaMax = 2.*Math.PI){
//in this calculation the orbit line will start at peri
//but I'd like to move that so that it starts at roughly the correct spot for the given planet at the given time
	var tdiff = params.JDtoday - tperi;
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
	
	var dTheta = (thetaMax - thetaMin) / Ntheta + thetaMin;

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


function makePlanetLine( geo , color = 'white', rotation = null, addToOrbitLines = true, p0 = 0.) {

	var g = new MeshLine();
	g.setGeometry( geo, function( p ) { return Math.pow((p + p0) % 1, params.SSlineTaper ) ; });
	var material = new MeshLineMaterial({
		color: new THREE.Color(color),
		opacity: params.useSSalpha,
		//useAlphaMap: 1,
		//alphaMap: aTex,
		lineWidth: params.SSlineWidth,
		sizeAttenuation: 0,
		// depthWrite: false,
		// depthTest: false,
		//transparent: false,
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
	if (addToOrbitLines){
		orbitLines.push( mesh );
	}

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
	for (var i=0; i<9; i++){
		geo = createOrbit(planets[i].semi_major_axis, planets[i].eccentricity, THREE.Math.degToRad(planets[i].inclination), THREE.Math.degToRad(planets[i].longitude_of_ascending_node), THREE.Math.degToRad(planets[i].argument_of_periapsis), planets[i].tperi, planets[i].period*params.daytoyr, Ntheta = 1000.);
		makePlanetLine( geo ,  color = pcolors[planets[i].name], rotation = SSrotation);		
	}

}

function drawAsteroidOrbitLines()
{
	// line
	ak = Object.keys(asteroids); //a bit of a silly way to do this, could probably find a way to remake the file in the same format as planets.json
	for (var j=0; j<ak.length; j++){
		i = ak[j];
		geo = createOrbit(asteroids[i].semi_major_axis, asteroids[i].eccentricity, THREE.Math.degToRad(asteroids[i].inclination), THREE.Math.degToRad(asteroids[i].longitude_of_ascending_node), THREE.Math.degToRad(asteroids[i].argument_of_periapsis), asteroids[i].tperi, asteroids[i].period*params.daytoyr, Ntheta = 100.);
		makeAsteroidLine( geo ,  color = 'green', rotation = SSrotation);		
	}

}



function drawAquariusOrbitLine()
{
	if (params.drawAquariusOrbit){
		// line
		// geo = createOrbit(aquarius.semi_major_axis, aquarius.eccentricity, THREE.Math.degToRad(aquarius.inclination), THREE.Math.degToRad(aquarius.longitude_of_ascending_node), THREE.Math.degToRad(aquarius.argument_of_periapsis), aquarius.tperi, aquarius.period, Ntheta = 1000., thethaMin = 0., thetaMax = params.AquariusThetaMax);
		geo = getAquariusOrbitH();
		var i0 = aquarius.indexInterp.evaluate(params.JDtoday);
		var p0 = i0/Object.keys(aquarius.x).length;
		makePlanetLine( params.AquariusOrbitGeometry , color = 'white', rotation = SSrotation, addToOrbitLines = true, p0 = 0.)

	}

}
