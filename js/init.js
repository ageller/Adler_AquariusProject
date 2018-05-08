//all global variables

var container, scene, MWscene, MWInnerScene, camera, renderer, controls, effect, composer, capturer;
var keyboard = new KeyboardState();

var c3 = "red"
//var c2 = "blue"
var c2 = "deepskyblue"
var c1 = "orange"
var c4 = "purple"
var pcolors = {"Mercury":c1, "Venus":c1, "EarthMoon":c2, "Mars":c1, "Jupiter":c3, "Saturn":c3, "Uranus":c3, "Neptune":c3, "Pluto":c4}

//var JD0 = 2458060.5; //Nov. 3, 2017
var JD0 = 2447892.5; //Jan. 1, 1990

var AUfac = 206264.94195722;

var planets;
var asteroids;
var aquarius;

var orbitLines = [];
var MoonOrbitLines = [];
var SunMesh;
var coronaMesh;
var MWInnerMesh;
var MovingCloudMesh;
var MovingEarthMesh;
var MovingMoonMesh;
var MovingEarthCloud;
var MovingJupiterMesh;
var MovingJupiter;
var MovingMarsMesh;
var MovingMars;
var MovingVenusMesh;
var MovingVenusCloudMesh;
var MovingVenusCloud;
var MovingMercuryMesh;
var MovingMercury;
var MovingSaturnMesh;
var MovingSaturnRingMesh;
var MovingSaturn;
var MovingUranusMesh;
var MovingUranusRingMesh;
var MovingUranus;
var MovingNeptuneMesh;
var MovingNeptune;
var MovingPlutoMesh;
var MovingPluto;
var MovingAquariusMesh;
var MovingAquarius;

var SSrotation = new THREE.Vector3(THREE.Math.degToRad(-63.), 0., 0.); //solar system is inclined at 63 degrees to galactic plane

var SunR0;

var iLength;
var bbTex;
var MWTex;
var ESOMWTex;
var EarthTex;
var EarthBump;
var EarthSpec;
var CloudTex;
var JupiterTex;
var MarsTex;
var VenusTex;
var VenusCloudTex;
var MercuryTex;
var SaturnTex;
var SaturnRingTex;
var UranusTex;
var UranusRingTex;
var NeptuneTex;
var PlutoTex;
var AquariusTex;
var MoonTex;
var camDist = 1.;
var camDist0 = 1.;
var camPrev = 1.;
var width0 = 1.;
var height0 = 1.;

var loaded = false;

//defined in WebGLStart, after data is loaded
var ParamsInit;
var params;

var gui = null;
var basicGUI = null;
var legendGUI = null;



