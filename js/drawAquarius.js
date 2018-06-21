
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
	var AquariusRad = radius*5.e4;
	//rescale the mesh after creating the sphere.  Otherwise, the sphere will not be drawn correctly at this small size
	var sc = params.earthRad*AquariusRad;

	MovingAquariusMesh.position.set(geo[0],geo[1],geo[2]);
	MovingAquariusMesh.scale.set(sc, sc, sc);

	MovingAquarius = new THREE.Group(); // group Aquarius mesh, then orient orbit 
	if (rotation != null){
		MovingAquarius.rotation.x = rotation.x;
		MovingAquarius.rotation.y = rotation.y;
		MovingAquarius.rotation.z = rotation.z;
	}
	MovingAquarius.add(MovingAquariusMesh);
	scene.add(MovingAquarius);

	scene.updateMatrixWorld(true);
	params.AquariusPos.setFromMatrixPosition( MovingAquariusMesh.matrixWorld );
}

function loadAquarius()
{
		//from https://github.com/mrdoob/three.js/blob/master/examples/webgl_loader_obj.html
	var manager = new THREE.LoadingManager();
	manager.onProgress = function ( item, loaded, total ) {
		console.log( item, loaded, total );
	};
	var onProgress = function ( xhr ) {
		if ( xhr.lengthComputable ) {
			var percentComplete = xhr.loaded / xhr.total * 100;
			console.log( Math.round(percentComplete, 2) + '% downloaded' );
		}

	};
	var onError = function ( xhr ) {
	};	
	var textureLoader = new THREE.TextureLoader( manager );
	var texture = textureLoader.load( 'models/AsteroidCentered/maps/Comet_F_Diffuse03.png' );	
	var loader = new THREE.OBJLoader( manager );
	loader.load( 'models/AsteroidCentered/AsteroidQuads.obj', function ( object ) {
		object.traverse( function ( child ) {
			if ( child instanceof THREE.Mesh ) {
				child.material.map = texture;
			}
		} );
		
		MovingAquariusMesh = object;
		drawAquarius();


	}, onProgress, onError );
}

function drawAquarius()
{
	geo = createAquariusOrbit(aquarius.semi_major_axis, aquarius.eccentricity, THREE.Math.degToRad(aquarius.inclination), THREE.Math.degToRad(aquarius.longitude_of_ascending_node), THREE.Math.degToRad(aquarius.argument_of_periapsis), aquarius.tperi, aquarius.period, Ntheta = 100.);

	//rotate meteorid slightly, and make size approximately 2m in radius, given in Earth radii
	makeAquarius( geo, aquarius.tperi, 0.0001, 0.0000003, rotation = SSrotation);	

}

function moveAquarius()
{
	var rotPeriodAquarius = 0.0001;
        var JDtoday = JD0 + (params.Year - 1990.);
        var tdiff = JDtoday - aquarius.argument_of_periapsis;
        var phaseAquarius = (tdiff % rotPeriodAquarius)/rotPeriodAquarius;
	
	geo = createAquariusOrbit(aquarius.semi_major_axis, aquarius.eccentricity, THREE.Math.degToRad(aquarius.inclination), THREE.Math.degToRad(aquarius.longitude_of_ascending_node), THREE.Math.degToRad(aquarius.argument_of_periapsis), aquarius.tperi, aquarius.period, Ntheta = 100.);

	//set position
	MovingAquariusMesh.position.set(geo[0],geo[1],geo[2]);

	//set rotation of meteoriod
	MovingAquariusMesh.rotation.y = (2.*phaseAquarius*Math.PI) % (2.*Math.PI); //rotate meteoriod around axis

	scene.updateMatrixWorld(true);
        params.AquariusPos.setFromMatrixPosition( MovingAquariusMesh.matrixWorld );
}
