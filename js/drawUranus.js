
function clearUranus(){

        MovingUranus.remove(MovingUranusMesh);
	MovingUranus.remove(MovingUranusRingMesh);
        scene.remove(MovingUranus);
}



function makeUranus( geo, tperi, day, radius, tilt, rotation = null) {

	var rotPeriodUranus = day;
        var tdiff = params.JDtoday - tperi;
        var phaseUranus = (tdiff % rotPeriodUranus)/rotPeriodUranus;

	var UranusRad = radius;
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
        mesh.position.set(geo.x,geo.y,geo.z);
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
        mesh.position.set(geo.x,geo.y,geo.z);
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
	geo = createOrbit(planets[i].semi_major_axis, planets[i].eccentricity, THREE.Math.degToRad(planets[i].inclination), THREE.Math.degToRad(planets[i].longitude_of_ascending_node), THREE.Math.degToRad(planets[i].argument_of_periapsis), planets[i].tperi, planets[i].period*params.daytoyr, Ntheta = 1., thetaMin = 0, thetaMax = 0.);

	makeUranus( geo.vertices[0], planets[i].tperi, planets[i].day, planets[i].radius, planets[i].tilt, rotation = SSrotation);	

}

function moveUranus()
{
        var i = 6;

        var rotPeriodUranus = planets[i].day;
        var tdiff = params.JDtoday - planets[i].tperi;
        var phaseUranus = (tdiff % rotPeriodUranus)/rotPeriodUranus;

        geo = createOrbit(planets[i].semi_major_axis, planets[i].eccentricity, THREE.Math.degToRad(planets[i].inclination), THREE.Math.degToRad(planets[i].longitude_of_ascending_node), THREE.Math.degToRad(planets[i].argument_of_periapsis), planets[i].tperi, planets[i].period*params.daytoyr, Ntheta = 1., thetaMin = 0, thetaMax = 0.);

        //set position
        MovingUranusMesh.position.set(geo.vertices[0].x, geo.vertices[0].y, geo.vertices[0].z);
        MovingUranusRingMesh.position.set(geo.vertices[0].x, geo.vertices[0].y, geo.vertices[0].z);

        //set rotation of planet
        MovingUranusMesh.rotation.y = (2.*phaseUranus*Math.PI) % (2.*Math.PI); //rotate Uranus around axis
        MovingUranusRingMesh.rotation.z = (2.*phaseUranus*Math.PI) % (2.*Math.PI); //this rotates rings at same rate as planet

        scene.updateMatrixWorld(true);
        params.UranusPos.setFromMatrixPosition( MovingUranusMesh.matrixWorld );

}
