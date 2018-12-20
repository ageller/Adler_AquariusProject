var isMobile = false; //checked below initiate as false
//all other global variables are now in params object

//defined in WebGLStart, after data is loaded
var params;
function defineParams(data, aquariusMesh){
	ParamsInit = function(data, aquariusMesh) {

		this.scene = null;
		this.MWInnerScene = null;
		this.keyboard = null;
		this.container = null;
		this.camera = null;
		this.renderer = null;
		this.controls = null;
		this.effect = null;
		this.composer = null;
		this.capturer = null;

		//for the time slider
		this.timeContainer = null;
		this.timeRect = null;
		this.timeText = null;

		//radii we need to save in units of AU (?), later all planets are scaled by params.earthRad (is this right?)
		this.earthRad = 1./23481.066;
		this.sRad = 1./215./this.earthRad;
		this.aquariusRad = 3e-8/this.earthRad;

		//this will hold the data from the input files
		this.planets = data[0];
		this.planets[10] = {"name":"Asteroid", "radius":this.aquariusRad};
		this.planets[100] = {"name":"Sun", "radius":this.sRad};
		this.planets[101] = {"name":"SolarSystem", "radius":this.sRad};
		this.asteroids = data[1];
		this.aquarius = data[2];

		//this is a tweak to get the impact to line up correctly
		this.aquarius.tperi += 0.006;
		for (var i=0; i<9; i++){
			this.planets[i].tperi += 0.007099988;
		}

		//this holds all the orbit lines
		this.orbitLines = [];

		//various meshes
		this.SunMesh = null;
		this.coronaMesh = null;
		this.MWInnerMesh = null;

		//will hold all the spheres of the planets
		this.movingGroup ={ 0:null,	1:null,	2:null,	3:null,	4:null,	5:null,	6:null,	7:null,	8:null,	9:null};
		this.movingMesh = { 0:[],	1:[],	2:[],	3:[],	4:[],	5:[],	6:[],	7:[],	8:[],	9:[]  };
		this.aquariusMesh = aquariusMesh;
		this.aquariusGroup = null;

		//solar system rotation
		this.SSrotation = new THREE.Vector3(THREE.Math.degToRad(-63.), 0., 0.); //solar system is inclined at 63 degrees to galactic plane

		//various textures
		this.bbTex = null;
		this.ESOMWTex = null;

		//camera info (reset below)
		this.width0 = 1.;
		this.height0 = 1.;

		//for gui
		this.gui = null;
		this.basicGUI = null;
		this.legendGUI = null;

		//render info
		this.fullscreen = function() { THREEx.FullScreen.request() };
		this.resetCamera = function() { 
			params.controls.reset(); 	
			params.camera.up.set(0, -1, 0)
		};
		this.stereo = false;
		this.friction = 0.2;
		this.zoomSpeed = 1.;
		this.stereoSep = 0.064;

		this.pause = true; //toggles pausing time evolution on/off with space bar

//Solar System appearance
		this.SSlineWidth = 0.003;
		//this.SSlineWidth = 0.006;
		this.SSlineTaper = 1./4.;
		this.SSalpha = 1.;
		this.useSSalpha = 1.;
		this.useASTalpha = 0.5; //transparency only works if sorted, and we won't sort these, but with thin lines...
		this.ASTlineWidth = 0.0005;

		this.coronaSize = 50.;
		this.coronaP = 0.3;
		this.coronaAlpha = 1.;
		this.sTeff = 5780*0.8;
		//central temperature for exaggerating the colors
		this.smTeff = 5780.;
		//factor to exagerate color (set to 1 for no exageration)
		this.Teffac = 1.0;



		//time controls
		this.timeStepUnit = 1./8760.; //one hour for the initial time step
		this.timeStepFac = 1.; 
		this.timeStep = parseFloat(this.timeStepUnit)*parseFloat(this.timeStepFac);
		//this.Year = 2017.101; //roughly Feb 6, 2017
		//this.Year = 2017.10137;
		//gets us closer to intersection, but might not be exactly correct time
		this.minYear = 1990;
		this.collisionYear = 2017.1014715949;
		this.collisionYear0 = 2017.1; //time when we start moving Aquarius toward collision position
		this.startYear = this.collisionYear -2.5;
		this.Year = this.startYear;
		//this.Year = 2017.0939;
		//var JD0 = 2458060.5; //Nov. 3, 2017
		this.JD0 = 2447892.5; //Jan. 1, 1990
		this.JDtoday = this.JD0 + (this.Year - 1990.);
		this.JDmin = this.JD0 + (this.startYear - 1990.);
		this.JDmax = this.JD0 + (this.collisionYear - 1990.);

		//image and video capture
		this.filename = "test.png";
		this.captureWidth = 1024;
		this.captureHeight = 1024;
		this.captureCanvas = false;
		this.videoFramerate = 30;
		this.videoDuration = 2;
		this.videoFormat = 'png';

//Planet locations
		this.planetPos = {  0:new THREE.Vector3(),//this.MercuryPos,
							1:new THREE.Vector3(),//this.VenusPos,
							2:new THREE.Vector3(),//this.EarthPos,
							3:new THREE.Vector3(),//this.MarsPos,
							4:new THREE.Vector3(),//this.JupiterPos,
							5:new THREE.Vector3(),//this.SaturnPos,
							6:new THREE.Vector3(),//this.UranusPos,
							7:new THREE.Vector3(),//this.NeptunePos,
							8:new THREE.Vector3(),//this.PlutoPos,
							9:new THREE.Vector3(),//this.MoonPos,
							10:new THREE.Vector3(),//this.AquariusPos,
							100:new THREE.Vector3(),//this.SunPos, 
							101:new THREE.Vector3(),//this.SunPos
						}

//orbit line colors
		var c3 = "red"
		//var c2 = "blue"
		var c2 = "deepskyblue"
		var c1 = "orange"
		var c4 = "purple"
		var c5 = "grey"
		this.pcolors = {"Mercury":c1, "Venus":c1, "EarthMoon":c2, "Mars":c1, "Jupiter":c3, "Saturn":c3, "Uranus":c3, "Neptune":c3, "Pluto":c4, "Moon":c5}

//camera "near" limit values for each focus point
//"Sun":100, "Mercury":0, "Venus":1, "Earth":2, "Moon":9, "Asteroid":10, "Mars":3, "Jupiter":4,"Saturn":5,"Uranus":6,"Neptune":7,"Pluto":8
		this.cameraNear = {	0:this.planets[0].radius*this.earthRad, 
							1:this.planets[1].radius*this.earthRad, 
							2:this.planets[2].radius*this.earthRad,
							3:this.planets[3].radius*this.earthRad, 
							4:this.planets[4].radius*this.earthRad, 
							5:this.planets[5].radius*this.earthRad, 
							6:this.planets[6].radius*this.earthRad,
							7:this.planets[7].radius*this.earthRad,
							8:this.planets[8].radius*this.earthRad,
							9:this.planets[9].radius*this.earthRad,
							10:this.planets[10].radius*this.earthRad,
							100:this.planets[100].radius*this.earthRad, 
							101:this.planets[100].radius*this.earthRad}

//Galaxy appearance
		this.MWalpha = 0.5;

//Camera target (number)
		this.cameraTarget = 2 //Earth


//some functions
		this.updateSolarSystem = function() {
			if ((params.Year >= params.collisionYear && params.timeStepFac > 0) || (params.Year <= params.startYear && params.timeStepFac < 0)){
				params.pause = true;
				if (params.timeStepFac > 0){
					params.Year = params.collisionYear;
				}else{
					params.Year = params.startYear;
				}
				if (d3.select('#playControl').classed('clickedControl')){
					d3.select('#stopControl').classed('clickedControl', true);
					d3.select('#playControl').classed('clickedControl', false);
				}
			}

			params.JDtoday = THREE.Math.clamp(params.JD0 + (params.Year - 1990.), params.JDmin, params.JDmax);

			updateTimeSlider(params.Year);

			var cameraPos1 = {"x":params.planetPos[params.cameraTarget].x, "y":params.planetPos[params.cameraTarget].y, "z":params.planetPos[params.cameraTarget].z};

			movePlanets();	
			clearPlanetOrbitLines();
			drawPlanetOrbitLines();
			drawAquariusOrbitLine();
			clearSun();
			drawSun();
			moveAquarius();

			var cameraPos2 = {"x":params.planetPos[params.cameraTarget].x, "y":params.planetPos[params.cameraTarget].y, "z":params.planetPos[params.cameraTarget].z};

			params.camera.position.x += (cameraPos2.x - cameraPos1.x);
			params.camera.position.y += (cameraPos2.y - cameraPos1.y);
			params.camera.position.z += (cameraPos2.z - cameraPos1.z);
			params.controls.target = params.planetPos[params.cameraTarget].clone();
			params.camera.lookAt(params.planetPos[params.cameraTarget]);

			

		};
	


		this.screenshot = function(){
			var imgData, imgNode;
			var strDownloadMime = "image/octet-stream";
			var strMime = "image/png";
			var screenWidth = window.innerWidth;
			var screenHeight = window.innerHeight;
			var aspect = screenWidth / screenHeight;

			var saveFile = function (strData, filename) {
				var link = document.createElement('a');
				if (typeof link.download === 'string') {
					document.body.appendChild(link); //Firefox requires the link to be in the body
					link.download = filename;
					link.href = strData;
					link.click();
					document.body.removeChild(link); //remove the link when done
				} else {
					location.replace(uri);
				}
			}


			try {
				//resize
				params.renderer.setSize(params.captureWidth, params.captureHeight);
				params.camera.aspect = params.captureWidth / params.captureHeight;;
				params.camera.updateProjectionMatrix();
				myRender();

				//save image
				imgData = params.renderer.domElement.toDataURL(strMime);
				saveFile(imgData.replace(strMime, strDownloadMime), params.filename);

				//back to original size
				params.renderer.setSize(screenWidth, screenHeight);
				params.camera.aspect = aspect;
				params.camera.updateProjectionMatrix();
				myRender();

			} catch (e) {
				console.log(e);
				return;
			}

		}

		this.recordVideo = function(){

			params.captureCanvas = true;
			params.capturer = new CCapture( { 
				format: params.videoFormat, 
				workersPath: 'resources/CCapture/',
				framerate: params.videoFramerate,
				name: params.filename,
				timeLimit: params.videoDuration,
				autoSaveTime: params.videoDuration,
				verbose: true,
			} );

			params.capturer.start();

		}

		this.updateCameraTarget = function(target){

			// //for some reason this is breaking on the Sun's position, and also Aquarius.  I have no idea why, but here's a hacky fix!
			// if (target > 50){
			// 	params.planetPos[target] = new THREE.Vector3(0,0,0);
			// }


			params.cameraTarget = target;
			var dur = 3000;
			var ease = TWEEN.Easing.Quintic.InOut;

			//params.controls.target = params.planetPos[params.cameraTarget];
			//params.camera.lookAt(params.planetPos[params.cameraTarget]);
			params.camera.near = params.cameraNear[params.cameraTarget];
			params.controls.minDistance = 2.*params.camera.near;

			var controlsTween = new TWEEN.Tween(params.controls.target).to(params.planetPos[params.cameraTarget], dur).easing(ease);

			var target = {	"x":params.planetPos[params.cameraTarget].x + params.planets[params.cameraTarget].radius*params.earthRad*2., 
				"y":params.planetPos[params.cameraTarget].y + params.planets[params.cameraTarget].radius*params.earthRad*2.,
				"z":params.planetPos[params.cameraTarget].z + params.planets[params.cameraTarget].radius*params.earthRad*2.};
			if (params.cameraTarget == 101){
				//solar system view
				target = new THREE.Vector3(-0.8090990636775851, 6.42551823357708, 2.8386747145675177);
			}
			var posTween = new TWEEN.Tween(params.camera.position).to(target, dur).easing(ease)
				.onStart(function(){
					controlsTween.start();
				})
				.onUpdate(function(){
					if (params.cameraTarget != 101){
						//in case the planet is moving
						target.x = params.planetPos[params.cameraTarget].x + params.planets[params.cameraTarget].radius*params.earthRad*2.; 
						target.y = params.planetPos[params.cameraTarget].y + params.planets[params.cameraTarget].radius*params.earthRad*2.;
						target.z = params.planetPos[params.cameraTarget].z + params.planets[params.cameraTarget].radius*params.earthRad*2.;
					}
				})

			posTween.start();

		}
		

	};

	params = new ParamsInit(data, aquariusMesh);
}


