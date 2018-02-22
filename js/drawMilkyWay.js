function drawInnerMilkyWay()
{

	var geometry = new THREE.SphereBufferGeometry( 1e10, 60, 40 );
	// invert the geometry on the x-axis so that all of the faces point inward
	geometry.scale( - 1, 1, 1 );
	var material = new THREE.MeshBasicMaterial( {
		map: ESOMWTex,
		transparent: true,
	} );
	MWInnerMesh = new THREE.Mesh( geometry, material );
	MWInnerMesh.rotation.x = Math.PI / 2;
	MWInnerMesh.rotation.y = Math.PI ;

	MWInnerScene.add(MWInnerMesh)
}

