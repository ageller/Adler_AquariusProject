
function clearAquarius(){

        MovingAquarius.remove(MovingAquariusMesh);
        scene.remove(MovingAquarius);
}


//get position of Aquarius
function createAquariusOrbit(semi, ecc, inc, lan, ap, tperi, period, Ntheta = 10.){
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

function makeAquarius( geo, tperi, day, radius, rotation = null) {

	var rotPeriodAquarius = day;
	var JDtoday = JD0 + (params.Year - 1990.);
        var tdiff = JDtoday - tperi;
        var phaseAquarius = (tdiff % rotPeriodAquarius)/rotPeriodAquarius;

	//make slightly bigger so can actually see it
	var AquariusRad = radius*10000.;
	//rescale the mesh after creating the sphere.  Otherwise, the sphere will not be drawn correctly at this small size
        var sc = params.earthRad;

        var geometry = new THREE.SphereGeometry(AquariusRad,32,32);
	var AquariusMaterial = new THREE.MeshPhongMaterial( {
                map: AquariusTex,
        } );

        var mesh = new THREE.Mesh( geometry, AquariusMaterial );
        if (rotation != null){
                mesh.rotation.x = THREE.Math.degToRad(90.); // orient map
		mesh.rotation.y = (2.*phaseAquarius*Math.PI) % (2.*Math.PI); //rotate Aquarius around axis
                mesh.rotation.z = THREE.Math.degToRad(0.); 
        }
        mesh.position.set(geo[0],geo[1],geo[2]);
	mesh.scale.set(sc, sc, sc);
	MovingAquariusMesh = mesh;


	MovingAquarius = new THREE.Group(); // group Aquarius mesh, then orient orbit 
	if (rotation != null){
                MovingAquarius.rotation.x = rotation.x;
                MovingAquarius.rotation.y = rotation.y;
                MovingAquarius.rotation.z = rotation.z;
        }
	MovingAquarius.add(MovingAquariusMesh);
	scene.add(MovingAquarius);

}


function drawAquarius()
{
	geo = createAquariusOrbit(aquarius.semi_major_axis, aquarius.eccentricity, THREE.Math.degToRad(aquarius.inclination), THREE.Math.degToRad(aquarius.longitude_of_ascending_node), THREE.Math.degToRad(aquarius.argument_of_periapsis), aquarius.tperi, aquarius.period, Ntheta = 100.);

	//make meteroid rotate a bit, and make size approximately 2m in radius, given in Earth radii
	makeAquarius( geo, aquarius.tperi, 0.0001, 0.0000003, rotation = SSrotation);	

}
