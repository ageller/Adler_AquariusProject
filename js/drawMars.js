
function clearMars(){

        MovingMars.remove(MovingMarsMesh);
        scene.remove(MovingMars);
}


//get position of Mars
function createMarsOrbit(semi, ecc, inc, lan, ap, tperi, period, Ntheta = 10.){
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

function makeMars( geo, tperi, day, radius, tilt, rotation = null) {

	var rotPeriodMars = day;
	var JDtoday = JD0 + (params.Year - 1990.);
        var tdiff = JDtoday - tperi;
        var phaseMars = (tdiff % rotPeriodMars)/rotPeriodMars;

	var MarsRad = radius;
	//rescale the mesh after creating the sphere.  Otherwise, the sphere will not be drawn correctly at this small size
        var sc = params.earthRad;

        var geometry = new THREE.SphereGeometry(MarsRad,32,32);
	var MarsMaterial = new THREE.MeshPhongMaterial( {
                map: MarsTex,
        } );


        var mesh = new THREE.Mesh( geometry, MarsMaterial );
        if (rotation != null){
                mesh.rotation.x = THREE.Math.degToRad(90.)+tilt; // orient map
		mesh.rotation.y = (2.*phaseMars*Math.PI) % (2.*Math.PI); //rotate Mars around axis
                mesh.rotation.z = THREE.Math.degToRad(0.); 
        }
        mesh.position.set(geo[0],geo[1],geo[2]);
	mesh.scale.set(sc, sc, sc);
	MovingMarsMesh = mesh;


	MovingMars = new THREE.Group(); // group Mars mesh, then orient orbit 
	if (rotation != null){
                MovingMars.rotation.x = rotation.x;
                MovingMars.rotation.y = rotation.y;
                MovingMars.rotation.z = rotation.z;
        }
	MovingMars.add(MovingMarsMesh);
	scene.add(MovingMars);

        scene.updateMatrixWorld(true);
        params.MarsPos.setFromMatrixPosition( MovingMarsMesh.matrixWorld );
}


function drawMars()
{
	var i = 3;
	geo = createMarsOrbit(planets[i].semi_major_axis, planets[i].eccentricity, THREE.Math.degToRad(planets[i].inclination), THREE.Math.degToRad(planets[i].longitude_of_ascending_node), THREE.Math.degToRad(planets[i].argument_of_periapsis), planets[i].tperi, planets[i].period, Ntheta = 100.);

	makeMars( geo, planets[i].tperi, planets[i].day, planets[i].radius, planets[i].tilt, rotation = SSrotation);	

}
