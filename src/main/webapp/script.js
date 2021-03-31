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

// Create the script tag, set the appropriate attributes
var script = document.createElement('script');
script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDZbsCASX6bRFXIojx2BUzeBcwI12oeuyU&callback=initMap';
script.async = true;

var map;

// Attach your callback function to the `window` object
window.initMap = function() {
  map = new google.maps.Map(document.getElementById("maps"), {
      center: { lat: 40.7484405, lng: -73.9878584 },
      zoom: 4
  });
};

// Append the 'script' element to 'head'
document.head.appendChild(script);

/**
 * The onload function sets the height for the
 * maps DIV element.
 */
window.onload = function() {
    const headerHeight = document.getElementById("header").offsetHeight;
    const footerHeight = document.getElementById("footer").offsetHeight;
    var mapsHeight = document.body.scrollHeight - headerHeight - footerHeight;
    mapsHeight /= document.body.scrollHeight;
    mapsHeight *= 100;
    document.getElementById("maps").style.top = headerHeight + "px";
    document.getElementById("maps").style.height = mapsHeight + "%";
}