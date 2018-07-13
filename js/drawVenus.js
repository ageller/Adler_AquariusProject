
function clearVenus(){

        MovingVenus.remove(MovingVenusMesh);
        scene.remove(MovingVenus);
}



function makeVenus( geo, tperi, day, radius, tilt, rotation = null) {

	var rotPeriodVenus = day;
        var tdiff = params.JDtoday - tperi;
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
        mesh.position.set(geo.x,geo.y,geo.z);
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
	geo = createOrbit(planets[i].semi_major_axis, planets[i].eccentricity, THREE.Math.degToRad(planets[i].inclination), THREE.Math.degToRad(planets[i].longitude_of_ascending_node), THREE.Math.degToRad(planets[i].argument_of_periapsis), planets[i].tperi, planets[i].period*params.daytoyr, Ntheta = 1., thetaMin = 0, thetaMax = 0.);

	makeVenus( geo.vertices[0], planets[i].tperi, planets[i].day, planets[i].radius, planets[i].tilt, rotation = SSrotation);	

}

function moveVenus()
{
        var i = 1;
	
	var rotPeriodVenus = planets[i].day;
        var tdiff = params.JDtoday - planets[i].tperi;
        var phaseVenus = (tdiff % rotPeriodVenus)/rotPeriodVenus;

        geo = createOrbit(planets[i].semi_major_axis, planets[i].eccentricity, THREE.Math.degToRad(planets[i].inclination), THREE.Math.degToRad(planets[i].longitude_of_ascending_node), THREE.Math.degToRad(planets[i].argument_of_periapsis), planets[i].tperi, planets[i].period*params.daytoyr, Ntheta = 1., thetaMin = 0, thetaMax = 0.);

	//set position
        MovingVenusMesh.position.set(geo.vertices[0].x, geo.vertices[0].y, geo.vertices[0].z);

	//set rotation of planet
        MovingVenusMesh.rotation.y = (2.*phaseVenus*Math.PI) % (2.*Math.PI); //rotate Venus around axis
	
        scene.updateMatrixWorld(true);
        params.VenusPos.setFromMatrixPosition( MovingVenusMesh.matrixWorld );

}
