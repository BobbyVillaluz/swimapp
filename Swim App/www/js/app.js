var raceNumber;
var regArr = ['200 Medley Relay',
'200 Freestyle',
'200 IM',
'50 Freestyle',
'100 Fly',
'100 Free',
'500 Free',
'200 Free Relay',
'100 Back',
'100 Breast',
'400 Free Relay'
];
var bothArr = ['Boys 200 Medley Relay',
'Girls 200 Medley Relay',
'Boys 200 Freestyle',
'Girls 200 Freestyle',
'Boys 200 IM',
'Girls 200 IM',
'Boys 50 Freestyle',
'Girls 50 Freestyle',
'Boys 100 Fly',
'Girls 100 Fly',
'Boys 100 Free',
'Girls 100 Free',
'Boys 500 Free',
'Girls 500 Free',
'Boys 200 Free Relay',
'Girls 200 Free Relay',
'Boys 100 Back',
'Girls 100 Back',
'Boys 100 Breast',
'Girls 100 Breast',
'Boys 400 Free Relay',
'Girls 400 Free Relay'
];
var places = []; //Array of places for each lane in this race
var placesAdjusted = []; //Array of places adjusted when one or more lanes have been DQ'ed
var scores = []; //Stores the score before each race to allow manual score editing
var lockedRaces = []; //Races that have been manually edited and all the races preceding it are locked from further changes
var meetType; //Whether it's "both", "boys" or "girls"

//Set the meet type based on which teams are racing (i.e. boys, girls or both)
if (localStorage.getItem('blnGirls') == 'true' && localStorage.getItem('blnBoys') == 'true') meetType = "both";
else if (localStorage.getItem('blnGirls') == 'true') meetType = "girls";
else if (localStorage.getItem('blnBoys') == 'true') meetType = "boys";

$body = $("body");

function init(){ // Initial Configuration
	$body.addClass("loading");
	var blnBoys = false, blnGirls = false;
	var whoRacing = $('input[name=gender]:checked').val();
	switch(whoRacing){
		case 'girl':
			blnGirls = true;
			break;
		case 'boy':
			blnBoys = true;
			break;
		case 'both':
			blnBoys = true;
			blnGirls = true;
			break;
	}
	var oppTeamName = $("#teamName").val()
	raceNumber = 0;
	localStorage.setItem('raceNumber', raceNumber);
	localStorage.setItem('trueRaceNumber', raceNumber);
	localStorage.setItem('blnBoys', blnBoys);
	localStorage.setItem('blnGirls', blnGirls);
	localStorage.setItem('oppTeamName',oppTeamName);
	var laneType = $('input[name=laneType]:checked').val();		// All init values
	localStorage.setItem('laneType', laneType);
	var numLanes = $('select[name=numLanes]').val();
	localStorage.setItem('numLanes', numLanes);
	
	//Set the meet type based on which teams are racing (i.e. boys, girls or both)
	if (localStorage.getItem('blnGirls') == 'true' && localStorage.getItem('blnBoys') == 'true') meetType = "both";
	else if (localStorage.getItem('blnGirls') == 'true') meetType = "girls";
	else if (localStorage.getItem('blnBoys') == 'true') meetType = "boys";
	
	//Create a slot in the array for each race to store the meet score up until that race (allows manual editing of score)
	var numOfRaces;
	if (meetType == "both") numOfRaces = 22;
	else numOfRaces = 11;
	for (i = 0; i < numOfRaces; i++) {
		scores.push("");
		lockedRaces.push("false");
	}
	
	localStorage.setItem("scores", JSON.stringify(scores)); //Store the array scores in local storage
	localStorage.setItem("lockedRaces", JSON.stringify(lockedRaces)); //Store the array lockedRaces in local storage
	
	//Initialize score variables for boys and girls if they are competing
	if (blnBoys) {
		localStorage.setItem('boysHomeScore', 0);
		localStorage.setItem('boysOtherScore' , 0);
	}
	
	if (blnGirls) {
		localStorage.setItem('girlsHomeScore', 0);
		localStorage.setItem('girlsOtherScore', 0);
	}
	
	localStorage.setItem('isModifying', 'false'); //Reset isModifying variable
	
	window.location = 'results.html';

}

var currentRace; //Whether the current race being recorded is "girls" or "boys"
var boysHomeScore;
var boysOtherScore;
var girlsHomeScore;
var girlsOtherScore;
var isLocked = "false";

//Have any scores been manually edited since the last time processResults ran?
var boysHomeEdited = "false";
var girlsHomeEdited = "false";
var boysOtherEdited = "false";
var girlsOtherEdited = "false";

