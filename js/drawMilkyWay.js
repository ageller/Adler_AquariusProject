function drawInnerMilkyWay()
{

	var geometry = new THREE.SphereBufferGeometry( 1e10, 60, 40 );
	// invert the geometry on the x-axis so that all of the faces point inward
	geometry.scale( - 1, 1, 1 );
	var material = new THREE.MeshBasicMaterial( {
		map: params.ESOMWTex,
		transparent: true,
		opacity:params.MWalpha,
	} );
	params.MWInnerMesh = new THREE.Mesh( geometry, material );
	params.MWInnerMesh.rotation.x = Math.PI / 2;
	params.MWInnerMesh.rotation.y = Math.PI ;

	params.MWInnerScene.add(params.MWInnerMesh)
}

