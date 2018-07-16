
function clearAquarius(){

	MovingAquarius.remove(MovingAquariusMesh);
	scene.remove(MovingAquarius);
}

//set up interpolation over Mark's file
//use the values from Mark Hammergren's file
function initAquariusInterps(){
	var t = [];
	var x = [];
	var y = [];
	var z = [];
	var a = [];
	var p = [];
	var e = [];
	var inc = [];
	var la = [];
	var ap = [];
	var tp = [];
	var index = [];
	for (i=0; i<Object.keys(aquarius.x).length; i++){
		t.push(aquarius.JD[i]);
		x.push(aquarius.x[i]);
		y.push(aquarius.y[i]);
		z.push(aquarius.z[i]);
		a.push(aquarius.a[i]);
		e.push(aquarius.e[i]);
		p.push(aquarius.p[i]);
		inc.push(aquarius.i[i]);
		la.push(aquarius.la[i]);
		ap.push(aquarius.ap[i]);
		tp.push(aquarius.tperi[i]);
		index.push(i)
	}

	aquarius.xInterp = new THREE.LinearInterpolant(
		new Float32Array(t),
		new Float32Array(x),
		1,
		new Float32Array( 1 )
	);

	aquarius.yInterp = new THREE.LinearInterpolant(
		new Float32Array(t),
		new Float32Array(y),
		1,
		new Float32Array( 1 )
	);

	aquarius.zInterp = new THREE.LinearInterpolant(
		new Float32Array(t),
		new Float32Array(z),
		1,
		new Float32Array( 1 )
	);

	aquarius.aInterp = new THREE.LinearInterpolant(
		new Float32Array(t),
		new Float32Array(a),
		1,
		new Float32Array( 1 )
	);
	aquarius.pInterp = new THREE.LinearInterpolant(
		new Float32Array(t),
		new Float32Array(p),
		1,
		new Float32Array( 1 )
	);
	aquarius.eInterp = new THREE.LinearInterpolant(
		new Float32Array(t),
		new Float32Array(e),
		1,
		new Float32Array( 1 )
	);
	aquarius.iInterp = new THREE.LinearInterpolant(
		new Float32Array(t),
		new Float32Array(inc),
		1,
		new Float32Array( 1 )
	);
	aquarius.laInterp = new THREE.LinearInterpolant(
		new Float32Array(t),
		new Float32Array(la),
		1,
		new Float32Array( 1 )
	);
	aquarius.apInterp = new THREE.LinearInterpolant(
		new Float32Array(t),
		new Float32Array(ap),
		1,
		new Float32Array( 1 )
	);
	aquarius.tpInterp = new THREE.LinearInterpolant(
		new Float32Array(t),
		new Float32Array(tp),
		1,
		new Float32Array( 1 )
	);
	aquarius.indexInterp = new THREE.LinearInterpolant(
		new Float32Array(t),
		new Float32Array(index),
		1,
		new Float32Array( 1 )
	);

}

function getAquariusPositionH(){

	//I need to interpolate
	var geometry = new THREE.Geometry();

	geometry.vertices.push( {"x":aquarius.xInterp.evaluate(params.JDtoday), "y":aquarius.yInterp.evaluate(params.JDtoday), "z":aquarius.zInterp.evaluate(params.JDtoday)});
	return geometry;
}
//use the values from Mark Hammergren's file
function getAquariusOrbitH(){

	//I need to interpolate
	var geometry = new THREE.Geometry();

	for (i=0; i<Object.keys(aquarius.x).length; i++){
		geometry.vertices.push( {"x":aquarius.x[i], "y":aquarius.y[i], "z":aquarius.z[i]} );
	}

	params.AquariusOrbitGeometry = geometry;

	return geometry;
}


//get position of Aquarius
function createAquariusOrbit(semi, ecc, inc, lan, ap, tperi, period, Ntheta = 10.){
	var tdiff = params.JDtoday - tperi;
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

	var rotPeriodAquarius = 0.002;
	var tdiff = params.JDtoday - tperi;
	var phaseAquarius = (tdiff % rotPeriodAquarius)/rotPeriodAquarius;

	//make slightly bigger so can actually see it
	var AquariusRad = radius*params.AquariusRadFac;
	//rescale the mesh after creating the sphere.  Otherwise, the sphere will not be drawn correctly at this small size
	var sc = params.earthRad*AquariusRad;

	MovingAquariusMesh.position.set(geo.x,geo.y,geo.z);
	MovingAquariusMesh.scale.set(sc, sc, sc);

	MovingAquarius = new THREE.Group(); // group Aquarius mesh, then orient orbit 
	if (rotation != null){
		MovingAquarius.rotation.x = rotation.x;
		MovingAquarius.rotation.y = rotation.y;
		MovingAquarius.rotation.z = rotation.z;
	}
	MovingAquariusMesh.rotation.y = (2.*phaseAquarius*Math.PI) % (2.*Math.PI); //rotate meteoroid around axis

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
	makeAquarius( params.AquariusOrbitGeometry.vertices[0], 0., 0.0001, 0.0000003, rotation = SSrotation);	
}

function moveAquarius()
{
	var rotPeriodAquarius = 0.02;
	var tdiff = params.JDtoday;//- aquarius.argument_of_periapsis;
	var phaseAquarius = (tdiff % rotPeriodAquarius)/rotPeriodAquarius;

	//I can't get this method to work! (using Mark's integrated orbit)
	// if (params.drawAquariusOrbit){
	// 	// line
	// 	var i0 = aquarius.indexInterp.evaluate(params.JDtoday);
	// 	var p0 = i0/Object.keys(aquarius.x).length;
	// 	console.log("p0 = ",p0)
	// 	makePlanetLine( params.AquariusOrbitGeometry , color = 'white', rotation = SSrotation, addToOrbitLines = true, p0 = p0)
	// }
	// geo = getAquariusPositionH();


	geo = params.AquariusOrbitGeometry.vertices[0];

	//set position
	MovingAquariusMesh.position.set(geo.x,geo.y,geo.z);

	//set rotation of meteoriod
	MovingAquariusMesh.rotation.y = (2.*phaseAquarius*Math.PI) % (2.*Math.PI); //rotate meteoriod around axis

	scene.updateMatrixWorld(true);
	params.AquariusPos.setFromMatrixPosition( MovingAquariusMesh.matrixWorld );
}
