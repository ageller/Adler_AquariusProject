var EarthFragmentShader = `



	varying vec2 vUv;
	varying vec3 vNormal;
    varying vec3 vPos;

	struct PointLight {
		vec3 position;
		vec3 color;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];

	uniform sampler2D dayTexture;
	uniform sampler2D nightTexture;
	uniform sampler2D specTexture;
	uniform sampler2D bumpTexture;

	void main( void ) {
		//bump map (not sure how to handle it, maybe will come back to it later)
		// vec3 bumpColor = texture2D( bumpTexture, vUv ).rgb;
		// vec3 bumpNormal = (2.*bumpColor)-1.; 
		// float bump = 0.;
		
		//point light and bump
		//https://codepen.io/lejeunerenard/pen/MyMLWP (with slight tweaks)
		vec4 addedLights = vec4(0,0,0,1);
		for(int l = 0; l < NUM_POINT_LIGHTS; l++) {
			vec3 adjustedLight = pointLights[l].position;// + cameraPosition;
			vec3 lightDirection = normalize(vPos - adjustedLight);
			addedLights.rgb += clamp(dot(-lightDirection, normalize(vNormal)), 0.0, 1.0);// * pointLights[l].color;
			//bump += clamp(dot(-lightDirection, normalize(bumpNormal)), 0.0, 1.0);
		}

		//day and night textures
		vec3 dayColor = texture2D( dayTexture, vUv ).rgb;
		vec3 nightColor = texture2D( nightTexture, vUv ).rgb;
		float softPow = 0.8; //to soften the edge
		gl_FragColor = vec4(mix(nightColor, dayColor, pow(addedLights.r,softPow)), 1.);

		//specular
		vec3 specColor = texture2D( specTexture, vUv ).rgb;
		float specPow = 30.;
		float specFac = 0.5;
		gl_FragColor.rgb += vec3(pow(specColor.r*addedLights.r, specPow))*specFac;

		//add the bump map
		//gl_FragColor.rgb *= bump;
	}
`;