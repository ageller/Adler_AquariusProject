//after the data is loaded, include the buttons
function clearloading(){

	d3.select("#ContentContainer").style("visibility","visible")

	console.log("loaded")
	d3.select("#loaderText").style("display","none")
	d3.select("#loader").style("display","none")
	d3.select(".splashButton").style("display","block")
}	


function resizeMobile(){
	d3.selectAll(".dropdown-content").style("width", "250px")
	d3.selectAll(".dropdown-content").selectAll("div")
		.style("font-size", "36px")
		.style("height", "40px")
		.style("width", "250px")
}

//hide the splash screen
function hideSplash(id){
	d3.select('#help').classed('clickedControl', false);		

	var fdur = 700.;

	var splash = d3.select(id);

	splash.transition()
		.ease(d3.easeLinear)
		.duration(fdur)
		.style("opacity", 0)

		.on("end", function(d){
			splash.style("display","none");
		})


}
//show the splash screen
function showSplash(id, op = 0.6){
	d3.select('#help').classed('clickedControl', true);		

	var fdur = 700.;

	var splash = d3.select(id);

	splash.style("display","block");

	splash.transition()
		.ease(d3.easeLinear)
		.duration(fdur)
		.style("background-color", 'rgba(0,0,0,'+op+')')
		.style("opacity", 1);

}

function setTimeFromSlider(d, i){
	var x = d3.mouse(this)[0];
	var xtot = parseFloat(d3.select("#timeSlider").style("width"));
	var frac = THREE.Math.clamp(x/xtot, 0, 1);
	var JDtoday = (params.JDmax - params.JDmin)*frac+ params.JDmin;
	params.Year = JDtoday - params.JD0 + 1990;
	params.updateSolarSystem();
}
//resize the instructions if window size changes
function resizeInstructions(){

	var screenWidth = window.innerWidth;
	var screenHeight = window.innerHeight;

	d3.select("#myInstructions").style("height",screenHeight - 160);
	istr = d3.select("#myInstructions").node().getBoundingClientRect();

	d3.select("#titleLeft").style("width",parseFloat(istr.width) - 120);
	tl = d3.select('#titleLeft').node().getBoundingClientRect();
	d3.select(".splashButton").style("height",parseFloat(tl.height));

	d3.select("#timeSlider").style("width",screenWidth - 504);

}

//https://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript
//plus my addition for float
function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  length = n.length;
  if (n.indexOf('.') > 0){
  	length = n.indexOf('.')
  }
  return length >= width ? n : new Array(width - length + 1).join(z) + n;
}
//convert a decimal year into a normal format
//2016 was a leap year
function convertYear(year){
	var Yi = Math.floor(year);
	var days = (year - Yi)*365.25;

	var monthDay =     {"Jan":31,"Feb":28, "Mar":31, "Apr":30, "May":31, "Jun":30, "Jul":31, "Aug":31, "Sep":30, "Oct":31, "Nov":30, "Dec":31};
	if (Yi == 2016){
		var monthDay = {"Jan":31,"Feb":29, "Mar":31, "Apr":30, "May":31, "Jun":30, "Jul":31, "Aug":31, "Sep":30, "Oct":31, "Nov":30, "Dec":31}
	}
	var cumDays = 0.;
	var sub = 0.;
	var month;
	for (var key in monthDay) {
		if (days > cumDays){
			month = key;
			sub = monthDay[key]
		} else{
			break;
		}
		cumDays += monthDay[key]
	}
	cumDays -= sub;

	var day = days - cumDays;
	var di = Math.floor(day);
	var hour = (day - di)*24.;
	var hi = Math.floor(hour);
	var min = (hour - hi)*60.;
	var mi = Math.floor(min);
	var sec = parseFloat(((min - mi)*60.).toFixed(2));
	var si = Math.floor(sec);

	//console.log(params.Year, Yi, days, month, cumDays, day, di, hour, hi, min, mi, sec, si);
	return(month+' '+di+', '+Yi+' '+pad(hi, 2)+':'+pad(mi,2)+':'+pad(sec, 2));

	//,parseTime(2017)); 

}
//update the width the time slider
function updateTimeSlider(){
	printDate = convertYear(params.Year);
	params.timeRect.attr("width",(params.Year - params.startYear)/(params.collisionYear - params.startYear)*100. + "%")

	params.timeText.text(printDate)

}

//for moving the impact circle
function screenXY(obj){

	var vector = obj.clone();
	var widthHalf = (window.innerWidth/2.);
	var heightHalf = (window.innerHeight/2.);

	vector.project(params.camera);

	vector.x = ( vector.x * widthHalf ) + widthHalf;
	vector.y = - ( vector.y * heightHalf ) + heightHalf;


	display = "block";
	if (vector.x > 2.*widthHalf || vector.y > 2.*heightHalf){
		display = "none";
	}

	screenXYcheck = true;
	if (vector.z > 1){
		screenXYcheck = false;
	}


	return {"pos":vector, "screenXYcheck":screenXYcheck, "display":display};
}
function visibleSizeAtZDepth(depth){
	// compensate for cameras not positioned at z=0
	var cameraOffset = params.camera.position.z;
	if ( depth < cameraOffset ){
		depth -= cameraOffset;
	} else {
		depth += cameraOffset;
	}
	// vertical fov in radians
	var vFOV = params.camera.fov * Math.PI / 180; 

	// Math.abs to ensure the result is always positive
	var width =  2 * Math.tan( vFOV / 2 ) * Math.abs( depth );
	var height = width * params.camera.aspect;

	return {"width":width, "height":height}
};

function moveImpactCircle(pos = null){

	screenXYcheck = false;
	display = "block";
	size = 50;
	if (pos == null){
		xx = screenXY(params.AquariusPos);
		pos = xx.pos;
		screenXYcheck = xx.screenXYcheck;
		display = xx.display;
	}
	//don't show circle if nearby
	if (pos.z < 0.97){
		display = "none"
	}

	var c = d3.select("#impactCircle").style('display',display);
	if (screenXYcheck){
		c.style("top",pos.y - parseFloat(c.style("height"))/2.);
		c.style("left", pos.x - parseFloat(c.style("width"))/2.);

	}
}
function showImpactCircle(e, pageX = null, pageY = null){

	if (pageX == null) pageX = e.pageX;
	if (pageY == null) pageY = e.pageY;

	d3.select("#impactCircle")
		.style("display","block")
		.style("opacity", 1.);
}