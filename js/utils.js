//after the data is loaded, include the buttons
function clearloading(){

	d3.select("#ContentContainer").style("visibility","visible")

	console.log("loaded")
	d3.select("#loaderText").style("display","none")
	d3.select("#loader").style("display","none")
	d3.select(".splashButton").style("display","block")
}	


function resizeMobile(){
	// d3.selectAll(".instructionsTitle").style("font-size", "72px"); 
	// d3.selectAll(".instructionsSubTitle").style("font-size", "60px"); 
	// d3.selectAll(".instructionsContent").style("font-size", "46px"); 
	// d3.selectAll(".splashButton").style("font-size", "30px"); 

	// d3.selectAll(".dg li.title").style("height", "36px");
	// d3.selectAll(".dg li.title").style("font-size", "30px");
	// var d = document.getElementsByClassName("function");
	// for (var i =0; i < d.length; i++){
	// 	var x = d[i].innerHTML.indexOf("Home</span>");
	// 	if (x != -1){
	// 		d[i].style.fontSize = "30px"
	// 		d[i].style.height = "36px" //not sure if this is working
	// 	}
	// }

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
