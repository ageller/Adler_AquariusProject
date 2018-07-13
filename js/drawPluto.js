
function clearPluto(){

        MovingPluto.remove(MovingPlutoMesh);
        scene.remove(MovingPluto);
}

function makePluto( geo, tperi, day, radius, tilt, rotation = null) {

	var rotPeriodPluto = day;
        var tdiff = params.JDtoday - tperi;
        var phasePluto = (tdiff % rotPeriodPluto)/rotPeriodPluto;

	var PlutoRad = radius;
	//rescale the mesh after creating the sphere.  Otherwise, the sphere will not be drawn correctly at this small size
        var sc = params.earthRad;

        var geometry = new THREE.SphereGeometry(PlutoRad,32,32);
	var PlutoMaterial = new THREE.MeshPhongMaterial( {
                map: PlutoTex,
        } );


        var mesh = new THREE.Mesh( geometry, PlutoMaterial );
        if (rotation != null){
                mesh.rotation.x = THREE.Math.degToRad(90.+tilt); // orient map
		mesh.rotation.y = (2.*phasePluto*Math.PI) % (2.*Math.PI); //rotate Pluto around axis
                mesh.rotation.z = THREE.Math.degToRad(0.); 
        }
        mesh.position.set(geo.x,geo.y,geo.z);
	mesh.scale.set(sc, sc, sc);
	MovingPlutoMesh = mesh;


	MovingPluto = new THREE.Group(); // group Pluto mesh, then orient orbit 
	if (rotation != null){
                MovingPluto.rotation.x = rotation.x;
                MovingPluto.rotation.y = rotation.y;
                MovingPluto.rotation.z = rotation.z;
        }
	MovingPluto.add(MovingPlutoMesh);
	scene.add(MovingPluto);

        scene.updateMatrixWorld(true);
        params.PlutoPos.setFromMatrixPosition( MovingPlutoMesh.matrixWorld );
}


function drawPluto()
{
	var i = 8;
	geo = createOrbit(planets[i].semi_major_axis, planets[i].eccentricity, THREE.Math.degToRad(planets[i].inclination), THREE.Math.degToRad(planets[i].longitude_of_ascending_node), THREE.Math.degToRad(planets[i].argument_of_periapsis), planets[i].tperi, planets[i].period*params.daytoyr, Ntheta = 1., thetaMin = 0, thetaMax = 0.);

	makePluto( geo.vertices[0], planets[i].tperi, planets[i].day, planets[i].radius, planets[i].tilt, rotation = SSrotation);	

}

function movePluto()
{
        var i = 8;

        var rotPeriodPluto = planets[i].day;
        var tdiff = params.JDtoday - planets[i].tperi;
        var phasePluto = (tdiff % rotPeriodPluto)/rotPeriodPluto;

        geo = createOrbit(planets[i].semi_major_axis, planets[i].eccentricity, THREE.Math.degToRad(planets[i].inclination), THREE.Math.degToRad(planets[i].longitude_of_ascending_node), THREE.Math.degToRad(planets[i].argument_of_periapsis), planets[i].tperi, planets[i].period*params.daytoyr, Ntheta = 1., thetaMin = 0, thetaMax = 0.);

        //set position
        MovingPlutoMesh.position.set(geo.vertices[0].x, geo.vertices[0].y, geo.vertices[0].z);

        //set rotation of planet
        MovingPlutoMesh.rotation.y = (2.*phasePluto*Math.PI) % (2.*Math.PI); //rotate Pluto around axis

        scene.updateMatrixWorld(true);
        params.PlutoPos.setFromMatrixPosition( MovingPlutoMesh.matrixWorld );

}
