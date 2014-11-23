
// Storing the different views that can be rendered here

var homeNode = "<div id=\"home\">" +
	"<h1>multi<strong>LIB</strong></h1>" +
	"<p>Fill in wacky stories together with your friends online! As a host, you can choose which story template to use and choose from player input, which word goes in the final story. As players, pitch in words as the host asks!</p>" +
	"<button onclick=\"setHost()\" >Host a game!</button>" +
	"<button onclick=\"viewLibs()\" >View old libs</button></div>" +
    "<img id=\"robos\" src=\"images/robos.png\"/></div>";

var libNode = "<div class=\"lib_container\" id=\"0\"></div>" +
	"<div class=\"lib_container\" id=\"1\"></div>" +
	"<button id=\"return\" onclick=\"returnHome()\">Back</button>";