function defineGUI(){

	// params.gui = new dat.GUI({ width: 450 } )
	// var params.captureGUI = gui.addFolder('Capture');
	// params.captureGUI.add( params, 'filename');
	// params.captureGUI.add( params, 'captureWidth');
	// params.captureGUI.add( params, 'captureHeight');
	// params.captureGUI.add( params, 'videoDuration');
	// params.captureGUI.add( params, 'videoFramerate');
	// params.captureGUI.add( params, 'videoFormat', {"gif":"gif", "jpg":"jpg", "png":"png"} )
	// params.captureGUI.add( params, 'screenshot');
	// params.captureGUI.add( params, 'recordVideo');


	//buttons for play pause, etc.
	d3.select('#playControl').on('click', function(){
		params.pause = false;
		d3.select('#stopControl').classed('clickedControl', false);
		d3.select('#playControl').classed('clickedControl', true);
	});
	d3.select('#stopControl').on('click', function(){
		params.pause = true;
		d3.select('#stopControl').classed('clickedControl', true);
		d3.select('#playControl').classed('clickedControl', false);
	});
	d3.select('#reverseControl').on('click', function(){
		params.timeStepFac = -1. * Math.abs(params.timeStepFac);
		d3.select('#reverseControl').classed('clickedControl', true);
		d3.select('#forwardControl').classed('clickedControl', false);
	});
	d3.select('#forwardControl').on('click', function(){
		params.timeStepFac = Math.abs(params.timeStepFac);		
		d3.select('#reverseControl').classed('clickedControl', false);
		d3.select('#forwardControl').classed('clickedControl', true);
	});
	d3.select('#fasterControl').on('click', function(){params.timeStepFac *= 2.;});
	d3.select('#slowerControl').on('click', function(){params.timeStepFac /= 2.;});
	d3.select('#help').on('click', function(){showSplash('#splash');});

	//dropdown for camera target
	d3.select('#targetControl').on('click', function(){
		d = d3.select('#targetDropdown');    
		if (d.style('display') === 'none') {
			d.style('display','block');
			d3.select('#targetControl').classed('clickedControl', true);
		} else {
			d.style('display','none');
			d3.select('#targetControl').classed('clickedControl', false);
		}
	});
	var targs = { "Asteroid":"10", "Sun":"100", "Mercury":"0", "Venus":"1", "Earth":"2", "Mars":"3", "Jupiter":"4","Saturn":"5","Uranus":"6","Neptune":"7","Pluto":"8","Moon":"9", "Solar System":"101"};
	var dropdown = d3.select('#targetDropdown');
	for (var key in targs) {
	// skip loop if the property is from prototype
		if (!targs.hasOwnProperty(key)) continue;
		dropdown.append('div')
			.style('display','block')
			.attr('value',targs[key])
			.html("&nbsp;" + key)
			.on('click', function(){
				params.cameraTarget = targs[key];
				params.updateCameraTarget(this.getAttribute('value'));
			});
	}

	//rects for time slider
	//Make an SVG Container
	params.timeContainer = d3.select("#timeSlider").append("svg")
		.attr("width", "100%")
		.attr("height", "100%")
		.on("mousedown", setTimeFromSlider)
		.call(d3.drag().on("drag", setTimeFromSlider));
	
	var color = d3.select('#timeSlider').style('color');
	//Draw the Rectangle
	params.timeRect = params.timeContainer.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", 0)
		.attr("height", "100%")
		.attr("fill",color)
		.attr("opacity",0.5);

	params.timeText = params.timeContainer.append("text")
		.attr("x", 0)
		.attr("y", 0)
		.attr("dy","40px")
		.attr("dx","5px")
		.attr("fill",color)
		.classed('timeText', true)
		.text("");

	updateTimeSlider();



}

