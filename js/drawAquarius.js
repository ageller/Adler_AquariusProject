
function clearAquarius(){

	MovingAquarius.remove(MovingAquariusMesh);
	params.scene.remove(MovingAquarius);
}



function makeAquarius( geo, tperi, day, radius, rotation = null) {

	var rotPeriodAquarius = day;
	var JDtoday = params.JD0 + (params.Year - 1990.);
	var tdiff = JDtoday - tperi;
	var phaseAquarius = (tdiff % rotPeriodAquarius)/rotPeriodAquarius;

	var sc = radius*params.earthRad/20.; //factor of 20 to account for actual size of the model?

	MovingAquariusMesh.position.set(geo.x,geo.y,geo.z);
	MovingAquariusMesh.scale.set(sc, sc, sc);

	MovingAquarius = new THREE.Group(); // group Aquarius mesh, then orient orbit 
	if (rotation != null){
		MovingAquarius.rotation.x = rotation.x;
		MovingAquarius.rotation.y = rotation.y;
		MovingAquarius.rotation.z = rotation.z;
	}
	MovingAquarius.add(MovingAquariusMesh);
	params.scene.add(MovingAquarius);

	params.scene.updateMatrixWorld(true);
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

	geo = createOrbit(params.aquarius.semi_major_axis, params.aquarius.eccentricity, THREE.Math.degToRad(params.aquarius.inclination), THREE.Math.degToRad(params.aquarius.longitude_of_ascending_node), THREE.Math.degToRad(params.aquarius.argument_of_periapsis), params.aquarius.tperi, params.aquarius.period, Ntheta = 1., thetaMin = 0, thetaMax = 0.);

	//rotate meteorid slightly, and make size approximately 2m in radius, given in Earth radii
	makeAquarius( geo.vertices[0], params.aquarius.tperi, 0.0001, params.aquariusRad, rotation = params.SSrotation);	

}

function moveAquarius()
{
	var rotPeriodAquarius = 0.0001;
	var JDtoday = params.JD0 + (params.Year - 1990.);
	var tdiff = JDtoday - params.aquarius.argument_of_periapsis;
	var phaseAquarius = (tdiff % rotPeriodAquarius)/rotPeriodAquarius;
	
	geo = createOrbit(params.aquarius.semi_major_axis, params.aquarius.eccentricity, THREE.Math.degToRad(params.aquarius.inclination), THREE.Math.degToRad(params.aquarius.longitude_of_ascending_node), THREE.Math.degToRad(params.aquarius.argument_of_periapsis), params.aquarius.tperi, params.aquarius.period, Ntheta = 1., thetaMin = 0, thetaMax = 0.);

	//set position
	MovingAquariusMesh.position.set(geo.vertices[0].x,geo.vertices[0].y,geo.vertices[0].z);

	//set rotation of meteoriod
	MovingAquariusMesh.rotation.y = (2.*phaseAquarius*Math.PI) % (2.*Math.PI); //rotate meteoriod around axis

	params.scene.updateMatrixWorld(true);
	params.AquariusPos.setFromMatrixPosition( MovingAquariusMesh.matrixWorld );
}