function resultsBodyLoad(){
	$body.removeClass("loading"); //Hide loading icon
	//Create array of places
	for (i = 0; i < parseInt(localStorage.getItem('numLanes')); i++) {
		places.push("0");
	}

	if (localStorage.getItem("isModifying") == "true") raceNumber = parseInt(localStorage.getItem('raceNumber'));
	else raceNumber = parseInt(localStorage.getItem('trueRaceNumber')); //If a meet is being resumed, you want to load the race where you left off, not the one you just modified
	
	//Whether the current race is boys or girls
	if ((meetType == "both" && raceNumber % 2 == 0) || meetType == "boys") currentRace = "boys";
	else currentRace = "girls";
	
	//Load scores array from local storage
	scores = JSON.parse(localStorage.getItem("scores"));
	lockedRaces = JSON.parse(localStorage.getItem("lockedRaces"));
	console.log(lockedRaces);
	
	if (localStorage.getItem('isModifying') == 'false') {
		//Load the current score variables based on what type (boys or girls) of race this is
		if (meetType == 'both'){		// Added this for both race
			boysHomeScore = localStorage.getItem("boysHomeScore");
			boysOtherScore = localStorage.getItem("boysOtherScore");
			girlsHomeScore = localStorage.getItem("girlsHomeScore");
			girlsOtherScore = localStorage.getItem("girlsOtherScore");
		}
		else{
			if (currentRace == "boys") {
				boysHomeScore = localStorage.getItem("boysHomeScore");
				boysOtherScore = localStorage.getItem("boysOtherScore");
			}
			else {
				girlsHomeScore = localStorage.getItem("girlsHomeScore");
				girlsOtherScore = localStorage.getItem("girlsOtherScore");
			}
		}
		//Store starting score in scores array to allow manual editing		
		if (meetType == "both"){	
			if (raceNumber == '0' || raceNumber == '1'){
				scores[raceNumber] = "0,0";
			}
			else{
				if (currentRace == "boys") {		// For Both!!!
					scores[raceNumber] = girlsHomeScore + "," + girlsOtherScore;
				}
				
				else if (currentRace == "girls") {
					scores[raceNumber] = boysHomeScore + "," + boysOtherScore;
				}
			}
		}
		else{
			if (currentRace == "boys") {
				scores[raceNumber] = boysHomeScore + "," + boysOtherScore;
			}
			
			else if (currentRace == "girls") {
				scores[raceNumber] = girlsHomeScore + "," + girlsOtherScore;
			}
		}
	}
	
	if (localStorage.getItem('isModifying') == 'true' && lockedRaces[raceNumber] == "true") { //If this race is locked
		//Load the current score variables based on what type (boys or girls) of race this is
		var score = scores[raceNumber + 1].split(',');
		if (currentRace == "boys") {
			boysHomeScore = parseInt(score[0]);
			boysOtherScore = parseInt(score[1]);
		}
		else {
			girlsHomeScore = parseInt(score[0]);
			girlsOtherScore = parseInt(score[1]);
		}
	}
	
	if (localStorage.getItem('blnBoys') == 'true' && localStorage.getItem('blnGirls') == 'true'){
		$("#race").html(bothArr[raceNumber]);
	}
	else{
		$("#race").html(regArr[raceNumber]);
	}
	var numLanes = localStorage.getItem('numLanes');
	
	for (i = 0; i < parseInt(numLanes); i++){	// This is the lane chooser
		if (screen.availWidth < 768) { //Mobile
			$("#results").append('<svg width="42" height="200">' + '<rect id ="' +  (i+1) + '" width="42" height="200" style="display:inline; fill:rgb(92,179,255);stroke-width:3;stroke:rgb(0,0,0);position:relative" data-toggle="modal" data-target=".bs-example-modal-lg"/>'+
			'<text style="font-size: 20px; font-weight: bold;" x="15" y="180">' + (i+1) + '</text>' +
			'<text id="lane' + (i+1) + '"; style="font-size: 18px; color: white" x="13" y="30"></text>' +
			'</svg>');
		}
		
		else { //Tablet
			$("#results").append('<svg width="70" height="400">' + '<rect id ="' +  (i+1) + '" width="70" height="400" style="display:inline; fill:rgb(92,179,255);stroke-width:5;stroke:rgb(0,0,0);position:relative" data-toggle="modal" data-target=".bs-example-modal-lg"/>'+
			'<text style="font-size: 40px; font-weight: bold;" x="22" y="360">' + (i+1) + '</text>' +
			'<text id="lane' + (i+1) + '"; style="font-size: 32px; color: white" x="8" y="50"></text>' +
			'</svg>');
		}
		
		$("body").append('<script>' + 
		'$( "rect#' +(i+1)+'").click(function() {' +
		'laneClicked('+(i+1)+')'+
		'});  '+
		'</script>');
	}
	
	//Add button controls
	$("#results").append("<br>"); //Line break
	if (lockedRaces[raceNumber] == "true") isLocked = "true"; 
	
	//Load score compiled from previous races in the meet (or 0 if this is the first race)
	
	if (localStorage.getItem('blnGirls') == 'true' && localStorage.getItem('blnBoys') == 'true') {
		race=bothArr[raceNumber];
		//This race is boys if it's even
		if (raceNumber % 2 == 0) $("#results").append('<h3>Home Boys Score: <span id="boysHomeRunning" contenteditable="true">' + boysHomeScore + '</span><br>' + localStorage.getItem('oppTeamName') + ' Boys Score: <span id="boysOtherRunning" contenteditable="true">' + boysOtherScore + '</span></h3>'); //Display score for rbr and other boys teams
		
		//Otherwise the race is a girls race
		else $("#results").append('<h3>Home Girls Score: <span id="girlsHomeRunning" contenteditable="true">' + girlsHomeScore + '</span><br>' + localStorage.getItem('oppTeamName') + ' Girls Score: <span id="girlsOtherRunning" contenteditable="true">' + girlsOtherScore + '</span></h3>'); //Display score for rbr and other girls teams
	}
	
	else if (localStorage.getItem('blnBoys') == 'true') { //Just boys meet
		race = 'boys' + regArr[raceNumber];
		$("#results").append('<h3>Home Boys Score: <span id="boysHomeRunning" contenteditable="true">' + boysHomeScore + '</span><br>' + localStorage.getItem('oppTeamName') + ' Boys Score: <span id="boysOtherRunning" contenteditable="true">' + boysOtherScore + '</span></h3>');
	}
	
	else if (localStorage.getItem('blnGirls') == 'true') { //Just girls meet
		race = 'girls' + regArr[raceNumber];
		$("#results").append('<h3>Home Girls Score: <span id="girlsHomeRunning" contenteditable="true">' + girlsHomeScore + '</span><br>' + localStorage.getItem('oppTeamName') + ' Girls Score: <span id="girlsOtherRunning" contenteditable="true">' + girlsOtherScore + '</span></h3>');
	}
	
	if (localStorage.getItem('isModifying') == "false" || lockedRaces[raceNumber] == "true") { //If the race is locked, disable any further modification
		if (localStorage.getItem('blnGirls') == 'true' && localStorage.getItem('blnBoys') == 'true') {
			//This race is boys if it's even
			if (raceNumber % 2 == 0) {
				document.getElementById("boysHomeRunning").setAttribute("contenteditable", "false");
				document.getElementById("boysOtherRunning").setAttribute("contenteditable", "false");
			}
			
			//Otherwise the race is a girls race
			else {
				document.getElementById("girlsHomeRunning").setAttribute("contenteditable", "false");
				document.getElementById("girlsOtherRunning").setAttribute("contenteditable", "false");
			}
		}
		
		else if (localStorage.getItem('blnBoys') == 'true') { //Just boys meet
			document.getElementById("boysHomeRunning").setAttribute("contenteditable", "false");
			document.getElementById("boysOtherRunning").setAttribute("contenteditable", "false");
		}
		
		else if (localStorage.getItem('blnGirls') == 'true') { //Just girls meet
			document.getElementById("girlsHomeRunning").setAttribute("contenteditable", "false");
			document.getElementById("girlsOtherRunning").setAttribute("contenteditable", "false");
		}
	}
	
	if (raceNumber != 0) $("#results").append('<button onclick = \'modifyRace("back")\' class=" btn btn-primary btn-lg glyphicon glyphicon-step-backward"></button>');
	$("#results").append('<button onclick = "processResults(places, isLocked);" class="btn btn-primary btn-lg glyphicon glyphicon-fast-forward"></button>');
	
	var place = ""; //Stores the place that corresponds with a number, 1 = 1st, 2 = 2nd, 3 = 3rd, etc.
	
	var oppTeamName = localStorage.getItem('oppTeamName'); //Name of opposing team
	
	$("#selectPlaces").append('<h2>Pick the Place!</h2>');
	for (i = 0; i < parseInt(localStorage.getItem('numLanes')); i++) {
		//Name options based on values
		if (i == 0) place = "1st";
		else if (i == 1) place = "2nd";
		else if (i == 2) place = "3rd";
		else place = (i+1) + "th"; //4th 5th 6th 7th 8th
		
		$("#selectPlaces").append('<button type="button" onclick=\'enterPlace("' + (i+1) + '")\' style="width:100%" class="btn btn-default center-block btn-md">' + place + '</button><br>'); //Add button for each lane
	
		//If the race is locked, prevent the lanes from being clicked
		if (lockedRaces[raceNumber] == "true") document.getElementById(i + 1).setAttribute("data-toggle" , "");
	}
	$("#selectPlaces").append('<button type="button" onclick=\'enterPlace("-1")\' style="width:100%" class="btn btn-default center-block btn-md">OTHER TEAM</button><br>'); //Allow other team
	$("#selectPlaces").append('<button type="button" onclick=\'enterPlace("0")\' style="width:100%" class="btn btn-default center-block btn-md">EMPTY</button><br>'); //Allow empty lane
	$("#selectPlaces").append('<button type="button" id="dqButton" onclick="dq()" style="width:100%; display:none" class="btn btn-default center-block btn-md">DQ</button><br>'); //DQ
	
	if (localStorage.getItem('isModifying') == 'true'){
		race = race.toLowerCase().replace(/\s+/g, '');
		if (race.includes('im')){
			race = race.slice(0,-2);
			race = race += 'IM';
		}
		
		places = JSON.parse(localStorage.getItem(race));
		for (i = 0; i < places.length; i++){
			if (places[i] == -1) place = "O";
			else if (places[i] == 0) place = "";
			else if (places[i] == 1) place = "1st";
			else if (places[i] == 2) place = "2nd";
			else if (places[i] == 3) place = "3rd";
			else if (places[i] != 0 && places[i].indexOf("*") == -1) place = places[i] + "th"; //4th 5th 6th 7th 8th
			else if (places[i].indexOf("*") != -1) {
				if (places[i].indexOf("1") != -1) place = "1st";
				else if (places[i].indexOf("2") != -1) place = "2nd";
				else if (places[i].indexOf("3") != -1) place = "3rd";
				else place = places[i].substring(0,1) + "th"; //4th 5th 6th 7th 8th
				$("rect#" + (i+1)).css("fill", "rgb(255,0,0)"); //Make it red since it's DQ'ed
			}
			document.getElementById("lane" + (i+1)).innerHTML = place;
		}
		
		if (lockedRaces[raceNumber] == "false") updateScore(raceNumber); //Load the score for the modify race if it's not locked
	}
	
	//Manual editing of scores
	if (localStorage.getItem('isModifying') == "true") {
		if (currentRace == "boys") {
			document.getElementById('boysHomeRunning').addEventListener('keypress', function(evt) {
				if (evt.which === 13) {
					evt.preventDefault();
				}
				boysHomeScore = parseInt($('#boysHomeRunning').text());
				localStorage.setItem('isModifying', 'true');
				
				if (meetType == "both") {
					for (i = parseInt(raceNumber); i >= 0; i -= 2) {
						lockedRaces[i] = "true";
					}
				}
				else {
					for (i = parseInt(raceNumber); i >= 0; i--) {
						lockedRaces[i] = "true";
					}
				}
				boysHomeEdited = "true";
				localStorage.setItem("lockedRaces", JSON.stringify(lockedRaces)); //Locked races
			});
			document.getElementById('boysOtherRunning').addEventListener('keypress', function(evt) {
				if (evt.which === 13) {
					evt.preventDefault();
				}
				boysOtherScore = parseInt($('#boysOtherRunning').text());
				localStorage.setItem('isModifying', 'true');
				
				if (meetType == "both") {
					for (i = parseInt(raceNumber); i >= 0; i -= 2) {
						lockedRaces[i] = "true";
					}
				}
				else {
					for (i = parseInt(raceNumber); i >= 0; i--) {
						lockedRaces[i] = "true";
					}
				}
				boysOtherEdited = "true";
				localStorage.setItem("lockedRaces", JSON.stringify(lockedRaces)); //Locked races
			});
		}
		if (currentRace == "girls") {
			document.getElementById('girlsHomeRunning').addEventListener('keypress', function(evt) {
				if (evt.which === 13) {
					evt.preventDefault();
				}
				girlsHomeScore = parseInt($('#girlsHomeRunning').text());
				localStorage.setItem('isModifying', 'true');
				
				if (meetType == "both") {
					for (i = parseInt(raceNumber); i >= 0; i -= 2) {
						lockedRaces[i] = "true";
					}
				}
				else {
					for (i = parseInt(raceNumber); i >= 0; i--) {
						lockedRaces[i] = "true";
					}
				}
				girlsHomeEdited = "true";
				localStorage.setItem("lockedRaces", JSON.stringify(lockedRaces)); //Locked races
			});
			document.getElementById('girlsOtherRunning').addEventListener('keypress', function(evt) {
				if (evt.which === 13) {
					evt.preventDefault();
				}
				girlsOtherScore = parseInt($('#girlsOtherRunning').text());
				localStorage.setItem('isModifying', 'true');
				
				if (meetType == "both") {
					for (i = parseInt(raceNumber); i >= 0; i -= 2) {
						lockedRaces[i] = "true";
					}
				}
				else {
					for (i = parseInt(raceNumber); i >= 0; i--) {
						lockedRaces[i] = "true";
					}
				}
				girlsOtherEdited = "true";
				localStorage.setItem("lockedRaces", JSON.stringify(lockedRaces)); //Locked races
			});
		}
	}	
	
	console.log(lockedRaces);
	
	localStorage.setItem("scores", JSON.stringify(scores)); //Store the scores array in local storage
	
	//Auto generate the opponent's lanes based on odd/even
	if (localStorage.getItem('laneType') == '1'){
		for (i = 2; i <= parseInt(localStorage.getItem('numLanes')); i += 2){
			places[i-1] = '-1';
			document.getElementById("lane" + i).innerHTML = "O"
		}
	}
	else {
		for (i = 1; i <= parseInt(localStorage.getItem('numLanes')); i += 2){
			places[i-1] = '-1';
			document.getElementById("lane" + i).innerHTML = "O"
		}
	}
	
}

