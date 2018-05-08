
function clearMoonOrbitLines() {
	MoonOrbitLines.forEach( function( l, i ) {
		l.geometry.dispose();
		scene.remove( l );
	} );
	MoonOrbitLines = [];
}


function createMoonOrbit(semi, ecc, inc, lan, ap, tperi, period, Ntheta = 10.){
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
	var earthgeo;

        var E = 0.0;
        for (i=0; i<=Ntheta; i++) {
                E = (i*dTheta + 2.*phase*Math.PI) % (2.*Math.PI);
                pos = [];
		earthgeo = [];
                for (j=0; j<3; j++){
                        pos.push(semi * (Math.cos(E) - ecc) * P[j] + semi * Math.sqrt(1.0 - ecc * ecc) * Math.sin(E) * Q[j])
                }
               geometry.vertices.push( {"x":pos[0], "y":pos[1], "z":pos[2]} );

        }
        return geometry;
}



//make moon orbits grey
function makeMoonLine( geo , color = 'grey', rotation = null, offset = null) {

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
	MoonOrbitLines.push( mesh );



}

function drawMoonOrbitLines()
{
	var i1 = 9;
	geo = createMoonOrbit(planets[i1].semi_major_axis, planets[i1].eccentricity, THREE.Math.degToRad(planets[i1].inclination), THREE.Math.degToRad(planets[i1].longitude_of_ascending_node), THREE.Math.degToRad(planets[i1].argument_of_periapsis), planets[i1].tperi, planets[i1].period, Ntheta = 1000.);
	makeMoonLine( geo ,  color = 'grey', rotation = SSrotation, offset = params.PlanetsPos[2]); //position 2 is for Earth

}

