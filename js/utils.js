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
//update the width the time slider
function updateTimeSlider(){
	params.timeRect.attr("width",(params.JDtoday - params.JDmin)/(params.JDmax - params.JDmin)*100. + "%")

}
function setTimeFromSlider(d, i){
	var x = d3.mouse(this)[0];
	var xtot = parseFloat(d3.select("#timeSlider").style("width"));
	var JDtoday = THREE.Math.clamp((params.JDmax - params.JDmin)*x/xtot + params.JDmin, params.JDmin, params.JDmax);
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