function dq(){ //DQ lane
	places[selectedLane - 1] += "*";
	$("rect#" + selectedLane).css("fill", "rgb(255,0,0)"); //Make red for DQ
	$('.bs-example-modal-lg').modal('hide');
	updateScore(raceNumber); //Update score since DQ can affect it
	storeRace(); //Store this race in local storage
}

//Reset variables based on what type (boys or girls) of race this is
if (currentRace == "boys") {
	boysHomeScore = 0;
	boysOtherScore = 0;
}
else {
	girlsHomeScore = 0;
	girlsOtherScore = 0;
}

var selectedLane; //What lane is currently selected

function laneClicked(lane){ //When one of the lanes are clicked, the number of the lane is passed as a parameter
	if (lockedRaces[raceNumber] == "false") { //As long as the race isn't locked
		if (selectedLane != null) {
			if (places[selectedLane - 1].indexOf("*") == -1) document.getElementById(selectedLane).style.fill = "rgb(92,179,255)"; //Unselect previously selected lane by changing it back to blue
			else document.getElementById(selectedLane).style.fill = "rgb(255,0,0)"; //Unless it's a DQ'ed lane
		}
		
		selectedLane = lane; //Currently selected lane is stored in global variable
		
		//If the currently selectedLane does not have data or it's for the other team, don't allow user to DQ it
		if (places[selectedLane - 1] == 0 || places[selectedLane - 1] == -1) document.getElementById("dqButton").style.display = "none";
		else document.getElementById("dqButton").style.display = "inline";
		
		if (places[selectedLane - 1].indexOf("*") == -1){
			$("rect#" + lane).css("fill", "rgb(255,255,0)");  //Make the lane yellow to indicate it's selected
		}
	}
}

