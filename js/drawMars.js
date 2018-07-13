
function clearMars(){

        MovingMars.remove(MovingMarsMesh);
        scene.remove(MovingMars);
}


function makeMars( geo, tperi, day, radius, tilt, rotation = null) {

	var rotPeriodMars = day;
        var tdiff = params.JDtoday - tperi;
        var phaseMars = (tdiff % rotPeriodMars)/rotPeriodMars;

	var MarsRad = radius;
	//rescale the mesh after creating the sphere.  Otherwise, the sphere will not be drawn correctly at this small size
        var sc = params.earthRad;

        var geometry = new THREE.SphereGeometry(MarsRad,32,32);
	var MarsMaterial = new THREE.MeshPhongMaterial( {
                map: MarsTex,
        } );


        var mesh = new THREE.Mesh( geometry, MarsMaterial );
        if (rotation != null){
                mesh.rotation.x = THREE.Math.degToRad(90.)+tilt; // orient map
		mesh.rotation.y = (2.*phaseMars*Math.PI) % (2.*Math.PI); //rotate Mars around axis
                mesh.rotation.z = THREE.Math.degToRad(0.); 
        }
        mesh.position.set(geo.x, geo.y, geo.z);
	mesh.scale.set(sc, sc, sc);
	MovingMarsMesh = mesh;


	MovingMars = new THREE.Group(); // group Mars mesh, then orient orbit 
	if (rotation != null){
                MovingMars.rotation.x = rotation.x;
                MovingMars.rotation.y = rotation.y;
                MovingMars.rotation.z = rotation.z;
        }
	MovingMars.add(MovingMarsMesh);
	scene.add(MovingMars);

        scene.updateMatrixWorld(true);
        params.MarsPos.setFromMatrixPosition( MovingMarsMesh.matrixWorld );
}


function drawMars()
{
	var i = 3;
	geo = createOrbit(planets[i].semi_major_axis, planets[i].eccentricity, THREE.Math.degToRad(planets[i].inclination), THREE.Math.degToRad(planets[i].longitude_of_ascending_node), THREE.Math.degToRad(planets[i].argument_of_periapsis), planets[i].tperi, planets[i].period*params.daytoyr, Ntheta = 1., thetaMin = 0, thetaMax = 0.);

	makeMars( geo.vertices[0], planets[i].tperi, planets[i].day, planets[i].radius, planets[i].tilt, rotation = SSrotation);	

}

function moveMars()
{
        var i = 3;

        var rotPeriodMars = planets[i].day;
        var tdiff = params.JDtoday - planets[i].tperi;
        var phaseMars = (tdiff % rotPeriodMars)/rotPeriodMars;

        geo = createOrbit(planets[i].semi_major_axis, planets[i].eccentricity, THREE.Math.degToRad(planets[i].inclination), THREE.Math.degToRad(planets[i].longitude_of_ascending_node), THREE.Math.degToRad(planets[i].argument_of_periapsis), planets[i].tperi, planets[i].period*params.daytoyr, Ntheta = 1., thetaMin = 0, thetaMax = 0.);

        //set position
        MovingMarsMesh.position.set(geo.vertices[0].x, geo.vertices[0].y, geo.vertices[0].z);

        //set rotation of planet
        MovingMarsMesh.rotation.y = (2.*phaseMars*Math.PI) % (2.*Math.PI); //rotate Mars around axis

        scene.updateMatrixWorld(true);
        params.MarsPos.setFromMatrixPosition( MovingMarsMesh.matrixWorld );

}
