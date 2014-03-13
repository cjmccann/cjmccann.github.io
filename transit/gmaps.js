var myLat = 0;
var myLng = 0;
var request = new XMLHttpRequest();
var line = new XMLHttpRequest();
var lineData = new XMLHttpRequest();
var markers = []
var poly
var me = new google.maps.LatLng(myLat, myLng);
var myOptions = {
			zoom: 13, // The larger the zoom number, the bigger the zoom
			center: me,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
var map;
var marker;
var infowindow = new google.maps.InfoWindow();
var places;

function init()
{
	map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	getMyLocation();
	line.open("get", "http://mbtamap.herokuapp.com/mapper/rodeo.json", true);

	line.onreadystatechange = lineReady;
	line.send(null);
}

function lineReady() {
	if (line.readyState == 4 && line.status == 200) {
		scheduleData = JSON.parse(line.responseText);
		console.log(scheduleData);
		renderLine(scheduleData["line"]);
	} 
}

function renderLine(aLine) {
	console.log("renderline");

	lineData.onreadystatechange = function() {
		if (lineData.readyState === 4 && lineData.status === 200) {
			lineCoords = JSON.parse(lineData.responseText)
			console.log(lineCoords);

			var polyOptions = {
				strokeColor: '#000000',
				strokeOpacity: 1.0,
				strokeWeight: 3
			};

			poly = new google.maps.Polyline(polyOptions);
			poly.setMap(map);

			for (var i = 0; i < lineCoords.length; i++) {

				if (lineCoords[i].Line.toLowerCase() == aLine) {
					console.log(i);
					var curMarker = new google.maps.Marker({
						position: new google.maps.LatLng(lineCoords[i].x, lineCoords[i].y),
						title: lineCoords[i].Line
					});
					markers.push(curMarker);
					mkPath(curMarker);
				}
			}
	

			for (var i = 0; i < markers.length; i++) {
				mkWindows(markers[i]);
			}
		}
	};

	lineData.open("GET", 'stations.json', true);
	lineData.send();
}

function mkPath(aMarker) {
	var path = poly.getPath();
	path.push(aMarker.position)
}

function mkWindows (aMarker) {
	aMarker.setMap(map);
	google.maps.event.addListener(aMarker, 'click', function() {
		infowindow.close();
		infowindow.setContent(aMarker.title);
		infowindow.open(map, aMarker);
	});
}

function getMyLocation()
{
	if (navigator.geolocation) { // the navigator.geolocation object is supported on your browser
		navigator.geolocation.getCurrentPosition(function(position) {
			myLat = position.coords.latitude;
			myLng = position.coords.longitude;
			renderMap();
		});
	}
	else {
		alert("Geolocation is not supported by your web browser.  What a shame!");
	}
}

function renderMap()
{
	me = new google.maps.LatLng(myLat, myLng);
	
	// Update map and go there...
	map.panTo(me);

	// Create a marker
	marker = new google.maps.Marker({
		position: me,
		title: "I am here at lat:" + myLat + "; long: " + myLng
	});
	marker.setMap(map);
		
	// Open info window on click of marker
	google.maps.event.addListener(marker, 'click', function() {
		infowindow.setContent(marker.title);
		infowindow.open(map, marker);
	});	
}

// Taken from http://code.google.com/apis/maps/documentation/javascript/places.html
function callback(results, status)
{
	if (status == google.maps.places.PlacesServiceStatus.OK) {
		places = results;
		for (var i = 0; i < results.length; i++) {
			createMarker(results[i]);
		}
	}
}

function createMarker(place)
{
	var placeLoc = place.geometry.location;
	var marker = new google.maps.Marker({
		map: map,
		position: place.geometry.location
	});

	google.maps.event.addListener(marker, 'click', function() {
		infowindow.close();
		infowindow.setContent(place.name);
		infowindow.open(map, this);
	});
}