function init() {	

	//scene
	params.scene = new THREE.Scene();
	params.MWInnerScene = new THREE.Scene();

	// camera
	var screenWidth = window.innerWidth;
	var screenHeight = window.innerHeight;
	var fov = 45;
	var aspect = screenWidth / screenHeight;
	var zmin = 1e-8;
	var zmax = 5000;
	params.camera = new THREE.PerspectiveCamera( fov, aspect, zmin, zmax);
	params.scene.add(params.camera);
	params.MWInnerScene.add(params.camera);

	params.camera.position.set(5,0,5); //adjusted starting position


	var dist = params.scene.position.distanceTo(params.camera.position);
	var vFOV = THREE.Math.degToRad( params.camera.fov ); // convert vertical fov to radians
	params.height0 = 2 * Math.tan( vFOV / 2 ) * dist; // visible height
	params.width0 = params.height0 * params.camera.aspect;           // visible width

	// renderer
	if ( Detector.webgl )
		params.renderer = new THREE.WebGLRenderer( {antialias:true} );
	else
		params.renderer = new THREE.CanvasRenderer(); 
	params.renderer.setSize(screenWidth, screenHeight);
	params.container = document.getElementById('ContentContainer');
	params.container.appendChild( params.renderer.domElement );

	// events
	THREEx.WindowResize(params.renderer, params.camera);
	THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });

	// controls
	params.controls = new THREE.TrackballControls( params.camera, params.renderer.domElement );
	if (isMobile){
		params.controls.noPan = true; //disable the pinch+drag for pan on mobile
	}
	params.controls.minDistance = 2.*params.camera.near;
	params.controls.maxDistance = 500.;

	params.controls.dynamicDampingFactor = params.friction;
	params.controls.zoomSpeed = params.zoomSpeed;

	//keyboard
	params.keyboard = new KeyboardState();

	//load in the textures

	//black body texture
	params.bbTex = new THREE.TextureLoader().load( "textures/bb.png" );
	params.bbTex.minFilter = THREE.LinearFilter;

	
	//ESO equirectangle MW texture: https://www.eso.org/public/usa/images/eso0932a/
	params.ESOMWTex = new THREE.TextureLoader().load("textures/eso0932a.jpg" );
	params.ESOMWTex.minFilter = THREE.LinearFilter;

	//for Mercury texture: https://astrogeology.usgs.gov/search/map/Mercury/Messenger/Global/Mercury_MESSENGER_MDIS_Basemap_EnhancedColor_Mosaic_Global_665m?p=1&pb=1#downloads - actual data!
	//for Venus surface and cloud texture: https://maps.jpl.nasa.gov/venus.html - actual data!
	//for Earth, bump, spec, texture: https://www.solarsystemscope.com/textures/
	//for Cloud texture: https://github.com/turban/webgl-earth/tree/master/images
	//for Moon texture: https://astrogeology.usgs.gov/search/map/Moon/Clementine/UVVIS/Lunar_Clementine_UVVIS_750nm_Global_Mosaic_118m_v2 - actual data!
	//for Mars texture: https://maps.jpl.nasa.gov/mars.html - actual data!
	//for Jupiter texture: https://svs.gsfc.nasa.gov/12021 - actual data!
	//for Saturn texture: https://www.solarsystemscope.com/textures/ - artist, based on Cassini image with hexagon at pole 
	//for Saturn rings: https://alpha-element.deviantart.com/art/Stock-Image-Saturn-Rings-393767006 - artist
	//for Uranus texture: http://planetpixelemporium.com/uranus.html - artist 
	//for Uranus rings: https://jcpag2010.deviantart.com/art/Uranus-Rings-558779857 - artist
	//for Neptune texture: https://www.solarsystemscope.com/textures/ - artist
	//for Pluto texture: https://www.nasa.gov/image-feature/pluto-global-color-map - actual data! black part is missing data
	//for Aquarius texture: http://planetpixelemporium.com/mars.html - artist based on Mars moon Deimos
	params.planets[0].tex = new THREE.TextureLoader().load("textures/Mercury_MESSENGER_MDIS_Basemap_EnhancedColor_Mosaic_Global_1024.jpg" );
	params.planets[1].tex = new THREE.TextureLoader().load("textures/venus_clouds_nasa.jpg" );
	//params.planets[1].tex  = new THREE.TextureLoader().load("textures/venus_surface_nasa.jpg" );
	params.planets[2].tex = new THREE.TextureLoader().load("textures/8k_earth_daymap.jpg" );
	params.planets[3].tex = new THREE.TextureLoader().load("textures/mars_nasa.jpg" );
	params.planets[4].tex = new THREE.TextureLoader().load("textures/Hubble_Jupiter_color_global_map_2015a.jpg" );
	params.planets[5].tex = new THREE.TextureLoader().load("textures/2k_saturn_sss.jpg" );
	params.planets[6].tex = new THREE.TextureLoader().load("textures/uranusmap.jpg" );
	params.planets[7].tex = new THREE.TextureLoader().load("textures/2k_neptune.jpg" );
	params.planets[8].tex = new THREE.TextureLoader().load("textures/pluto_color_mapmosaic.jpg" );
	params.planets[9].tex = new THREE.TextureLoader().load("textures/Lunar_Clementine_UVVIS_750nm_Global_Mosaic_1024.jpg" );

	for (var i=0; i<=9; i++){
		params.planets[i].ringTex = null;
		params.planets[i].nightTex = null;
		params.planets[i].specTex = null;
		params.planets[i].bumpTex = null;
		params.planets[i].cloudTex = null;
		params.planets[i].phaseStart = 0;
	}
	params.planets[5].ringTex = new THREE.TextureLoader().load("textures/saturn_rings_concentric.png" );
	params.planets[6].ringTex = new THREE.TextureLoader().load("textures/uranus_rings_concentric.png" );

	//EarthTex = new THREE.TextureLoader().load("textures/2_no_clouds_4k.jpg" );
	params.planets[2].nightTex = new THREE.TextureLoader().load("textures/8k_earth_nightmap.jpg" );
	params.planets[2].bumpTex = new THREE.TextureLoader().load("textures/8k_earth_normal_map.png" );
	params.planets[2].specTex = new THREE.TextureLoader().load("textures/8k_earth_specular_map.png" );
	params.planets[2].cloudTex = new THREE.TextureLoader().load("textures/fair_clouds_4k.png" );
	params.planets[2].phaseStart = 0.5;

	AquariusTex = new THREE.TextureLoader().load("textures/deimosbump.jpg" );

	//stereo
	params.effect = new THREE.StereoEffect( params.renderer );
	params.effect.setAspect(1.);
	params.effect.setEyeSeparation(params.stereoSep);

	params.renderer.autoClear = false;
	params.effect.autoClear = false;

	//for video capture
	params.composer = new THREE.EffectComposer(params.renderer);

	params.camera.up.set(0, 1, 0); //flipped orientation of up, changed -1 to 1

