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

let map;

// Attach your callback function to the `window` object
window.initMap = function () {
    map = new google.maps.Map(document.getElementById("maps"), {
        center: { lat: 40.7484405, lng: -73.9878584 },
        zoom: 4
    });
};

let interests = ['running', 'hiking', 'eating', 'walking', 'hiking'];

function openMenu(event, tabName) {
    // find relevant nodes
    const tabcontents = document.querySelectorAll(".tabcontent");
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

    const formJSON = Object.fromEntries(data.entries());

    // for multi-selects, we need special handling
    formJSON.workout_interests = data.getAll('workout_interests');

    results = JSON.stringify(formJSON, null, 2);
    console.log("results", results);

       
        
    // send over to api

}




function createUserInterestsForm(defaultInterests) {
    var html = defaultInterests.map(function (interest) {
        return (
            `<div><input id="activity-${interest}" name="workout_interests" type="checkbox" value="${interest}">
                 <label class="inline" for="${interest}">${interest}</label></div>`
        )
    }).join('');


    html += `<div> + Add something else</div>
             <div class="inline">Skip</div>
             <div class="inline">Next</div>
             <button type="submit">Done</button>`

    const form = document.querySelector(".user_input");
    form.innerHTML = html;
}

