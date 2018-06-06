var EarthVertexShader = `

	varying vec2 vUv;
	varying vec3 vNormal;
    varying vec3 vPos;

	void main()
	{

		vUv = uv;
		vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
		vPos = mvPosition.xyz;
		vNormal = normalMatrix * normal;
		gl_Position = projectionMatrix * mvPosition;
	}

`;