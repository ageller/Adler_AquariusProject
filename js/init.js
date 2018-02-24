//all global variables

var container, scene, MWscene, MWInnerScene, camera, renderer, controls, effect;
var keyboard = new KeyboardState();

var c3 = "red"
var c2 = "blue"
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
var SunMesh;
var coronaMesh;
var MWInnerMesh;

var SSrotation = new THREE.Vector3(THREE.Math.degToRad(-63.), 0., 0.); //solar system is inclined at 63 degrees to galactic plane

var SunR0;

var iLength;
var bbTex;
var MWTex;
var ESOMWTex;

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
	var zmin = 0.01;
	var zmax = 5.e10;
	camera = new THREE.PerspectiveCamera( fov, aspect, zmin, zmax);
	scene.add(camera);
	MWscene.add(camera);
	MWInnerScene.add(camera);

	camera.position.set(0,0,50); //SS view

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


	//stereo
	effect = new THREE.StereoEffect( renderer );
	effect.setAspect(1.);
	effect.setEyeSeparation(params.stereoSep);

	renderer.autoClear = false;
	effect.autoClear = false;
	params.renderer = renderer;

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

		//time controls
		this.timeStepUnit = 0.;
		this.timeStepFac = 1.;
		this.saveTimeStepFac = 1.;
		this.timeStep = parseFloat(this.timeStepUnit)*parseFloat(this.timeStepFac);
		this.Year = 2017.101; //roughly Feb 6, 2017



//Galaxy appearance
		this.MWalpha = 0.7;

//some functions
		this.updateSolarSystem = function() {

			clearPlanetOrbitLines();
			drawPlanetOrbitLines();
			drawAquariusOrbitLine();

			clearSun();
			drawSun();

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


	};

	params = new ParamsInit();
}


function defineGUI(){

	gui = new dat.GUI({ width: 450 } )
	gui.add( params, 'Year', 1990, 3000).listen().onChange(params.updateSolarSystem).name("Year");;
	gui.add( params, 'timeStepUnit', { "None": 0, "Hour": (1./8760.), "Day": (1./365.2422), "Year": 1} ).name("Time Step Unit");
	gui.add( params, 'timeStepFac', 0, 100 ).name("Time Step Multiplier");//.listen();

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
