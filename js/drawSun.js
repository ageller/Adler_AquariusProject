
function clearSun(){
	SunMesh.geometry.dispose();
	scene.remove(SunMesh);
	coronaMesh.geometry.dispose();
	scene.remove(coronaMesh);	
}

//function here for point source
function PointLightSun()
{
	var light = new THREE.PointLight( 0xffffff, 1, 0, 2);
	light.position.set(0,0,0);
	scene.add( light );
	//so that I can see the backside
	scene.add(new THREE.AmbientLight(0xffffff));
}

function drawSun()
{
	var SunRad = params.sRad;
	var SunTeff = params.sTeff;

	var ifac = params.Year % 2;
	// sphere	
	var geometry = new THREE.SphereGeometry( SunRad, 32, 32 );
	var SunMaterial =  new THREE.ShaderMaterial( {
		uniforms: {
			radius: { value: SunRad },
			uTime: { value: ifac },
			bb: { type: "t", value: bbTex},
			sunTemp: {value: SunTeff},
			sTeff: {value: params.smTeff},
			Teffac: {value: params.Teffac},
			SSalpha: {value: params.useSSalpha },
			cameraCenter: {value: camera.position},
		},

		vertexShader: SunVertexShader,
		fragmentShader: SunFragmentShader,
		depthWrite: true,
		depthTest: true,
		transparent: true,
		alphaTest: true,
	} );

	var mesh = new THREE.Mesh( geometry, SunMaterial );
	mesh.position.set(0,0,0);
	scene.add(mesh);

	SunMesh = mesh;
	var geometry = new THREE.PlaneGeometry(width0, height0);

	var coronaMaterial =  new THREE.ShaderMaterial( {
		uniforms: {
			Rout: { value: params.coronaSize * SunRad },
			uTime: { value: ifac },
			cfac: {value: params.coronaP},
			calpha: {value: params.coronaAlpha},
			bb: { type: "t", value: bbTex},
			sunTemp: {value: SunTeff},
			sTeff: {value: params.smTeff},
			Teffac: {value: params.Teffac},
			SSalpha: {value: params.useSSalpha },


		},

		vertexShader: myVertexShader,
		fragmentShader: coronaFragmentShader,
		depthWrite:true,
		depthTest: true,
		side: THREE.DoubleSide, 
		transparent:true,
		alphaTest: true,
	} );

	var mesh = new THREE.Mesh( geometry, coronaMaterial );
	mesh.position.set(0,0,0);
	mesh.lookAt( camera.position )
	scene.add(mesh);

	coronaMesh = mesh;

    scene.updateMatrixWorld(true);
    params.SunPos.setFromMatrixPosition( SunMesh.matrixWorld );

}
