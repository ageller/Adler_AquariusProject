
function clearJupiter(){

        MovingJupiter.remove(MovingJupiterMesh);
        scene.remove(MovingJupiter);
}



function makeJupiter( geo, tperi, day, radius, tilt, rotation = null) {

	var rotPeriodJupiter = day;
        var tdiff = params.JDtoday - tperi;
        var phaseJupiter = (tdiff % rotPeriodJupiter)/rotPeriodJupiter;

	var JupiterRad = radius;
	//rescale the mesh after creating the sphere.  Otherwise, the sphere will not be drawn correctly at this small size
        var sc = params.earthRad;

        var geometry = new THREE.SphereGeometry(JupiterRad,32,32);
	var JupiterMaterial = new THREE.MeshPhongMaterial( {
                map: JupiterTex,
        } );


        var mesh = new THREE.Mesh( geometry, JupiterMaterial );
        if (rotation != null){
                mesh.rotation.x = THREE.Math.degToRad(90.+tilt); // orient map
		mesh.rotation.y = (2.*phaseJupiter*Math.PI) % (2.*Math.PI); //rotate Jupiter around axis
                mesh.rotation.z = THREE.Math.degToRad(0.); 
        }
        mesh.position.set(geo.x,geo.y,geo.z);
	mesh.scale.set(sc, sc, sc);
	MovingJupiterMesh = mesh;


	MovingJupiter = new THREE.Group(); // group Jupiter mesh, then orient orbit 
	if (rotation != null){
                MovingJupiter.rotation.x = rotation.x;
                MovingJupiter.rotation.y = rotation.y;
                MovingJupiter.rotation.z = rotation.z;
        }
	MovingJupiter.add(MovingJupiterMesh);
	scene.add(MovingJupiter);

        scene.updateMatrixWorld(true);
        params.JupiterPos.setFromMatrixPosition( MovingJupiterMesh.matrixWorld );

}


function drawJupiter()
{
	var i = 4;
	geo = createOrbit(planets[i].semi_major_axis, planets[i].eccentricity, THREE.Math.degToRad(planets[i].inclination), THREE.Math.degToRad(planets[i].longitude_of_ascending_node), THREE.Math.degToRad(planets[i].argument_of_periapsis), planets[i].tperi, planets[i].period*params.daytoyr, Ntheta = 1., thetaMin = 0, thetaMax = 0.);

	makeJupiter( geo.vertices[0], planets[i].tperi, planets[i].day, planets[i].radius, planets[i].tilt, rotation = SSrotation);	

}

function moveJupiter()
{
        var i = 4;

        var rotPeriodJupiter = planets[i].day;
        var tdiff = params.JDtoday - planets[i].tperi;
        var phaseJupiter = (tdiff % rotPeriodJupiter)/rotPeriodJupiter;

        geo = createOrbit(planets[i].semi_major_axis, planets[i].eccentricity, THREE.Math.degToRad(planets[i].inclination), THREE.Math.degToRad(planets[i].longitude_of_ascending_node), THREE.Math.degToRad(planets[i].argument_of_periapsis), planets[i].tperi, planets[i].period*params.daytoyr, Ntheta = 1., thetaMin = 0, thetaMax = 0.);

        //set position
        MovingJupiterMesh.position.set(geo.vertices[0].x, geo.vertices[0].y, geo.vertices[0].z);

        //set rotation of planet
        MovingJupiterMesh.rotation.y = (2.*phaseJupiter*Math.PI) % (2.*Math.PI); //rotate Jupiter around axis

        scene.updateMatrixWorld(true);
        params.JupiterPos.setFromMatrixPosition( MovingJupiterMesh.matrixWorld );

}
