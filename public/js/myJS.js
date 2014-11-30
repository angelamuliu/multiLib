
// Storing the different views that can be rendered here

var homeNode = "<div id=\"home\">" +
	"<h1>multi<strong>LIB</strong></h1>" +
	"<p>Fill in wacky stories together with your friends online! As a host, you can choose which story template to use and choose from player input, which word goes in the final story. As players, pitch in words as the host asks!</p>" +
	"<button onclick=\"setHost()\" >Host a game!</button>" +
	"<button onclick=\"viewLibs()\" >View old libs</button></div>" +
    "<img id=\"robos\" class=\"slideUp\" src=\"images/robos.png\"/></div>";

var libNode = "<button id=\"return\" onclick=\"returnHome()\">Back</button>";

var usernameNode = "<div id=\"setUsername\"> First time here? What's your name?<br/>" +
    "<input type=\"text\" name=\"username\">" +
	"<button class=\"fitted\"><i class=\"fa fa-check\"></i></button></div>";


// Deals with inserting the username div into the body, sets listeners, etc
function userEnter() {
	var username = localStorage.getItem("username");
	// username has not been set, render the username input box and listener
	if (!username) {
		$("div#record h1").after(usernameNode);
		$('div#setUsername button').click(function() {
			var usernameInput = $("input[name=username]").val();
			if ($.trim(usernameInput) !== '') {
				localStorage.setItem("username", usernameInput);
				$("div#setUsername").remove();
				userEnter();
			}
		})
	} else {
		// username has been set, but provide easy access to resetting
		$("div#record h1").after("<p>Welcome back, " + username + "! </p>");
		$("div#record p").first().append("<button class=\"fitted\"><i class=\"fa fa-undo\"></i></button>");
		$("div#record p:first button").click(function() {
			localStorage.setItem("username", "");
			$("div#record p:first").remove();
			userEnter();
		})
	}
}