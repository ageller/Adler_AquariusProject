
function clearEarth(){

        MovingEarthCloud.remove(MovingEarthMesh);
        MovingEarthCloud.remove(MovingCloudMesh);
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
        //for (i=0; i<=Ntheta; i++) {
                E = (i*dTheta + 2.*phase*Math.PI) % (2.*Math.PI);
                pos = []
                for (j=0; j<3; j++){
                        pos.push(semi * (Math.cos(E) - ecc) * P[j] + semi * Math.sqrt(1.0 - ecc * ecc) * Math.sin(E) * Q[j])                
                }       
                //geometry.vertices.push( {"x":pos[0], "y":pos[1], "z":pos[2]} );
        //}       
        
        //return geometry;
	return pos;
}

function makeEarth( geo , rotation = null) {

	var EarthRad = params.earthRad * 100.;
	var CloudRad = params.cloudRad * 100.;

        var geometry = new THREE.SphereGeometry(EarthRad,32,32);
	var EarthMaterial = new THREE.MeshPhongMaterial( {
                map: EarthTex,
		bumpMap: EarthBump,
                bumpScale: 0.4,
                specularMap: EarthSpec,
                specular: new THREE.Color( "gray" ),
        } );


        var mesh = new THREE.Mesh( geometry, EarthMaterial );
        ////mesh.geometry.dynamic = true;
        if (rotation != null){
                mesh.rotation.x = THREE.Math.degToRad(90.+23.5); // orient map and tilt Earth
		mesh.rotation.y = THREE.Math.degToRad(0.0);
                mesh.rotation.z = THREE.Math.degToRad(0.); 
        }
        mesh.position.set(geo[0],geo[1],geo[2]);
	//scene.add( mesh );
	MovingEarthMesh = mesh;

	//MovingEarthMesh.add( new THREE.AxisHelper( 10 ) ); // to show the local coordinate system

	var geometry = new THREE.SphereGeometry( CloudRad, 32, 32)
        var CloudMaterial = new THREE.MeshPhongMaterial( {
                map: CloudTex,
                transparent: true,
        } );

        var mesh = new THREE.Mesh( geometry, CloudMaterial );
	if (rotation != null){
        	mesh.rotation.x = THREE.Math.degToRad(90.+23.5); // orient map and tilt Cloud
                mesh.rotation.y = 0.0;
                mesh.rotation.z = THREE.Math.degToRad(0.);
	}
        mesh.position.set(geo[0],geo[1],geo[2]);
	MovingCloudMesh = mesh;
        //scene.add(MovingCloudMesh);

	MovingEarthCloud = new THREE.Group(); // group Earth and Cloud meshes, then orient orbit 
	if (rotation != null){
                MovingEarthCloud.rotation.x = rotation.x;
                MovingEarthCloud.rotation.y = rotation.y;
                MovingEarthCloud.rotation.z = rotation.z;
        }
	MovingEarthCloud.add(MovingEarthMesh);
	MovingEarthCloud.add(MovingCloudMesh);
	scene.add(MovingEarthCloud);

	//MovingEarthCloud.add( new THREE.AxisHelper( 10 ) ); // to show the local coordinate system

        scene.updateMatrixWorld(true);
        params.EarthPos.setFromMatrixPosition( MovingEarthMesh.matrixWorld );


}


function drawEarth()
{
	var i = 2;
	geo = createEarthOrbit(planets[i].semi_major_axis, planets[i].eccentricity, THREE.Math.degToRad(planets[i].inclination), THREE.Math.degToRad(planets[i].longitude_of_ascending_node), THREE.Math.degToRad(planets[i].argument_of_periapsis), planets[i].tperi, planets[i].period, Ntheta = 100.);


	makeEarth( geo, rotation = SSrotation);	

}
