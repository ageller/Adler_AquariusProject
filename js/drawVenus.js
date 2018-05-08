
function clearVenus(){

        MovingVenus.remove(MovingVenusMesh);
        scene.remove(MovingVenus);
}


//get position of Venus
function createVenusOrbit(semi, ecc, inc, lan, ap, tperi, period, Ntheta = 10.){
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

function makeVenus( geo, tperi, day, radius, tilt, rotation = null) {

	var rotPeriodVenus = day;
	var JDtoday = JD0 + (params.Year - 1990.);
        var tdiff = JDtoday - tperi;
        var phaseVenus = (tdiff % rotPeriodVenus)/rotPeriodVenus;

	var VenusRad = radius;
	//rescale the mesh after creating the sphere.  Otherwise, the sphere will not be drawn correctly at this small size
        var sc = params.earthRad;

        var geometry = new THREE.SphereGeometry(VenusRad,32,32);
	var VenusMaterial = new THREE.MeshPhongMaterial( {
                map: VenusCloudTex,
        } );


        var mesh = new THREE.Mesh( geometry, VenusMaterial );
        if (rotation != null){
                mesh.rotation.x = THREE.Math.degToRad(90.)+tilt; // orient map
		mesh.rotation.y = (2.*phaseVenus*Math.PI) % (2.*Math.PI); //rotate Venus around axis
                mesh.rotation.z = THREE.Math.degToRad(0.); 
        }
        mesh.position.set(geo[0],geo[1],geo[2]);
	mesh.scale.set(sc, sc, sc);
	MovingVenusMesh = mesh;


	MovingVenus = new THREE.Group(); // group Venus mesh, then orient orbit 
	if (rotation != null){
                MovingVenus.rotation.x = rotation.x;
                MovingVenus.rotation.y = rotation.y;
                MovingVenus.rotation.z = rotation.z;
        }
	MovingVenus.add(MovingVenusMesh);
	scene.add(MovingVenus);

	scene.updateMatrixWorld(true);
        params.VenusPos.setFromMatrixPosition( MovingVenusMesh.matrixWorld );
}


function drawVenus()
{
	var i = 1;
	geo = createVenusOrbit(planets[i].semi_major_axis, planets[i].eccentricity, THREE.Math.degToRad(planets[i].inclination), THREE.Math.degToRad(planets[i].longitude_of_ascending_node), THREE.Math.degToRad(planets[i].argument_of_periapsis), planets[i].tperi, planets[i].period, Ntheta = 100.);

	makeVenus( geo, planets[i].tperi, planets[i].day, planets[i].radius, planets[i].tilt, rotation = SSrotation);	

}
