//after the data is loaded, include the buttons
function clearloading(){

	d3.select("#ContentContainer").style("visibility","visible")

	console.log("loaded")
	d3.select("#loader").style("display","none")
	d3.select("#loaderText").style("display","none")

}


function resizeMobile(){
	d3.selectAll(".instructionsTitle").style("font-size", "72px"); 
	d3.selectAll(".instructionsSubTitle").style("font-size", "60px"); 
	d3.selectAll(".instructionsContent").style("font-size", "46px"); 
	d3.selectAll(".splashButton").style("font-size", "30px"); 

	d3.selectAll(".dg li.title").style("height", "36px");
	d3.selectAll(".dg li.title").style("font-size", "30px");
	var d = document.getElementsByClassName("function");
	for (var i =0; i < d.length; i++){
		var x = d[i].innerHTML.indexOf("Home</span>");
		if (x != -1){
			d[i].style.fontSize = "30px"
			d[i].style.height = "36px" //not sure if this is working
		}
	}

}

//hide the splash screen
function hideSplash(id){

    var fdur = 700.;

    var splash = d3.select(id);

    splash.transition()
        .ease(d3.easeLinear)
        .duration(fdur)
        .style("opacity", 0)

        .on("end", function(d){
            splash.style("display","none");
        })

	removeTooltips();
    if (showTooltips){
    	attachTooltips();
    }
}
