
function clearSaturn(){

        MovingSaturn.remove(MovingSaturnMesh);
	MovingSaturn.remove(MovingSaturnRingMesh);
        scene.remove(MovingSaturn);
}



function makeSaturn( geo, tperi, day, radius, tilt, rotation = null) {

	var rotPeriodSaturn = day;
        var tdiff = params.JDtoday - tperi;
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
        mesh.position.set(geo.x,geo.y,geo.z);
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
        mesh.position.set(geo.x,geo.y,geo.z);
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
	geo = createOrbit(planets[i].semi_major_axis, planets[i].eccentricity, THREE.Math.degToRad(planets[i].inclination), THREE.Math.degToRad(planets[i].longitude_of_ascending_node), THREE.Math.degToRad(planets[i].argument_of_periapsis), planets[i].tperi, planets[i].period*params.daytoyr, Ntheta = 1., thetaMin = 0, thetaMax = 0.);

	makeSaturn( geo.vertices[0], planets[i].tperi, planets[i].day, planets[i].radius, planets[i].tilt, rotation = SSrotation);	

}

function moveSaturn()
{
        var i = 5;

        var rotPeriodSaturn = planets[i].day;
        var tdiff = params.JDtoday - planets[i].tperi;
        var phaseSaturn = (tdiff % rotPeriodSaturn)/rotPeriodSaturn;

        geo = createOrbit(planets[i].semi_major_axis, planets[i].eccentricity, THREE.Math.degToRad(planets[i].inclination), THREE.Math.degToRad(planets[i].longitude_of_ascending_node), THREE.Math.degToRad(planets[i].argument_of_periapsis), planets[i].tperi, planets[i].period*params.daytoyr, Ntheta = 1., thetaMin = 0, thetaMax = 0.);

        //set position
        MovingSaturnMesh.position.set(geo.vertices[0].x, geo.vertices[0].y, geo.vertices[0].z);
	MovingSaturnRingMesh.position.set(geo.vertices[0].x, geo.vertices[0].y, geo.vertices[0].z);

        //set rotation of planet
        MovingSaturnMesh.rotation.y = (2.*phaseSaturn*Math.PI) % (2.*Math.PI); //rotate Saturn around axis
	MovingSaturnRingMesh.rotation.z = (2.*phaseSaturn*Math.PI) % (2.*Math.PI); //this rotates rings at same rate as planet

        scene.updateMatrixWorld(true);
        params.SaturnPos.setFromMatrixPosition( MovingSaturnMesh.matrixWorld );

}
