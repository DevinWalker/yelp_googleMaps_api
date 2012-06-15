var map = null;
var geocoder = null;
var gmarkers = [];
var gDirections;
	
function initialize() {
	$('#map-container').hide();
	$('#directions').hide();
	
	$('#yelpAction').click(function() {
		$('#form-container').hide('slow',function(){
			$('#map-container').show('slow');
			map.checkResize();
		});
 	});
 	
 	$('#search-link').click(function(){
	 	$('#directions').hide('slow', function(){
	 		$('#map-container').hide('slow', function(){
	 			$('#form-container').show('slow');
	 		});
 		});
 	});
	
	if (GBrowserIsCompatible()) {
    map = new GMap2(document.getElementById("map-canvas"));
	map.addControl(new GLargeMapControl());
	gDirections = new GDirections(map, document.getElementById("directions"));
    map.setCenter(new GLatLng(28.5381, -81.3794), 11);
    geocoder = new GClientGeocoder();
    }
}

function setDirections(address) {
	var fromAddress = prompt("Enter a starting address.");
	gDirections.load("from:" + fromAddress + " to: " + address);
	$('#directions').show('slow');
}

function markerClick(x) {
	GEvent.trigger(gmarkers[x], "click");
}
	
function showAddress(address, info_text, i) {
      if (geocoder) {
        geocoder.getLatLng(
          address,
          function(point) {
            if (!point) {
              alert(address + " not found");
            } else {
			  marker= new GMarker(point);
			  gmarkers[i] = marker;
              map.addOverlay(gmarkers[i]); 
			  GEvent.addListener(gmarkers[i], "click", function() {
           	  gmarkers[i].openInfoWindow(info_text);
			 });
          	}
          }
        );
      }
   }	
	
function centerAddress(address) {
	geocoder.getLatLng(
		address,
		function(point) {
			map.setCenter(point, 11);
        });
}

function constructYelpUrl(){
	var term = $("#term").val();
	var location = $("#address").val();
	var ywsid = "lrh2GuJ-qLZUHeP4hNQNpg";
	
	var make_url = "http://api.yelp.com/business_review_search?" + 
	"callback=" + "handleData" +
	"&limit=9" +
	"&term=" + term +
	"&location=" + location +
	"&ywsid=" + ywsid;
	make_url = encodeURI(make_url);
	return make_url;
}

function retrieveYelp(){
	var script = document.createElement('script');
	var head = document.getElementsByTagName('head').item(0);
	if(head.hasChildNodes()){
		head.removeChild(head.lastChild);
	}
	var yelp_request_url = constructYelpUrl();
	script.src = yelp_request_url; 
	script.type = 'text/javascript'; 
	head.appendChild(script);
}
	
function handleData(data){
	var markerLink = [];
	var directionsLink = [];
	var divMarker = document.createElement('div');
	var divContent = document.createElement('div');
	var divAddress = document.createElement('div');
	var enterAddress =$("#address").val();
	
	map.clearOverlays();
	centerAddress(enterAddress);
	
	if (data.message.text == "OK") {
		if(data.businesses.length == 0) {
		alert("Error: No businesses were found near this location");
		return;
		}
	for(var i= 0; i<data.businesses.length; i++) {
	
		markerLink.push('javascript:markerClick('+i+')');
		markerLink[i] = markerLink[i].replace(/[']/g,"");
		directionsLink.push(data.businesses[i].address1 + " " + data.businesses[i].city + " " + data.businesses[i].state + " " + data.businesses[i].zip);
	
	var results = [
	{
		marker: markerLink[i],
		directions: directionsLink[i],	
		photoURL: data.businesses[i].photo_url,
		imgRating: data.businesses[i].rating_img_url,
		name: data.businesses[i].name, 
		address: data.businesses[i].address1,
		city: data.businesses[i].city,
		state: data.businesses[i].state,
		zip: data.businesses[i].zip, 
		phone:data.businesses[i].phone  
	}]; 
	
	if ( $('#div-results > *').length > 0 ) {
    	$('#div-results').children().remove();
	}
	
	$("#businessInfo").tmpl(results).appendTo(divContent);
	$("#markerInfo").tmpl(results).appendTo(divMarker);
	$("#yelpAddress").tmpl(results).appendTo(divAddress);
	var yelp_info= divMarker.innerHTML;
	var yelp_address = divAddress.innerHTML;
	
	
	while (divMarker.hasChildNodes() || divAddress.hasChildNodes()) {
		divMarker.removeChild(divMarker.firstChild);
		divAddress.removeChild(divAddress.firstChild);
	}
	showAddress(yelp_address, yelp_info, i);
		}
	}	
	else {
		alert("Error: " + data.message.text);
	}
	$("#div-results").append(divContent);
	
}