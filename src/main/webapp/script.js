// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


let map, input, autocomplete, service, geoCoder, markers = [], position = null;
let directionsService, directionsRenderer;
//tells the displayResult function which header to add to the recommendations tab
let index = 0, workOutInterest = [];

/*
 * helper function to hide menus when user clicks elsewhere on screen
 */
window.onload = function () {
    let interestForm = document.getElementById('interests');
    let recommendations = document.getElementById('recommendations');
    let tabs = this.document.querySelector('.tabs');

    document.onclick = function (e) {
        if (!interestForm.contains(event.target) && !tabs.contains(event.target)) {
            interestForm.style.display = 'none';
            tabs.children[0].classList.remove("active")
        }

        if (!recommendations.contains(event.target) && !tabs.contains(event.target)) {
            recommendations.style.display = 'none';
            tabs.children[1].classList.remove("active");
        }
    };
};


// Attach your callback function to the `window` object
window.initMap = function () {
    map = new google.maps.Map(document.getElementById("maps"), {
        center: { lat: 40.7484405, lng: -73.9878584 },
        zoom: 4
    });
    // The objects allows us to call the Directions API for a path
    // from one location to the other
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);
    // This object allows us to look up places using the places API
    service = new google.maps.places.PlacesService(map);
    //Initialize a geocoding object for converting addresses into co-ordinates
    geoCoder = new google.maps.Geocoder();
    // Setting Up Auto-complete For Our Search box
    input = document.getElementById("search");
    autocomplete = new google.maps.places.Autocomplete(input);
};

let interests = ['Cycling', 'Running', 'Hiking', 'Yoga', 'Aerobics', 'Weight Lifting', 'Walking', 'Pilates'];


function openMenu(event, tabName) {
    // find relevant nodes
    const tabcontents = document.querySelectorAll(".menu_container > div");
    const tablinks = document.querySelectorAll(".tabs a");

    // remove everything with tabcontent class */
    tabcontents.forEach((tabmenu) => (tabmenu.style.display = "none"));

    // remove all tablinks active classes */
    tablinks.forEach((tablink) => tablink.classList.remove("active"));

    // add active class on current 
    event.currentTarget.classList.add("active");
    let currElement = document.getElementById(tabName)
    currElement.style.display = "block";

    if (tabName == "interests") {
        createUserInterestsForm(interests);
    }

}


function handleFormSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);

    // retrieve the user's selected workout types from the form
    let selectedExercises = data.getAll('workout_interests');
    // The recommendations tab may be populated with results
    // from the previous search so erase it before adding the new
    // search results to it.
    document.getElementById('recommendations').innerHTML = `<h3 class="card_heading">Suggested Places</h3>`;
    workOutInterest = [];
    index = 0;
    // Retrieve the user's location to be used as the starting point 
    // for conducting the fitness location searches
    getUsersLocation();
    // Prompt the user for a valid address then terminate the function
    if (position === null) { sendUserANoticeToEnterAddress(); return; }
    // send the retrieved workout preferences to the maps API to
    // search for locations that fit the desired preferences
    for (var i = 0; i < selectedExercises.length; i++) {
        workOutInterest.push(selectedExercises[i]);
        searchForPlaces(selectedExercises[i], position);
    }
    triggerAClick(document.getElementById('recommend'));
}


/**
 * This function switches the html document's active tab
 * to the recommendations tab after the user chooses
 * his/her workout options by simulating a click event
 */
function triggerAClick(buttonToBeClicked) {
    if (buttonToBeClicked.fireEvent) { buttonToBeClicked.fireEvent('onclick'); }
    else {
        var clickEvent = document.createEvent('Events');
        clickEvent.initEvent('click', true, false);
        buttonToBeClicked.dispatchEvent(clickEvent);
    }
}


function showWorkOutType(workOutType) {
  let tag = document.createElement("H3");
  var workOutTypeTag = document.createTextNode(workOutType + ':');
  tag.appendChild(workOutTypeTag);
  document.getElementById('recommendations').appendChild(tag);
}


/**
 * This function retrieves a list of locations
 * that have the workOutType the user requested
 */
function searchForPlaces(workOutType, focalPoint) {
    const request = {
    location: focalPoint,
    radius: '100',
    query: workOutType
  };
    service.textSearch(request, displayResults);
}


/**
 * This function displays the results of searchForPlaces
 * on the recommendations tab
 */