function init() {
	// scene
	scene = new THREE.Scene();
	MWscene = new THREE.Scene();
	MWInnerScene = new THREE.Scene();

	// camera
	var screenWidth = window.innerWidth;
	var screenHeight = window.innerHeight;
	var fov = 45;
	var aspect = screenWidth / screenHeight;
	//var zmin = 0.005; //minimum distance from object
	var zmin = 0.00001;
	var zmax = 5.e10;
	camera = new THREE.PerspectiveCamera( fov, aspect, zmin, zmax);
	scene.add(camera);
	MWscene.add(camera);
	MWInnerScene.add(camera);

	camera.position.set(0,0,0); //Earth view

	//camera.position.set(0,0,50); //SS view
	//camera.position.set(0,0,1.8e10); //MW view

	camDist = CameraDistance();
	camDist0 = CameraDistance();
	camera.lookAt(scene.position);	

	var dist = scene.position.distanceTo(camera.position);
	var vFOV = THREE.Math.degToRad( camera.fov ); // convert vertical fov to radians
	height0 = 2 * Math.tan( vFOV / 2 ) * dist; // visible height
	width0 = height0 * camera.aspect;           // visible width

	// renderer
	if ( Detector.webgl )
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	else
		renderer = new THREE.CanvasRenderer(); 
	renderer.setSize(screenWidth, screenHeight);
	container = document.getElementById('ContentContainer');
	container.appendChild( renderer.domElement );

	// events
	THREEx.WindowResize(renderer, camera);
	THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });

	// controls
	controls = new THREE.TrackballControls( camera, renderer.domElement );
	controls.minDistance = 2.*zmin;
	controls.maxDistance = 500.;

	controls.dynamicDampingFactor = params.friction;
 	controls.zoomSpeed = params.zoomSpeed;

	//load in the textures

	//black body texture
	bbTex = new THREE.TextureLoader().load( "textures/bb.png" );
	bbTex.minFilter = THREE.LinearFilter;

	
	//ESO equirectangle MW texture: https://www.eso.org/public/usa/images/eso0932a/
	ESOMWTex = new THREE.TextureLoader().load("textures/eso0932a.jpg" );
	ESOMWTex.minFilter = THREE.LinearFilter;

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
	MercuryTex = new THREE.TextureLoader().load("textures/Mercury_MESSENGER_MDIS_Basemap_EnhancedColor_Mosaic_Global_1024.jpg" );
	VenusTex = new THREE.TextureLoader().load("textures/venus_surface_nasa.jpg" );
	VenusCloudTex = new THREE.TextureLoader().load("textures/venus_clouds_nasa.jpg" );
	//EarthTex = new THREE.TextureLoader().load("textures/2_no_clouds_4k.jpg" );
	EarthTex = new THREE.TextureLoader().load("textures/8k_earth_daymap.jpg" );
	EarthBump = new THREE.TextureLoader().load("textures/8k_earth_normal_map.tif" );
	EarthSpec = new THREE.TextureLoader().load("textures/8k_earth_specular_map.tif" );
	CloudTex = new THREE.TextureLoader().load("textures/fair_clouds_4k.png" );
	MoonTex = new THREE.TextureLoader().load("textures/Lunar_Clementine_UVVIS_750nm_Global_Mosaic_1024.jpg" );
	MarsTex = new THREE.TextureLoader().load("textures/mars_nasa.jpg" );
	JupiterTex = new THREE.TextureLoader().load("textures/Hubble_Jupiter_color_global_map_2015a.jpg" );
	SaturnTex = new THREE.TextureLoader().load("textures/2k_saturn_sss.jpg" );
	SaturnRingTex = new THREE.TextureLoader().load("textures/saturn_rings_concentric.png" );
	UranusTex = new THREE.TextureLoader().load("textures/uranusmap.jpg" );
	UranusRingTex = new THREE.TextureLoader().load("textures/uranus_rings_concentric.png" );
	NeptuneTex = new THREE.TextureLoader().load("textures/2k_neptune.jpg" );
	PlutoTex = new THREE.TextureLoader().load("textures/pluto_color_mapmosaic.jpg" );
	AquariusTex = new THREE.TextureLoader().load("textures/deimosbump.jpg" );

	//stereo
	effect = new THREE.StereoEffect( renderer );
	effect.setAspect(1.);
	effect.setEyeSeparation(params.stereoSep);

	renderer.autoClear = false;
	effect.autoClear = false;
	params.renderer = renderer;

	//for video capture
	composer = new THREE.EffectComposer(params.renderer);

	camera.up.set(0, -1, 0);

}
//to allow me to disable parts of the gui
//https://stackoverflow.com/questions/24461964/method-for-disabling-a-button-in-dat-gui
function getController(gui, object, property)
{
  for (var i = 0; i < gui.__controllers.length; i++)
  {
    var controller = gui.__controllers[i];
    if (controller.object == object && controller.property == property)
      return controller;
  }
  return null;
}
function blockEvent(event)
{
  event.stopPropagation();
}

Object.defineProperty(dat.controllers.FunctionController.prototype, "disabled", {
  get: function()
  {
    return this.domElement.hasAttribute("disabled");
  },
  set: function(value)
  {
    if (value)
    {
      this.domElement.setAttribute("disabled", "disabled");
      this.domElement.addEventListener("click", blockEvent, true);
    }
    else
    {
      this.domElement.removeAttribute("disabled");
      this.domElement.removeEventListener("click", blockEvent, true);
    }
  },
  enumerable: true
});
//https://stackoverflow.com/questions/18085540/remove-folder-in-dat-gui
dat.GUI.prototype.removeFolder = function(name) {
	var folder = this.__folders[name];
	if (!folder) {
	return;
	}
	folder.close();
	this.__ul.removeChild(folder.domElement.parentNode);
	delete this.__folders[name];
	this.onResize();
}



