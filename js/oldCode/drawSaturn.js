
function clearSaturn(){

        MovingSaturn.remove(MovingSaturnMesh);
	MovingSaturn.remove(MovingSaturnRingMesh);
        scene.remove(MovingSaturn);
}


//get position of Saturn
function createSaturnOrbit(semi, ecc, inc, lan, ap, tperi, period, Ntheta = 10.){
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

function makeSaturn( geo, tperi, day, radius, tilt, rotation = null) {

	var rotPeriodSaturn = day;
	var JDtoday = JD0 + (params.Year - 1990.);
        var tdiff = JDtoday - tperi;
        var phaseSaturn = (tdiff % rotPeriodSaturn)/rotPeriodSaturn;

	var SaturnRad = radius;
	//rescale the mesh after creating the sphere.  Otherwise, the sphere will not be drawn correctly at this small size
        var sc = params.earthRad;

        var geometry = new THREE.SphereGeometry(SaturnRad,32,32);
	var SaturnMaterial = new THREE.MeshPhongMaterial( {
                map: SaturnTex,
        } );


        var mesh = new THREE.Mesh( geometry, SaturnMaterial );
        if (rotation != null){
                mesh.rotation.x = THREE.Math.degToRad(90.+tilt); // orient map
		mesh.rotation.y = (2.*phaseSaturn*Math.PI) % (2.*Math.PI); //rotate Saturn around axis
                mesh.rotation.z = THREE.Math.degToRad(0.); 
        }
        mesh.position.set(geo[0],geo[1],geo[2]);
	mesh.scale.set(sc, sc, sc);
	MovingSaturnMesh = mesh;

	//create the rings here, then add to group below. 
	//Isn't mapping the image correctly for ring stripes. Need to fix the UVMapping? Or get a different image.
	//Or create a few rings on my own.
	var geometry = new THREE.RingGeometry(1.2*SaturnRad, 2.0*SaturnRad, 64, 5, 0, Math.PI*2.);
	var RingMaterial = new THREE.MeshBasicMaterial( {
                map: SaturnRingTex,
		side: THREE.DoubleSide,
		transparent: true,
		opacity: 0.6,
        } );
	////uvs.push( new THREE.Vector2(1.2*SaturnRad/64., 2.0*SaturnRad/5.) );

	var mesh = new THREE.Mesh( geometry, RingMaterial );
        if (rotation != null){
                mesh.rotation.x = THREE.Math.degToRad(0.+tilt); 
                mesh.rotation.y = THREE.Math.degToRad(0.); 
                mesh.rotation.z = (2.*phaseSaturn*Math.PI) % (2.*Math.PI); //this rotates rings at same rate as planet
        }
        mesh.position.set(geo[0],geo[1],geo[2]);
        mesh.scale.set(sc, sc, sc);
        MovingSaturnRingMesh = mesh;

	
	MovingSaturn = new THREE.Group(); // group Saturn mesh, then orient orbit 
	if (rotation != null){
                MovingSaturn.rotation.x = rotation.x;
                MovingSaturn.rotation.y = rotation.y;
                MovingSaturn.rotation.z = rotation.z;
        }
	MovingSaturn.add(MovingSaturnMesh);
	MovingSaturn.add(MovingSaturnRingMesh);
	scene.add(MovingSaturn);

        scene.updateMatrixWorld(true);
        params.SaturnPos.setFromMatrixPosition( MovingSaturnMesh.matrixWorld );
}


function drawSaturn()
{
	var i = 5;
	geo = createSaturnOrbit(planets[i].semi_major_axis, planets[i].eccentricity, THREE.Math.degToRad(planets[i].inclination), THREE.Math.degToRad(planets[i].longitude_of_ascending_node), THREE.Math.degToRad(planets[i].argument_of_periapsis), planets[i].tperi, planets[i].period, Ntheta = 100.);

	makeSaturn( geo, planets[i].tperi, planets[i].day, planets[i].radius, planets[i].tilt, rotation = SSrotation);	

}

function moveSaturn()
{
        var i = 5;

        var rotPeriodSaturn = planets[i].day;
        var JDtoday = JD0 + (params.Year - 1990.);
        var tdiff = JDtoday - planets[i].tperi;
        var phaseSaturn = (tdiff % rotPeriodSaturn)/rotPeriodSaturn;

        geo = createSaturnOrbit(planets[i].semi_major_axis, planets[i].eccentricity, THREE.Math.degToRad(planets[i].inclination), THREE.Math.degToRad(planets[i].longitude_of_ascending_node), THREE.Math.degToRad(planets[i].argument_of_periapsis), planets[i].tperi, planets[i].period, Ntheta = 100.);

        //set position
        MovingSaturnMesh.position.set(geo[0],geo[1],geo[2]);
	MovingSaturnRingMesh.position.set(geo[0],geo[1],geo[2]);

        //set rotation of planet
        MovingSaturnMesh.rotation.y = (2.*phaseSaturn*Math.PI) % (2.*Math.PI); //rotate Saturn around axis
	MovingSaturnRingMesh.rotation.z = (2.*phaseSaturn*Math.PI) % (2.*Math.PI); //this rotates rings at same rate as planet

        scene.updateMatrixWorld(true);
        params.SaturnPos.setFromMatrixPosition( MovingSaturnMesh.matrixWorld );

}
