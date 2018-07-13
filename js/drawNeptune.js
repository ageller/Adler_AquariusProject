
function clearNeptune(){

        MovingNeptune.remove(MovingNeptuneMesh);
        scene.remove(MovingNeptune);
}

function makeNeptune( geo, tperi, day, radius, tilt, rotation = null) {

	var rotPeriodNeptune = day;
        var tdiff = params.JDtoday - tperi;
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
        mesh.position.set(geo.x,geo.y,geo.z);
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
	geo = createOrbit(planets[i].semi_major_axis, planets[i].eccentricity, THREE.Math.degToRad(planets[i].inclination), THREE.Math.degToRad(planets[i].longitude_of_ascending_node), THREE.Math.degToRad(planets[i].argument_of_periapsis), planets[i].tperi, planets[i].period*params.daytoyr, Ntheta = 1., thetaMin = 0, thetaMax = 0.);

	makeNeptune( geo.vertices[0], planets[i].tperi, planets[i].day, planets[i].radius, planets[i].tilt, rotation = SSrotation);	

}

function moveNeptune()
{
        var i = 7;

        var rotPeriodNeptune = planets[i].day;
        var tdiff = params.JDtoday - planets[i].tperi;
        var phaseNeptune = (tdiff % rotPeriodNeptune)/rotPeriodNeptune;

        geo = createOrbit(planets[i].semi_major_axis, planets[i].eccentricity, THREE.Math.degToRad(planets[i].inclination), THREE.Math.degToRad(planets[i].longitude_of_ascending_node), THREE.Math.degToRad(planets[i].argument_of_periapsis), planets[i].tperi, planets[i].period*params.daytoyr, Ntheta = 1., thetaMin = 0, thetaMax = 0.);

        //set position
        MovingNeptuneMesh.position.set(geo.vertices[0].x, geo.vertices[0].y, geo.vertices[0].z);

        //set rotation of planet
        MovingNeptuneMesh.rotation.y = (2.*phaseNeptune*Math.PI) % (2.*Math.PI); //rotate Neptune around axis

        scene.updateMatrixWorld(true);
        params.NeptunePos.setFromMatrixPosition( MovingNeptuneMesh.matrixWorld );

}