function enterPlace(place) {	
	$('.bs-example-modal-lg').modal('hide');
	places[selectedLane - 1] = place;
	
	if (!isNaN(place) && parseInt(place) > 0) { //If this lane wasn't disqualified and is Home
		//Convert number like 1 to "1st" or 2 to "2nd", etc.
		var i = parseInt(place); //Temporary check variable
		if (i == 1) place = "1st";
		else if (i == 2) place = "2nd";
		else if (i == 3) place = "3rd";
		else place = i + "th"; //4th 5th 6th 7th 8th
		
		document.getElementById("lane" + selectedLane).innerHTML = place;
	}
	
	else if (isNaN(place)) {
		document.getElementById("lane" + selectedLane).innerHTML = "DQ";
		places[selectedLane - 1] += "*";
	}
	
	else if (parseInt(place) == 0) document.getElementById("lane" + selectedLane).innerHTML = "";
	
	else if (parseInt(place) == -1) document.getElementById("lane" + selectedLane).innerHTML = "O";
	
	console.log("raceNumber" + raceNumber);
	updateScore(raceNumber); //Update score
	storeRace(); //Store this race in local storage
}

function updateScore(raceNumber) {
	var availablePoints; //Points available for OTHER team, not Home
	var containsDQ = false; //Whether or not this race has one or more DQ'ed lanes
	
	for (i = 0; i < places.length; i++) {
		if (places[i].indexOf("*") != -1) {
			containsDQ = true; //Does contain a DQ lane
			var index = i;
			break;
		}
	}
	
	//Copy places data into places adjusted, if there's no DQ, then placesAdjusted will be scored just like places, so it doesn't make a difference
	for (i = 0; i < places.length; i++) {
		placesAdjusted[i] = places[i];
	}
	
	if (containsDQ) {
		var dqPlace = parseInt(placesAdjusted[index].substring(0,1)); //Value of the place being disqualified so that all other places can be compared to it
		var intPlace; //Just the place (1st character) of each lane so that it can be compared as an integer
		while(index >= 0) { //While it returns matches
			placesAdjusted[index] = "0"; //Lane is no longer counted (equivalent of being empty)
			//Adjust score
			for (x = 0; x < placesAdjusted.length; x++) {
				intPlace = parseInt(placesAdjusted[x].toString().substring(0,1));
				if (intPlace > 0 && intPlace > dqPlace) { //Only change the lane values of Home lanes that are lower than the DQ'ed lane
					placesAdjusted[x] = placesAdjusted[x].replace(intPlace.toString(),(intPlace - 1).toString()); //Place moves up one since DQ'ed lane is removed
				}
			}			
			
			//Look for any other instances of * (DQed lanes)
			for (i = index; i < placesAdjusted.length; i++) {
				if (placesAdjusted[i].indexOf("*") != -1) {
					var temp = i;
					dqPlace = parseInt(placesAdjusted[i].substring(0,1));
					break; //New DQ'ed lane found so end the loop
				}
			}
			if (index == temp) break;
			else index = temp;
		}
	}
	
	if (((meetType == "both") && (raceNumber == 0 || raceNumber == 1 || raceNumber == 14 || raceNumber == 15 || raceNumber == 20 || raceNumber == 21)) ||
		(meetType == "girls" || meetType == "boys") && (raceNumber == 0 || raceNumber == 7 || raceNumber == 10)) { //If it's a relay
		if (currentRace == "boys") { //If it's a boy's relay
			if (placesAdjusted.indexOf("1") != -1 && placesAdjusted.indexOf("2") != -1 && placesAdjusted.indexOf("3") != -1) { //Case where Home gets 1st, 2nd, 3rd, can't have all 14 points
				boysHomeScore = 12;
				boysOtherScore = 0;
			}
			else if (placesAdjusted.indexOf("1") == -1 && placesAdjusted.indexOf("2") == -1 && placesAdjusted.indexOf("3") == -1) { //Case where Other gets 1st, 2nd, 3rd, can't have all 14 points
				boysHomeScore = 0;
				boysOtherScore = 12;
			}
			else {
				availablePoints = 14; //Since no team 1 2 3'd all 14 points are available for the relay
				
				if (placesAdjusted.indexOf("1") != -1) {
					availablePoints -= 8;
				}
				if (placesAdjusted.indexOf("2") != -1) {
					availablePoints -= 4;
				}		
				if (placesAdjusted.indexOf("3") != -1) {
					availablePoints -= 2;
				}
				
				boysHomeScore = 14 - availablePoints; //Home gets points taken already
				boysOtherScore = availablePoints; //Other team gets points leftover not claimed by Home
			}
		}
		
		else { //If it's a girls's relay
			if (placesAdjusted.indexOf("1") != -1 && placesAdjusted.indexOf("2") != -1 && placesAdjusted.indexOf("3") != -1) { //Case where Home gets 1st, 2nd, 3rd, can't have all 14 points
				girlsHomeScore = 12;
				girlsOtherScore = 0;
			}
			else if (placesAdjusted.indexOf("1") == -1 && placesAdjusted.indexOf("2") == -1 && placesAdjusted.indexOf("3") == -1) { //Case where Other gets 1st, 2nd, 3rd, can't have all 14 points
				girlsHomeScore = 0;
				girlsOtherScore = 12;
			}
			else {
				availablePoints = 14; //Since no team 1 2 3'd all 14 points are available for the relay
				
				if (placesAdjusted.indexOf("1") != -1) {
					availablePoints -= 8;
				}
				if (placesAdjusted.indexOf("2") != -1) {
					availablePoints -= 4;
				}		
				if (placesAdjusted.indexOf("3") != -1) {
					availablePoints -= 2;
				}
				
				girlsHomeScore = 14 - availablePoints; //Home gets points taken already
				girlsOtherScore = availablePoints; //Other team gets points leftover not claimed by Home
			}
		}
	}
	
	else { //If it's an individual race
		availablePoints = 16; //16 points always available in an individual race
		
			if (placesAdjusted.indexOf("1") != -1) {
				availablePoints -= 6;
			}
			if (placesAdjusted.indexOf("2") != -1) {
				availablePoints -= 4;
			}		
			if (placesAdjusted.indexOf("3") != -1) {
				availablePoints -= 3;
			}
			if (placesAdjusted.indexOf("4") != -1) {
				availablePoints -= 2;
			}
			if (placesAdjusted.indexOf("5") != -1) {
				availablePoints -= 1;
			}
		
		if (currentRace == "boys") { //If it's a boy's relay	
			boysHomeScore = 16 - availablePoints; //Home gets points taken already
			boysOtherScore = availablePoints; //Other team gets points leftover not claimed by Home
		}
		else {
			girlsHomeScore = 16 - availablePoints; //Home gets points taken already
			girlsOtherScore = availablePoints; //Other team gets points leftover not claimed by Home
		}
	}	
	
	//Update score board when not modifying
	if (currentRace == "boys" && localStorage.getItem('isModifying') == 'false') {
		document.getElementById("boysHomeRunning").innerHTML = (parseInt(boysHomeScore) + parseInt(localStorage.getItem('boysHomeScore'))).toString();
		document.getElementById("boysOtherRunning").innerHTML = (parseInt(boysOtherScore) + parseInt(localStorage.getItem('boysOtherScore'))).toString();
	}
	else if (currentRace == "girls" && localStorage.getItem('isModifying') == 'false') {
		document.getElementById("girlsHomeRunning").innerHTML = (parseInt(girlsHomeScore) + parseInt(localStorage.getItem('girlsHomeScore'))).toString();
		document.getElementById("girlsOtherRunning").innerHTML = (parseInt(girlsOtherScore) + parseInt(localStorage.getItem('girlsOtherScore'))).toString();
	}
	
	//When modifying, load score based on array that stored the score before this race started
	else if (currentRace == "boys" && localStorage.getItem('isModifying') == 'true') {
		var score = scores[raceNumber].split(',');
		document.getElementById("boysHomeRunning").innerHTML = (parseInt(boysHomeScore) + parseInt(score[0])).toString();
		document.getElementById("boysOtherRunning").innerHTML = (parseInt(boysOtherScore) + parseInt(score[1])).toString();
	}
	else if (currentRace == "girls" && localStorage.getItem('isModifying') == 'true') {
		var score = scores[raceNumber].split(',');
		document.getElementById("girlsHomeRunning").innerHTML = (parseInt(girlsHomeScore) + parseInt(score[0])).toString();
		document.getElementById("girlsOtherRunning").innerHTML = (parseInt(girlsOtherScore) + parseInt(score[1])).toString();
	}
}

