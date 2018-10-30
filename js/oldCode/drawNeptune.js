
function clearNeptune(){

        MovingNeptune.remove(MovingNeptuneMesh);
        scene.remove(MovingNeptune);
}


//get position of Neptune
function createNeptuneOrbit(semi, ecc, inc, lan, ap, tperi, period, Ntheta = 10.){
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

function makeNeptune( geo, tperi, day, radius, tilt, rotation = null) {

	var rotPeriodNeptune = day;
	var JDtoday = JD0 + (params.Year - 1990.);
        var tdiff = JDtoday - tperi;
        var phaseNeptune = (tdiff % rotPeriodNeptune)/rotPeriodNeptune;

	var NeptuneRad = radius;
	//rescale the mesh after creating the sphere.  Otherwise, the sphere will not be drawn correctly at this small size
        var sc = params.earthRad;

        var geometry = new THREE.SphereGeometry(NeptuneRad,32,32);
	var NeptuneMaterial = new THREE.MeshPhongMaterial( {
                map: NeptuneTex,
        } );


        var mesh = new THREE.Mesh( geometry, NeptuneMaterial );
        if (rotation != null){
                mesh.rotation.x = THREE.Math.degToRad(90.+tilt); // orient map
		mesh.rotation.y = (2.*phaseNeptune*Math.PI) % (2.*Math.PI); //rotate Neptune around axis
                mesh.rotation.z = THREE.Math.degToRad(0.); 
        }
        mesh.position.set(geo[0],geo[1],geo[2]);
	mesh.scale.set(sc, sc, sc);
	MovingNeptuneMesh = mesh;


	MovingNeptune = new THREE.Group(); // group Neptune mesh, then orient orbit 
	if (rotation != null){
                MovingNeptune.rotation.x = rotation.x;
                MovingNeptune.rotation.y = rotation.y;
                MovingNeptune.rotation.z = rotation.z;
        }
	MovingNeptune.add(MovingNeptuneMesh);
	scene.add(MovingNeptune);

        scene.updateMatrixWorld(true);
        params.NeptunePos.setFromMatrixPosition( MovingNeptuneMesh.matrixWorld );
}


function drawNeptune()
{
	var i = 7;
	geo = createNeptuneOrbit(planets[i].semi_major_axis, planets[i].eccentricity, THREE.Math.degToRad(planets[i].inclination), THREE.Math.degToRad(planets[i].longitude_of_ascending_node), THREE.Math.degToRad(planets[i].argument_of_periapsis), planets[i].tperi, planets[i].period, Ntheta = 100.);

	makeNeptune( geo, planets[i].tperi, planets[i].day, planets[i].radius, planets[i].tilt, rotation = SSrotation);	

}

function moveNeptune()
{
        var i = 7;

        var rotPeriodNeptune = planets[i].day;
        var JDtoday = JD0 + (params.Year - 1990.);
        var tdiff = JDtoday - planets[i].tperi;
        var phaseNeptune = (tdiff % rotPeriodNeptune)/rotPeriodNeptune;

        geo = createNeptuneOrbit(planets[i].semi_major_axis, planets[i].eccentricity, THREE.Math.degToRad(planets[i].inclination), THREE.Math.degToRad(planets[i].longitude_of_ascending_node), THREE.Math.degToRad(planets[i].argument_of_periapsis), planets[i].tperi, planets[i].period, Ntheta = 100.);

        //set position
        MovingNeptuneMesh.position.set(geo[0],geo[1],geo[2]);

        //set rotation of planet
        MovingNeptuneMesh.rotation.y = (2.*phaseNeptune*Math.PI) % (2.*Math.PI); //rotate Neptune around axis

        scene.updateMatrixWorld(true);
        params.NeptunePos.setFromMatrixPosition( MovingNeptuneMesh.matrixWorld );

}
