//all global variables are now in params object


//defined in WebGLStart, after data is loaded
var params;
function defineParams(data){
	ParamsInit = function(data) {

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

		//radii we need to save in units of AU (?), later all planets are scaled by params.earthRad (is this right?)
		this.earthRad = 1./23481.066;
		this.sRad = 1./215./this.earthRad;
		this.aquariusRad = 0.0000003/this.earthRad;

		//this will hold the data from the input files
		this.planets = data[0];
		this.planets[10] = {"name":"Asteroid", "radius":this.aquariusRad};
		this.planets[100] = {"name":"Sun", "radius":this.sRad};
		this.planets[101] = {"name":"SolarSystem", "radius":this.sRad};
		this.asteroids = data[1];
		this.aquarius = data[2];

		//this holds all the orbit lines
		this.orbitLines = [];

		//various meshes
		this.SunMesh = null;
		this.coronaMesh = null;
		this.MWInnerMesh = null;

		//will hold all the spheres of the planets
		this.movingGroup ={ 0:null,	1:null,	2:null,	3:null,	4:null,	5:null,	6:null,	7:null,	8:null,	9:null};
		this.movingMesh = { 0:[],	1:[],	2:[],	3:[],	4:[],	5:[],	6:[],	7:[],	8:[],	9:[]  };

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
		this.collisionYear = 2017.094;
		this.startYear = this.collisionYear -1.;
		this.Year = this.startYear;
		//this.Year = 2017.0939;
		//var JD0 = 2458060.5; //Nov. 3, 2017
		this.JD0 = 2447892.5; //Jan. 1, 1990
		this.JDtoday = this.JD0 + (this.Year - 1990.);

		//image and video capture
		this.filename = "test.png";
		this.captureWidth = 1024;
		this.captureHeight = 1024;
		this.captureCanvas = false;
		this.videoFramerate = 30;
		this.videoDuration = 2;
		this.videoFormat = 'png';

//Planet locations
		this.SunPos = new THREE.Vector3();
		this.MercuryPos = new THREE.Vector3();
		this.VenusPos = new THREE.Vector3();
		this.EarthPos = new THREE.Vector3();
		this.MoonPos = new THREE.Vector3();
		this.AquariusPos = new THREE.Vector3();
		this.MarsPos = new THREE.Vector3();
		this.JupiterPos = new THREE.Vector3();
		this.SaturnPos = new THREE.Vector3();
		this.UranusPos = new THREE.Vector3();
		this.NeptunePos = new THREE.Vector3();
		this.PlutoPos = new THREE.Vector3();
		this.planetPos = { 0:this.MercuryPos,
							1:this.VenusPos,
							2:this.EarthPos,
							3:this.MarsPos,
							4:this.JupiterPos,
							5:this.SaturnPos,
							6:this.UranusPos,
							7:this.NeptunePos,
							8:this.PlutoPos,
							9:this.MoonPos,
							10:this.AquariusPos,
							100:this.SunPos, 
							101:this.SunPos}

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
		this.cameraNear = {	"0":this.planets[0].radius*this.earthRad, 
							"1":this.planets[1].radius*this.earthRad, 
							"2":this.planets[2].radius*this.earthRad,
							"3":this.planets[3].radius*this.earthRad, 
							"4":this.planets[4].radius*this.earthRad, 
							"5":this.planets[5].radius*this.earthRad, 
							"6":this.planets[6].radius*this.earthRad,
							"7":this.planets[7].radius*this.earthRad,
							"8":this.planets[8].radius*this.earthRad,
							"9":this.planets[9].radius*this.earthRad,
							"10":this.planets[10].radius*this.earthRad,
							"100":this.planets[100].radius*this.earthRad, 
							"101":this.planets[101].radius*this.earthRad}

//Galaxy appearance
		this.MWalpha = 0.5;

//Camera target (number)
		this.cameraTarget = 2 //Earth


//some functions
		this.updateSolarSystem = function() {

			if ((params.Year < params.collisionYear && params.timeStepFac > 0) || (params.Year > params.minYear && params.timeStepFac < 0)){

				params.JDtoday = params.JD0 + (params.Year - 1990.);

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
				params.controls.target = params.planetPos[params.cameraTarget];
				params.camera.lookAt(params.planetPos[params.cameraTarget]);
			} else {
				params.Year = params.collisionYear;
				params.pause = true;
				flashplaystop("#stop");
			}
			

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

		this.updateCameraTarget = function(){

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
			var posTween = new TWEEN.Tween(params.camera.position).to(target, dur).easing(ease)
				.onStart(function(){
					controlsTween.start();
				})
				.onUpdate(function(){
					//in case the planet is moving
					target.x = params.planetPos[params.cameraTarget].x + params.planets[params.cameraTarget].radius*params.earthRad*2.; 
					target.y = params.planetPos[params.cameraTarget].y + params.planets[params.cameraTarget].radius*params.earthRad*2.;
					target.z = params.planetPos[params.cameraTarget].z + params.planets[params.cameraTarget].radius*params.earthRad*2.;
				})

			posTween.start();

		}
		
		this.resetSlider = function(name, gui, value){
			if (gui != null){
				for(var i = 0; i<gui.__controllers.length;i++){
					if( gui.__controllers[i].property == name ) {
						if (Math.sign(value) == -1){
							gui.__controllers[i].__min = value;
						} else {
							gui.__controllers[i].__min = 0.; //NOTE: THIS IS NOT GENERAL, BUT CAN WORK FOR ME HERE
						}
						gui.__controllers[i].setValue(value);
					}
				}
			}
		};
	};

	params = new ParamsInit(data);
}


function defineGUI(){

	params.gui = new dat.GUI({ width: 450 } )
	params.gui.add( params, 'Year', params.minYear, params.collisionYear).listen().onChange(params.updateSolarSystem).name("Year");

	//params.gui.add( params, 'timeStepUnit', { "None": 0, "Hour": (1./8760.), "Day": (1./365.2422), "Year": 1} ).name("Time Step Unit");
	//params.gui.add( params, 'timeStepFac', 0., 100. ).name("Time Step Multiplier");//.listen();
	var target = params.gui.add( params, 'cameraTarget', { "Sun":100, "Mercury":0, "Venus":1, "Earth":2, "Mars":3, "Jupiter":4,"Saturn":5,"Uranus":6,"Neptune":7,"Pluto":8,"Moon":9, "Asteroid":10, "Solar System":101} ).onChange(params.updateCameraTarget).name("Camera Target");
	//so that hitting the space bar doesn't activate the menu!
	target.domElement.addEventListener("keypress", function(event) {
    	event.preventDefault();
	});

	// var params.captureGUI = gui.addFolder('Capture');
	// params.captureGUI.add( params, 'filename');
	// params.captureGUI.add( params, 'captureWidth');
	// params.captureGUI.add( params, 'captureHeight');
	// params.captureGUI.add( params, 'videoDuration');
	// params.captureGUI.add( params, 'videoFramerate');
	// params.captureGUI.add( params, 'videoFormat', {"gif":"gif", "jpg":"jpg", "png":"png"} )
	// params.captureGUI.add( params, 'screenshot');
	// params.captureGUI.add( params, 'recordVideo');


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
	//var zmin = 0.005; //minimum distance from object
	//var zmin = 0.00001;
	var zmin = 1e-7;
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

	for (var i=0; i<9; i++){
		params.planets[i].ringTex = null;
		params.planets[i].nightTex = null;
		params.planets[i].specTex = null;
		params.planets[i].bumpTex = null;
		params.planets[i].cloudTex = null;
	}
	params.planets[5].ringTex = new THREE.TextureLoader().load("textures/saturn_rings_concentric.png" );
	params.planets[6].ringTex = new THREE.TextureLoader().load("textures/uranus_rings_concentric.png" );

	//EarthTex = new THREE.TextureLoader().load("textures/2_no_clouds_4k.jpg" );
	params.planets[2].nightTex = new THREE.TextureLoader().load("textures/8k_earth_nightmap.jpg" );
	params.planets[2].bumpTex = new THREE.TextureLoader().load("textures/8k_earth_normal_map.png" );
	params.planets[2].specTex = new THREE.TextureLoader().load("textures/8k_earth_specular_map.png" );
	params.planets[2].cloudTex = new THREE.TextureLoader().load("textures/fair_clouds_4k.png" );


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





function loadData(callback){
	
	var data = [];
	d3.json("data/planets.json",  function(x0) {
		//from Allen's Astrophysical Quantities; Note, I changed Earth's year to be exactly 1 so there isn't any confusion in the visualization. The true value is 0.99997862]]
		data.push(x0);

		d3.json("data/asteroids.json",  function(x1) {
			data.push(x1);

			d3.json("data/aquarius.json",  function(x2) {
				data.push(x2);

				callback(data);
			});
		});
	});
}


function WebGLStart(data){	
	clearloading();

//initialize
	defineParams(data); 
	init();

//initial GUI
	defineGUI();


	if (isMobile){
		resizeMobile();
	}

//draw everything
	loadAquarius();

	drawPlanets();

	drawInnerMilkyWay();
	drawPlanetOrbitLines();
	drawAquariusOrbitLine();
	drawAsteroidOrbitLines();

	drawSun();
	PointLightSun();
	

//begin the animation
	animate();

}

//check for mobile, then resize instructions
//https://stackoverflow.com/questions/3514784/what-is-the-best-way-to-detect-a-mobile-device-in-jquery
var isMobile = false; //initiate as false
// device detection
if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
	|| /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) isMobile = true;

if (isMobile){
	resizeMobile()
}


//////this will load the data, and then start the WebGL rendering
loadData(WebGLStart);
