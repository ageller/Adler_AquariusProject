
function clearUranus(){

        MovingUranus.remove(MovingUranusMesh);
	MovingUranus.remove(MovingUranusRingMesh);
        scene.remove(MovingUranus);
}


//get position of Uranus
function createUranusOrbit(semi, ecc, inc, lan, ap, tperi, period, Ntheta = 10.){
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

function makeUranus( geo, tperi, day, radius, tilt, rotation = null) {

	var rotPeriodUranus = day;
	var JDtoday = JD0 + (params.Year - 1990.);
        var tdiff = JDtoday - tperi;
        var phaseUranus = (tdiff % rotPeriodUranus)/rotPeriodUranus;

	var UranusRad = radius * params.planetScale;
	//rescale the mesh after creating the sphere.  Otherwise, the sphere will not be drawn correctly at this small size
        var sc = params.earthRad;

        var geometry = new THREE.SphereGeometry(UranusRad,32,32);
	var UranusMaterial = new THREE.MeshPhongMaterial( {
                map: UranusTex,
        } );

        var mesh = new THREE.Mesh( geometry, UranusMaterial );
        if (rotation != null){
                mesh.rotation.x = THREE.Math.degToRad(90.+tilt); // orient map and tilt
		mesh.rotation.y = (2.*phaseUranus*Math.PI) % (2.*Math.PI); //rotate Uranus around axis
                mesh.rotation.z = THREE.Math.degToRad(0.); 
        }
        mesh.position.set(geo[0],geo[1],geo[2]);
	mesh.scale.set(sc, sc, sc);
	MovingUranusMesh = mesh;

	//create the rings here, then add to group below.
        var geometry = new THREE.RingGeometry(1.2*UranusRad, 2.0*UranusRad, 64, 5, 0, Math.PI*2.);
        var RingMaterial = new THREE.MeshBasicMaterial( {
                map: UranusRingTex,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.6,
        } );

        var mesh = new THREE.Mesh( geometry, RingMaterial );
        if (rotation != null){
                mesh.rotation.x = THREE.Math.degToRad(0.+tilt);
                mesh.rotation.y = THREE.Math.degToRad(0.);
                mesh.rotation.z = (2.*phaseUranus*Math.PI) % (2.*Math.PI); //this rotates rings at same rate as planet
        }
        mesh.position.set(geo[0],geo[1],geo[2]);
        mesh.scale.set(sc, sc, sc);
        MovingUranusRingMesh = mesh;

	MovingUranus = new THREE.Group(); // group Uranus mesh, then orient orbit 
	if (rotation != null){
                MovingUranus.rotation.x = rotation.x;
                MovingUranus.rotation.y = rotation.y;
                MovingUranus.rotation.z = rotation.z;
        }
	MovingUranus.add(MovingUranusMesh);
	MovingUranus.add(MovingUranusRingMesh);
	scene.add(MovingUranus);

        scene.updateMatrixWorld(true);
        params.UranusPos.setFromMatrixPosition( MovingUranusMesh.matrixWorld );
}


function drawUranus()
{
	var i = 6;
	geo = createUranusOrbit(planets[i].semi_major_axis, planets[i].eccentricity, THREE.Math.degToRad(planets[i].inclination), THREE.Math.degToRad(planets[i].longitude_of_ascending_node), THREE.Math.degToRad(planets[i].argument_of_periapsis), planets[i].tperi, planets[i].period, Ntheta = 100.);

	makeUranus( geo, planets[i].tperi, planets[i].day, planets[i].radius, planets[i].tilt, rotation = SSrotation);	

}

function moveUranus()
{
        var i = 6;

        var rotPeriodUranus = planets[i].day;
        var JDtoday = JD0 + (params.Year - 1990.);
        var tdiff = JDtoday - planets[i].tperi;
        var phaseUranus = (tdiff % rotPeriodUranus)/rotPeriodUranus;

        geo = createUranusOrbit(planets[i].semi_major_axis, planets[i].eccentricity, THREE.Math.degToRad(planets[i].inclination), THREE.Math.degToRad(planets[i].longitude_of_ascending_node), THREE.Math.degToRad(planets[i].argument_of_periapsis), planets[i].tperi, planets[i].period, Ntheta = 100.);

        //set position
        MovingUranusMesh.position.set(geo[0],geo[1],geo[2]);
        MovingUranusRingMesh.position.set(geo[0],geo[1],geo[2]);

        //set rotation of planet
        MovingUranusMesh.rotation.y = (2.*phaseUranus*Math.PI) % (2.*Math.PI); //rotate Uranus around axis
        MovingUranusRingMesh.rotation.z = (2.*phaseUranus*Math.PI) % (2.*Math.PI); //this rotates rings at same rate as planet

        scene.updateMatrixWorld(true);
        params.UranusPos.setFromMatrixPosition( MovingUranusMesh.matrixWorld );

}