function storeRace() {
	var race = $("h1").text(); //Get the name of the race from the HTML header
	race = race.toLowerCase().replace(/\s+/g, '');
	if (race.includes('im')){
		race = race.slice(0,-2);
		race = race += 'IM';
	}
	if (localStorage.getItem('blnBoys') == 'true' && localStorage.getItem('blnGirls') == 'false'){
		race = 'boys'+ race;
	}
	else if (localStorage.getItem('blnBoys') == 'false' && localStorage.getItem('blnGirls') == 'true'){
		race = 'girls'+ race;
	}
	
	localStorage.setItem(race,JSON.stringify(places)); //Store the order for the race in the correct format
}

function processResults(places, locked){
	$body.addClass("loading"); //Initiate loading icon
	if (places.indexOf("1") != -1 ||
		places.indexOf("2") != -1 ||
		places.indexOf("3") != -1 ||
		places.indexOf("4") != -1 ||
		places.indexOf("5") != -1 ||
		places.indexOf("6") != -1) {
				delta1 = 0;
				delta2 = 0;
				console.log(boysHomeScore);
				console.log(boysOtherScore);
				console.log(locked);
				console.log(scores);
				raceNumber = localStorage.getItem('raceNumber');
				if ((meetType == "both" && raceNumber % 2 == 0) || meetType == "boys") { //If it's a boys race		
					if (localStorage.getItem('isModifying') == 'true'){
						if (meetType == 'both') {
							if (boysHomeEdited == "false") delta1 = parseInt(boysHomeScore) - (parseInt(scores[parseInt(raceNumber) + 2].split(',')[0]) - parseInt(scores[parseInt(raceNumber)].split(',')[0])); //Changes in scores
							else delta1 = parseInt(boysHomeScore) - parseInt(scores[parseInt(raceNumber) + 2].split(',')[0]); //Changes in scores
							
							if (boysOtherEdited == "false") delta2 = parseInt(boysOtherScore) - (parseInt(scores[parseInt(raceNumber) + 2].split(',')[1]) - parseInt(scores[parseInt(raceNumber)].split(',')[1]));
							else delta2 = parseInt(boysOtherScore) - parseInt(scores[parseInt(raceNumber) + 2].split(',')[1]);
						}
						else {
							if (boysHomeEdited == "false") delta1 = parseInt(boysHomeScore) - (parseInt(scores[parseInt(raceNumber) + 1].split(',')[0]) - parseInt(scores[parseInt(raceNumber)].split(',')[0])); //Changes in scores
							else delta1 = parseInt(boysHomeScore) - parseInt(scores[parseInt(raceNumber) + 1].split(',')[0]); //Changes in scores
							
							if (boysOtherEdited == "false") delta2 = parseInt(boysOtherScore) - (parseInt(scores[parseInt(raceNumber) + 1].split(',')[1]) - parseInt(scores[parseInt(raceNumber)].split(',')[1]));
							else delta2 = parseInt(boysOtherScore) - parseInt(scores[parseInt(raceNumber) + 1].split(',')[1]);
						}
					}
					
					else {
						localStorage.setItem('boysHomeScore', parseInt(boysHomeScore) + parseInt(localStorage.getItem('boysHomeScore')));
						localStorage.setItem('boysOtherScore', parseInt(boysOtherScore) + parseInt(localStorage.getItem('boysOtherScore')));
					}
				}
				
				else { //Girls race
					if (localStorage.getItem('isModifying') == 'true'){
						if (meetType == 'both') {
							if (girlsHomeEdited == "false") delta1 = parseInt(girlsHomeScore) - (parseInt(scores[parseInt(raceNumber) + 2].split(',')[0]) - parseInt(scores[parseInt(raceNumber)].split(',')[0])); //Changes in scores
							else delta1 = parseInt(girlsHomeScore) - parseInt(scores[parseInt(raceNumber) + 2].split(',')[0]); //Changes in scores
							
							if (girlsOtherEdited == "false") delta2 = parseInt(girlsOtherScore) - (parseInt(scores[parseInt(raceNumber) + 2].split(',')[1]) - parseInt(scores[parseInt(raceNumber)].split(',')[1]));
							else delta2 = parseInt(girlsOtherScore) - parseInt(scores[parseInt(raceNumber) + 2].split(',')[1]);
						}
						else {
							if (girlsHomeEdited == "false") delta1 = parseInt(girlsHomeScore) - (parseInt(scores[parseInt(raceNumber) + 1].split(',')[0]) - parseInt(scores[parseInt(raceNumber)].split(',')[0])); //Changes in scores
							else delta1 = parseInt(girlsHomeScore) - parseInt(scores[parseInt(raceNumber) + 1].split(',')[0]); //Changes in scores
							
							if (girlsOtherEdited == "false") delta2 = parseInt(girlsOtherScore) - (parseInt(scores[parseInt(raceNumber) + 1].split(',')[1]) - parseInt(scores[parseInt(raceNumber)].split(',')[1]));
							else delta2 = parseInt(girlsOtherScore) - parseInt(scores[parseInt(raceNumber) + 1].split(',')[1]);
						}
					}
					
					else {
						localStorage.setItem('girlsHomeScore', parseInt(girlsHomeScore) + parseInt(localStorage.getItem('girlsHomeScore')));
						localStorage.setItem('girlsOtherScore', parseInt(girlsOtherScore) + parseInt(localStorage.getItem('girlsOtherScore')));
					}
				}
				
				if (localStorage.getItem('isModifying') == 'true' && locked == "false") {
					var maxRaceNum = 11;
					var maxRaceNumBoth = 22;
					if (meetType == 'both' && raceNumber % 2 == 0){
						for (i = maxRaceNumBoth ; i > parseInt(raceNumber); i-= 2){
							if (scores[i] != '' && scores[i] != null){
								scores[i] = (parseInt(scores[i].split(',')[0]) + delta1) + "," + (parseInt(scores[i].split(',')[1]) + delta2); //Changes only boy scores in a both meet
							}
						}
					}
					else if (meetType == 'both' && raceNumber % 2 != 0){
						for (i = maxRaceNumBoth - 1; i > parseInt(raceNumber); i-= 2){
							if (scores[i] != '' && scores[i] != null){
								scores[i] = (parseInt(scores[i].split(',')[0]) + delta1) + "," + (parseInt(scores[i].split(',')[1]) + delta2); //Changes only girl scores in a both meet
							}
						}
					}
					else{
						for (i = maxRaceNum; i > parseInt(raceNumber); i--){
							if (scores[i] != '' && scores[i] != null){
								scores[i] = (parseInt(scores[i].split(',')[0]) + delta1) + "," + (parseInt(scores[i].split(',')[1]) + delta2); //Changes all scores ahead of it --> Only girls, not both
							}
						}
					}
					
					localStorage.setItem("scores", JSON.stringify(scores));
					
				}
				
				storeRace(); //Method for processing race name and storing places

				if (localStorage.getItem('isModifying') == 'true') { //If this race is being modified, return to the modify page
					localStorage.setItem('isModifying', 'false'); //No longer modifying
					resumeMeet();
					return; //Escape the rest of the function
				} 
				
				//If the meet is not being modified, increment like normal
				var raceNumber = parseInt(localStorage.getItem('raceNumber')) + 1;
				localStorage.setItem('trueRaceNumber', raceNumber); //The race number will change with modifyRace() but when the meet is resumed it has to return to where it left off
				localStorage.setItem('raceNumber',raceNumber); //Current race number (includes modified race number)
				if((localStorage.getItem('blnBoys') == 'true' && localStorage.getItem('blnGirls') == 'true' && raceNumber != 21) ||
						  (((localStorage.getItem('blnBoys') == 'true' && localStorage.getItem('blnGirls') == 'false') || (localStorage.getItem('blnBoys') == 'false' && localStorage.getItem('blnGirls') == 'true')) && raceNumber != 10)) { //If the race is not being modified and it's not the last race, move on to the next race
					window.location='results.html';
				}
				else {
					window.location='scores.html';
				}
		}
	else {
		$body.removeClass("loading"); //Initiate loading icon
	}
}

