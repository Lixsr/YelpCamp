mapboxgl.accessToken = mapToken;

// make it an object again using JSON.parse
const campgroundObj = JSON.parse(campground);
const coordinates = campgroundObj.geometry.coordinates;

const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/light-v11', // style URL
    center: coordinates, // starting position [lng, lat]
    zoom: 10, // starting zoom
});
new mapboxgl.Marker()
    .setLngLat(coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h3>${campgroundObj.title}</h3><p>${campgroundObj.location}</p>`
            )
    )
    .addTo(map)