function defineParams(){

	ParamsInit = function() {
		this.fullscreen = function() { THREEx.FullScreen.request() };
		this.resetCamera = function() { controls.reset(); 	camera.up.set(0, -1, 0)};
		this.renderer = null;
		this.stereo = false;
		this.friction = 0.2;
		this.zoomSpeed = 1.;
		this.stereoSep = 0.064;

		this.pause = false; //toggles pausing time evolution on/off with space bar

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
		this.sRad = 1./215.;
		this.sTeff = 5780*0.8;
		//central temperature for exaggerating the colors
		this.smTeff = 5780.;
		//factor to exagerate color (set to 1 for no exageration)
		this.Teffac = 1.0;

		//Planetary radii
		this.earthRad = 1./23481.066;
		this.cloudRad = this.earthRad * 1.01; 
		this.jupiterRad = this.earthRad * 11.209;
		this.marsRad = this.earthRad * 0.53;

		//time controls
		this.timeStepUnit = 0.;
		this.timeStepFac = 1.;
		this.saveTimeStepFac = 1.;
		this.timeStep = parseFloat(this.timeStepUnit)*parseFloat(this.timeStepFac);
		//this.Year = 2017.101; //roughly Feb 6, 2017
		//this.Year = 2017.10137;
		//gets us closer to intersection, but might not be exactly correct time
		this.Year = 2017.094; 
		//this.Year = 2017.0939;

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
		this.PlanetsPos = { 0:this.MercuryPos,
							1:this.VenusPos,
							2.:this.EarthPos,
							3:this.MarsPos,
							4:this.JupiterPos,
							5:this.SaturnPos,
							6:this.UranusPos,
							7:this.NeptunePos,
							8:this.PlutoPos,
							9:this.MoonPos,
							10:this.AquariusPos,
							100:this.SunPos, }
//Galaxy appearance
		this.MWalpha = 0.7;

//Camera target (number)
		this.cameraTarget = 2 //Earth

//some functions
		this.updateSolarSystem = function() {

			clearPlanetOrbitLines();
			drawPlanetOrbitLines();
			drawAquariusOrbitLine();

			clearSun();
			drawSun();
		
			clearEarth();
			drawEarth();

			clearJupiter();
			drawJupiter();

			clearMars();
			drawMars();
	
			clearVenus();
			drawVenus();

			clearMercury();
			drawMercury();

			clearSaturn();
			drawSaturn();

			clearUranus();
			drawUranus();

			clearNeptune();
			drawNeptune();

			clearPluto();
			drawPluto();
		
			clearAquarius();
			drawAquarius();

			clearMoonOrbitLines();
			drawMoonOrbitLines();

		};
	


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
				camera.aspect = params.captureWidth / params.captureHeight;;
				camera.updateProjectionMatrix();
				myRender();

				//save image
				imgData = params.renderer.domElement.toDataURL(strMime);
				saveFile(imgData.replace(strMime, strDownloadMime), params.filename);

				//back to original size
				params.renderer.setSize(screenWidth, screenHeight);
				camera.aspect = aspect;
				camera.updateProjectionMatrix();
				myRender();

			} catch (e) {
				console.log(e);
				return;
			}

		}

		this.recordVideo = function(){

			params.captureCanvas = true;
			capturer = new CCapture( { 
				format: params.videoFormat, 
				workersPath: 'resources/CCapture/',
				framerate: params.videoFramerate,
				name: params.filename,
				timeLimit: params.videoDuration,
				autoSaveTime: params.videoDuration,
				verbose: true,
			} );

			capturer.start();

		}

		this.updateCameraTarget = function(){

			controls.target = params.PlanetsPos[params.cameraTarget];
			camera.lookAt(params.PlanetsPos[params.cameraTarget]);	
		}

	};

	params = new ParamsInit();
}


function defineGUI(){

	gui = new dat.GUI({ width: 450 } )
	//gui.add( params, 'Year', 1990, 3000).listen().onChange(params.updateSolarSystem).name("Year");;
	gui.add( params, 'Year', 1990, 2018).listen().onChange(params.updateSolarSystem).name("Year");;
	gui.add( params, 'timeStepUnit', { "None": 0, "Hour": (1./8760.), "Day": (1./365.2422), "Year": 1} ).name("Time Step Unit");
	gui.add( params, 'timeStepFac', 0., 100. ).name("Time Step Multiplier");//.listen();
	gui.add( params, 'cameraTarget', { "Sun":100, "Mercury":0, "Venus":1, "Earth":2, "Moon":9, "Asteroid":10, "Mars":3, "Jupiter":4,"Saturn":5,"Uranus":6,"Neptune":7,"Pluto":8 } ).onChange(params.updateCameraTarget).name("Camera Target");

	var captureGUI = gui.addFolder('Capture');
	captureGUI.add( params, 'filename');
	captureGUI.add( params, 'captureWidth');
	captureGUI.add( params, 'captureHeight');
	captureGUI.add( params, 'videoDuration');
	captureGUI.add( params, 'videoFramerate');
	captureGUI.add( params, 'videoFormat', {"gif":"gif", "jpg":"jpg", "png":"png"} )
	captureGUI.add( params, 'screenshot');
	captureGUI.add( params, 'recordVideo');


}

function loadData(callback){
	

	d3.json("data/planets.json",  function(x0) {
		//from Allen's Astrophysical Quantities; Note, I changed Earth's year to be exactly 1 so there isn't any confusion in the visualization. The true value is 0.99997862]]
		planets = x0;

		d3.json("data/asteroids.json",  function(x1) {
			asteroids = x1;

			d3.json("data/aquarius.json",  function(x2) {
				aquarius = x2;

				callback();
			});
		});
	});
}


function WebGLStart(){	
	
	clearloading();

//initialize
	defineParams(); 
	init();

//initial GUI
	defineGUI();


	if (isMobile){
		resizeMobile();
	}

//draw everything
	drawInnerMilkyWay();
	drawPlanetOrbitLines();
	drawAquariusOrbitLine();
	drawAsteroidOrbitLines();
	drawSun();
	drawEarth();
	drawJupiter();
	drawMars();
	drawVenus();
	drawMercury();
	drawSaturn();
	drawUranus();
	drawNeptune();
	drawPluto();
	drawAquarius();
	drawMoonOrbitLines();
	PointLightSun();

//begin looking at the Earth
	controls.target = params.EarthPos;
	camera.lookAt(params.EarthPos);	

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