function modifyRace(type) {
	$body.addClass("loading"); //Initiate loading icon
	if (type == "jump") {
		var raceNumber = $('select[name=modifiedRace]').val().split(' ')[1];
	}
	
	else if (type == "back") {
		var raceNumber = parseInt(localStorage.getItem('raceNumber')) - 1;
	}

	localStorage.setItem('raceNumber', raceNumber); //Store race number
	localStorage.setItem('isModifying', 'true'); //A race is being modified right now, do not progress to the next race and instead return to modify.html
	window.location='results.html'; //Redirect to race page to modify
}

//PROBLEM when resuming, the score is incorrect, implementing andrew's modify score shift feature may fix this
function resumeMeet() { //If the user was modifying a race, this returns them to the point at which they left off when they modified a race(s)
	var raceNumber = parseInt(localStorage.getItem('trueRaceNumber'));
	localStorage.setItem('raceNumber', raceNumber);
	
	//Make sure local storage score variables are correct
	var scores = JSON.parse(localStorage.getItem("scores"));
	var score = scores[raceNumber].split(",");
	
	//Set the current race that will be resumed
	if ((meetType == "both" && raceNumber % 2 == 0) || meetType == "boys") currentRace = "boys";
	else currentRace = "girls";
	
	if (currentRace == "boys") {
		localStorage.setItem("boysHomeScore",score[0]);
		localStorage.setItem("boysOtherScore",score[1]);
	}
	else {
		localStorage.setItem("girlsHomeScore",score[0]);
		localStorage.setItem("girlsOtherScore",score[1]);
	}
	
	if ((localStorage.getItem('blnBoys') == 'true' && localStorage.getItem('blnGirls') == 'true' && raceNumber != 21) ||
			  (((localStorage.getItem('blnBoys') == 'true' && localStorage.getItem('blnGirls') == 'false') || (localStorage.getItem('blnBoys') == 'false' && localStorage.getItem('blnGirls') == 'true')) && raceNumber != 10)) { //If the race is not being modified and it's not the last race, move on to the next race
		window.location='results.html';
	}
	else {
		window.location='scores.html';
	}
}