//begin looking at the Earth
	params.cameraTarget = 100;
	//params.controls.target = params.planetPos[params.cameraTarget];
	//params.camera.lookAt(params.planetPos[params.cameraTarget]);
	params.camera.near = params.cameraNear[params.cameraTarget];
	params.controls.minDistance = 2.*params.camera.near;
}





function loadData(){
	
	var data = [];
	d3.json("data/planets.json",  function(x0) {
		//from Allen's Astrophysical Quantities; Note, I changed Earth's year to be exactly 1 so there isn't any confusion in the visualization. The true value is 0.99997862]]
		data.push(x0);

		d3.json("data/asteroids.json",  function(x1) {
			data.push(x1);

			d3.json("data/aquarius.json",  function(x2) {
				data.push(x2);

				loadAquarius(data); //callback and passing along data
			});
		});
	});
}
function loadAquarius(data)
{
		//from https://github.com/mrdoob/three.js/blob/master/examples/webgl_loader_obj.html
	var aquariusMesh
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
		
		aquariusMesh = object;
		WebGLStart(data, aquariusMesh);


	}, onProgress, onError );
}

function WebGLStart(data, aquariusMesh){	
	clearloading();

//initialize
	defineParams(data, aquariusMesh); 
	init();

//initial GUI
	defineGUI();


	if (isMobile){
		resizeMobile();
	}

//draw everything
	drawPlanets();
	drawAquarius();

	drawInnerMilkyWay();
	drawAsteroidOrbitLines();

	drawPlanetOrbitLines();
	drawAquariusOrbitLine();

	drawSun();
	PointLightSun();
	

//begin the animation
	animate();

}

//check for mobile, then resize instructions
//https://stackoverflow.com/questions/3514784/what-is-the-best-way-to-detect-a-mobile-device-in-jquery
// device detection
if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
	|| /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) isMobile = true;

if (isMobile){
	resizeMobile()
}

resizeInstructions();
window.addEventListener("resize", resizeInstructions);
//////this will load the data, and then start the WebGL rendering
loadData();
