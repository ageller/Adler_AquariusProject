
function clearEarth(){

        MovingEarthCloud.remove(MovingEarthMesh);
        MovingEarthCloud.remove(MovingCloudMesh);
	MovingEarthCloud.remove(MovingMoonMesh);
        scene.remove(MovingEarthCloud);
}


//get position of Earth
function createEarthOrbit(semi, ecc, inc, lan, ap, tperi, period, Ntheta = 10.){
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

function makeEarth( geo, tperi, day, radius, tilt, rotation = null) {

	var rotPeriodEarth = day;
	var rotPeriodCloud = rotPeriodEarth/1.3;
	var JDtoday = JD0 + (params.Year - 1990.);
        var tdiff = JDtoday - tperi - 0.0012; //fiddle to change initial position of Earth texture
        var phaseEarth = (tdiff % rotPeriodEarth)/rotPeriodEarth;
	var phaseCloud = (tdiff % rotPeriodCloud)/rotPeriodCloud;
	var rotPeriodMoon = planets[9].period;
	var phaseMoon = (tdiff % rotPeriodMoon)/rotPeriodMoon;

	var EarthRad = radius;
	var CloudRad = radius * params.cloudRad/params.earthRad;
	var MoonRad = planets[9].radius;
        //rescale the mesh after creating the sphere.  Otherwise, the sphere will not be drawn correctly at this small size
        var sc = params.earthRad;
	
        var geometry = new THREE.SphereGeometry(EarthRad,32,32);
	var EarthMaterial = new THREE.MeshPhongMaterial( {
                map: EarthTex,
		bumpMap: EarthBump,
                bumpScale: 0.1,
                specularMap: EarthSpec,
                specular: new THREE.Color( "gray" ),
		shininess: 5,
        } );

        var mesh = new THREE.Mesh( geometry, EarthMaterial );
        ////mesh.geometry.dynamic = true;
        if (rotation != null){
                mesh.rotation.x = THREE.Math.degToRad(90.+tilt); // orient map and tilt Earth
		mesh.rotation.y = (2.*phaseEarth*Math.PI) % (2.*Math.PI); //rotate Earth around axis
                mesh.rotation.z = THREE.Math.degToRad(0.); 
        }
        mesh.position.set(geo[0],geo[1],geo[2]);
	mesh.scale.set(sc, sc, sc);
	MovingEarthMesh = mesh;

	//MovingEarthMesh.add( new THREE.AxisHelper( 10 ) ); // to show the local coordinate system

	//make cloud layer
	var geometry = new THREE.SphereGeometry( CloudRad, 32, 32)
        var CloudMaterial = new THREE.MeshPhongMaterial( {
                map: CloudTex,
                transparent: true,
        } );

        var mesh = new THREE.Mesh( geometry, CloudMaterial );
	if (rotation != null){
        	mesh.rotation.x = THREE.Math.degToRad(90.+tilt); // orient map and tilt Cloud
                //mesh.rotation.y = 0.0;
		mesh.rotation.y = (2.*phaseCloud*Math.PI) % (2.*Math.PI); //rotate Cloud around axis
                mesh.rotation.z = THREE.Math.degToRad(0.);
	}
        mesh.position.set(geo[0],geo[1],geo[2]);
	mesh.scale.set(sc, sc, sc);

	MovingCloudMesh = mesh;


	//Add in the moon mesh
	var i = 9;
	moongeo = createEarthOrbit(planets[i].semi_major_axis, planets[i].eccentricity, THREE.Math.degToRad(planets[i].inclination), THREE.Math.degToRad(planets[i].longitude_of_ascending_node), THREE.Math.degToRad(planets[i].argument_of_periapsis), planets[i].tperi, planets[i].period, Ntheta = 100.);		
	var geometry = new THREE.SphereGeometry( MoonRad, 32, 32)
        var MoonMaterial = new THREE.MeshPhongMaterial( {
                map: MoonTex,
        } );

        var mesh = new THREE.Mesh( geometry, MoonMaterial );
        if (rotation != null){
                mesh.rotation.x = THREE.Math.degToRad(90.+planets[9].tilt); // orient Moon
                mesh.rotation.y = ((2.*phaseMoon*Math.PI) % (2.*Math.PI))+Math.PI; // try for tidal locking, correct side always facing Earth
		//mesh.rotation.y = 0.
                mesh.rotation.z = THREE.Math.degToRad(0.);
        }
        mesh.position.set(geo[0]+moongeo[0],geo[1]+moongeo[1],geo[2]+moongeo[2]);
        mesh.scale.set(sc, sc, sc);

        MovingMoonMesh = mesh;


	MovingEarthCloud = new THREE.Group(); // group Earth and Cloud meshes, then orient orbit 
	if (rotation != null){
                MovingEarthCloud.rotation.x = rotation.x;
                MovingEarthCloud.rotation.y = rotation.y;
                MovingEarthCloud.rotation.z = rotation.z;
        }
	MovingEarthCloud.add(MovingEarthMesh);
	MovingEarthCloud.add(MovingCloudMesh);
	MovingEarthCloud.add(MovingMoonMesh);
	scene.add(MovingEarthCloud);

	//MovingEarthCloud.add( new THREE.AxisHelper( 10 ) ); // to show the local coordinate system

        scene.updateMatrixWorld(true);
        params.EarthPos.setFromMatrixPosition( MovingEarthMesh.matrixWorld );
        params.MoonPos.setFromMatrixPosition( MovingMoonMesh.matrixWorld );

}


function drawEarth()
{
	var i = 2;
	geo = createEarthOrbit(planets[i].semi_major_axis, planets[i].eccentricity, THREE.Math.degToRad(planets[i].inclination), THREE.Math.degToRad(planets[i].longitude_of_ascending_node), THREE.Math.degToRad(planets[i].argument_of_periapsis), planets[i].tperi, planets[i].period, Ntheta = 100.);

	makeEarth( geo, planets[i].tperi, planets[i].day, planets[i].radius, planets[i].tilt, rotation = SSrotation);	

}