function displayResults(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        // Create a header for the work out type
        showWorkOutType(workOutInterest[index]);
        // Create the list element for the results to be added
        const recommendationsListElement = document.createElement('ul');
        recommendationsListElement.className = 'grid_view';

        // The results returned are too many to be displayed so 
        // we are displaying 6 for now.
        var numOfElementsToDisplay = results.length;
        if (numOfElementsToDisplay > 6) { numOfElementsToDisplay = 6; }

        for (var i = 0; i < numOfElementsToDisplay; i++) {
            recommendationsListElement.appendChild(createLocationElement(results[i]));
        }
        index++;
        document.getElementById('recommendations').appendChild(recommendationsListElement);
    }
}


function createLocationElement(location) {
    const locationElement = document.createElement('li');
    locationElement.className = 'location';
    
    locationElement.innerHTML = createMarkUp(location);

    return locationElement;
}


/**
 * Clear the clutter of markers from the
 * map so the user focuses on one place at a time
 */
function clearMarker() {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}


function getDirections(event){
    let latLngs = event.target.dataset.location;
    latLngs = JSON.parse(latLngs);
    const coordinates = latLngs.geometry.location;
    var request = {
        origin: position,
        destination: coordinates,
        travelMode: 'DRIVING'
    };
    directionsService.route(request, routeFound); 
    map.setCenter(coordinates);
    map.setZoom(16);
}


function onVisitClick(event){
    let latLngs = event.target.dataset.location;
    latLngs = JSON.parse(latLngs);
    const coordinates = latLngs.geometry.location;
    clearMarker();
    const userPositionMarker = new google.maps.Marker({
        map,
        icon: {url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"},
        animation: google.maps.Animation.DROP,
        position: position,
    });
    const marker = new google.maps.Marker({ map, position: coordinates });
    markers.push(marker);
    markers.push(userPositionMarker);
    map.setCenter(coordinates);
    map.setZoom(17);
}


function success(pos) {
    position = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
}


function geoCodingCompletion(results, status) {
    if (status === "OK") { position = results[0].geometry.location; }
}


function routeFound(result, status) {
    if (status == "OK") { directionsRenderer.setDirections(result); }
}


function sendUserANoticeToEnterAddress() {
  alert("Please use the search feature at the top to enter\
  the address to be used for searching");
}


/**
 * Get the user's location using address search
 * if the browser doesn't support navigator.geolocation
 */
function error(err) { getLocationUsingSearchBar(); }


function getUsersLocation(){
    var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, error, options);
    } else { getLocationUsingSearchBar(); }

}


function getLocationUsingSearchBar() {
    event.preventDefault();
    if (input.value.length === 0) {sendUserANoticeToEnterAddress();}
    else { geocodeAddress(geoCoder, input.value.trim()); }
}


function geocodeAddress(geocoder, userAddress) {
  geocoder.geocode({ address: userAddress }, geoCodingCompletion);
}


function createMarkUp(location) {
    const markup =
        `<div class="rec_card">
        <div class="rec_card-avatar"></div>
        <div class="card-details">
            <div class="name">${location.name}</div>
            <div class="address">${location.formatted_address}</div>    
            <div class="rec_card-rating">				
                <div class="rating">
                <span class="label">${parseInt(location.rating)}/5</span>
                ${createRatings(parseInt(location.rating)).join('')}
                </div>  
            </div>

            <button class="btn recommendation rec_card-rating" data-location='${JSON.stringify(location)}' onclick="onVisitClick(event)">VISIT</button>
            <button class="btn recommendation rec_card-rating" data-location='${JSON.stringify(location)}' onclick="getDirections(event)">DIRECTION</button>
        </div>
    </div>`

    return markup;
}


function createRatings(ratings) {
    ratingTags = []
    for (rating = 0; rating < 5; rating++) {
        if (rating < ratings) {
            ratingTags.push(`<i style="color:wheat" class="fas fa-star"></i>`);
        } else {
            ratingTags.push(`<i style="color:wheat" class="far fa-star"></i>`);
        }
    }
    return ratingTags;
}


function createUserInterestsForm(defaultInterests) {
    var html = defaultInterests.map(function (interest) {
        return (
            `<div class="activity_entry"><input id="activity-${interest}" name="workout_interests" type="checkbox" value="${interest}">
                 <label class="inline" for="activity-${interest}">${interest}</label></div>`
        )
    }).join('');


    html += `<div> + Add something else</div>
             <button class="btn button_submit" type="submit">Done</button>`

    const form = document.querySelector(".user_input");
    form.innerHTML = html;
}