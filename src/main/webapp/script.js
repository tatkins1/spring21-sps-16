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

let map, input, autocomplete, service;

// Attach your callback function to the `window` object
window.initMap = function () {
    map = new google.maps.Map(document.getElementById("maps"), {
        center: { lat: 40.7484405, lng: -73.9878584 },
        zoom: 4
    });
    // This object allows us to look up places using the places API
    service = new google.maps.places.PlacesService(map);
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

async function handleFormSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);

    // retrieve the user's selected workout types from the form
    let selectedExercises = data.getAll('workout_interests');
    // The recommendations tab may be populated with results
    // from the previous search so erase it before adding the new
    // search results to it.
    document.getElementById('display-recommendations').innerHTML = "";
    // send the retrieved workout preferences to the maps API to
    // search for locations that fit the desired preferences
    for (var i = 0; i < selectedExercises.length; i++) {
        searchForPlaces(selectedExercises[i]);
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

/**
 * This function retrieves a list of locations
 * that have the workOutType the user requested
 */
function searchForPlaces(workOutType) {
    const request = {
        location: new google.maps.LatLng(42.7013917, -73.6917296),
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
        const recommendationsListElement = document.getElementById('display-recommendations');

        // The results returned are too many to be displayed so 
        // we are displaying 6 for now.
        var numOfElementsToDisplay = results.length;
        if (numOfElementsToDisplay > 6) { numOfElementsToDisplay = 6; }

        for (var i = 0; i < numOfElementsToDisplay; i++) {
            recommendationsListElement.appendChild(createLocationElement(results[i]));
        }
    }
}

function createLocationElement(location) {
    const locationElement = document.createElement('li');
    locationElement.className = 'location';

    const visitButtonElement = document.createElement('button');
    visitButtonElement.className = 'btn recommendation';
    visitButtonElement.innerText = 'VISIT';

    visitButtonElement.addEventListener('click', () => {

        const coordinates = location.geometry.location;
        const marker = new google.maps.Marker({ map, position: coordinates });
        map.setCenter(coordinates);
        map.setZoom(12);

    });

    locationElement.appendChild(visitButtonElement);
    
    locationElement.innerHTML = createMarkUp(location);

    return locationElement;
}


function onVisitClick(event){
    let latLngs = event.target.dataset.location;
    latLngs = JSON.parse(latLngs);
    const coordinates = latLngs.geometry.location;
    const marker = new google.maps.Marker({ map, position: coordinates });
    map.setCenter(coordinates);
    map.setZoom(12);
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


// distance, price

const slidePage = document.querySelector(".slide_page");
const nextBtn = document.querySelector(".button_next");
const skipBtn = document.querySelector(".button_skip");
const submitBtn = document.querySelector(".button_submit");
let current = 1;

/* form navigation */
function onNextSelected(event) {
    event.preventDefault();
    if (current < 4) {
        slidePage.style.marginLeft = `${current * -25}%`;
        current += 1;
    } else {
        console.log("end of form reached");
    }
};

function onSkipSelected(event) {
    event.preventDefault();
    // hide form entirely navigate to recommendations tab

};


