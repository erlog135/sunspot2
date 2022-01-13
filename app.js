var headerText = document.getElementById("headerText")

var menuBtn = document.getElementById("menuBtn")
var searchBtn = document.getElementById("searchBtn")

var mapBtn = document.getElementById("mapBtn")
var sunBtn = document.getElementById("sunBtn")
var listBtn = document.getElementById("listBtn")

var mapDiv = document.getElementById("mapDiv")
var mainDiv = document.getElementById("mainDiv")
var listDiv = document.getElementById("listDiv")

var mainTitle = document.getElementById("mainTitle")
var mainText = document.getElementById("mainText")

var latitude = null
var longitude = null

menuBtn.addEventListener("click", () => { toggleMenu() })
searchBtn.addEventListener("click", () => { toggleSearch() })

mapBtn.addEventListener("click", () => { mapView() })
sunBtn.addEventListener("click", () => { mainView() })
listBtn.addEventListener("click", () => { listView() })

function mapView() {
    headerText.value = "Map"

    mapBtn.classList.add("icon-selected")
    sunBtn.classList.remove("icon-selected")
    listBtn.classList.remove("icon-selected")

    mapDiv.style.display = "block"
    mainDiv.style.display = "none"
    listDiv.style.display = "none"
}

function mainView() {
    headerText.value = "Weather"

    mapBtn.classList.remove("icon-selected")
    sunBtn.classList.add("icon-selected")
    listBtn.classList.remove("icon-selected")

    mapDiv.style.display = "none"
    mainDiv.style.display = "block"
    listDiv.style.display = "none"
}

function listView() {
    headerText.value = "Days"

    mapBtn.classList.remove("icon-selected")
    sunBtn.classList.remove("icon-selected")
    listBtn.classList.add("icon-selected")

    mapDiv.style.display = "none"
    mainDiv.style.display = "none"
    listDiv.style.display = "block"
}


function getAllData(pointsUrl) {
    resetAssets();

    var points = new XMLHttpRequest()

    points.open("GET", pointsUrl, true)
    points.onload = function (e) {
        let response = JSON.parse(points.responseText)
        var forecast = new XMLHttpRequest()

        forecast.open("GET", response.properties.forecast, true)
        forecast.onload = function (e) {
            let response = JSON.parse(forecast.responseText)
            while (listDiv.firstChild) {
                listDiv.removeChild(listDiv.firstChild);
            }
            for (let period = 0; period < response.properties.periods.length; period++) {
                let card = document.createElement("div")
                card.classList.add("rounded")

                if (period + 1 < response.properties.periods.length) {
                    if (response.properties.periods[period + 1].name.includes(response.properties.periods[period].name)) {
                        let dayTitle = document.createElement("h1")
                        let dayDesc = document.createElement("p")
                        let dayIcon = document.createElement("img")

                        let hr = document.createElement("hr")

                        let nightTitle = document.createElement("h2")
                        let nightDesc = document.createElement("p")
                        let nightIcon = document.createElement("img")


                        dayTitle.innerText = response.properties.periods[period].name
                        dayDesc.innerText = response.properties.periods[period].detailedForecast
                        dayIcon.src = response.properties.periods[period].icon
                        dayIcon.classList.add("weather-icon")

                        nightTitle.innerText = response.properties.periods[period + 1].name
                        nightDesc.innerText = response.properties.periods[period + 1].detailedForecast
                        nightIcon.src = response.properties.periods[period + 1].icon
                        nightIcon.classList.add("weather-icon")

                        let dayDiv = document.createElement("div")
                        dayDiv.appendChild(dayIcon)
                        dayDiv.appendChild(dayTitle)
                        dayDiv.classList.add("days-list-element")

                        let nightDiv = document.createElement("div")
                        nightDiv.appendChild(nightIcon)
                        nightDiv.appendChild(nightTitle)
                        nightDiv.classList.add("days-list-element")

                        card.appendChild(dayDiv)
                        card.appendChild(dayDesc)

                        card.appendChild(hr)

                        card.appendChild(nightDiv)
                        card.appendChild(nightDesc)

                    }
                }

                if (response.properties.periods[period].name == "Tonight") {
                    let title = document.createElement("h1")
                    let desc = document.createElement("p")
                    let icon = document.createElement("img")
                    icon.classList.add("weather-icon")

                    let div = document.createElement("div")
                    div.appendChild(icon)
                    div.appendChild(title)
                    div.classList.add("days-list-element")

                    title.innerText = response.properties.periods[period].name
                    desc.innerText = response.properties.periods[period].detailedForecast
                    icon.src = response.properties.periods[period].icon
                    card.appendChild(div)
                    card.appendChild(desc)
                }

                if (card.childElementCount > 0) {
                    card.style.backgroundColor = "dimgray"
                    listDiv.appendChild(card)
                }

            }
        }
        forecast.onerror = function (e) {
            console.log("error")
        }
        forecast.send()

        var forecastHourly = new XMLHttpRequest()

        forecastHourly.open("GET", response.properties.forecastHourly, true)
        forecastHourly.onload = function (e) {
            let response = JSON.parse(forecastHourly.responseText)

            mainTitle.innerText = `${response.properties.periods[0].temperature}°`
            mainText.innerText = response.properties.periods[0].shortForecast

            let list = document.getElementById("forecastList")

            let periods = []

            for (let period = 0; period < Math.min(12, response.properties.periods.length); period++) {
                periods.push(response.properties.periods[period].temperature)
            }

            let min = Math.min(...periods)
            let max = Math.max(...periods)

            for (let period = 0; period < periods.length; period++) {
                let item = document.createElement("tr")
                let time = document.createElement("td")
                let value = document.createElement("h3")
                let chipBox = document.createElement("div")
                let valueRow = document.createElement("td")
                time.innerText = (period == 0) ? "Now" : `${period}H`//response.properties.periods[period].startTime
                value.innerText = `${periods[period]}°`
                value.classList.add("chip")
                value.style.marginLeft = "calc(" + JSON.stringify(((periods[period] - min) * 100) / (max - min)) + "%" + " - " + JSON.stringify(((periods[period] - min) * 60) / (max - min)) + "px)"
                chipBox.classList.add("chip-box")

                chipBox.appendChild(value)
                valueRow.appendChild(chipBox)
                item.appendChild(time)
                item.appendChild(valueRow)
                list.appendChild(item)
            }

        }
        forecastHourly.onerror = function (e) {

        }
        forecastHourly.send()

        let zone = response.properties.forecastZone
        let alerts = new XMLHttpRequest()

        alerts.open("GET", "https://api.weather.gov/alerts/active?area=" + response.properties.relativeLocation.properties.state, true)
        alerts.onload = function (e) {
            let response = JSON.parse(alerts.responseText)

            let list = document.getElementById("alertsList")

            let text = document.getElementById("alertsText")
            document.getElementById("alertsTitle").innerText = `${response.features.length} State Alerts`
            for (let alert = 0; alert < response.features.length; alert++) {
                let affectedZones = response.features[alert].properties.affectedZones
                for (let affectedZone = 0; affectedZone < affectedZones.length; affectedZone++) {
                    if (affectedZones[affectedZone] == zone) {
                        let title = document.createElement("h3")
                        title.innerText = response.features[alert].properties.event
                        title.addEventListener("click", () => { console.log("hio"); })
                        list.appendChild(title)
                    }
                }

            }
            if (list.childElementCount > 0) {
                list.style.height = 100
            } else {
                list.style.height = 0
            }
            text.innerText = `${list.childElementCount} Alerts in your forecast zone`
        }
        alerts.onerror = function (e) {

        }
        alerts.send()

    }
    points.onerror = function (e) {
    }
    points.send()



}

var prevText = headerText.value

function toggleMenu() {
    if (!document.getElementById("headerPanel").classList.contains("search-selected")) {

        document.getElementById("headerPanel").classList.toggle("menu-selected")
        document.getElementById("managerPanel").classList.toggle("menu-selected")
        document.getElementById("settingsPanel").classList.toggle("menu-selected")

        document.getElementById("headerPanel").classList.toggle("clickable")
        document.getElementById("managerPanel").classList.toggle("clickable")
        document.getElementById("settingsPanel").classList.toggle("clickable")

        document.getElementById("topHider").classList.toggle("menu-selected")
        document.getElementById("footer").classList.toggle("menu-selected")
        if (document.getElementById("headerPanel").classList.contains("menu-selected")) {
            prevText = headerText.value
            headerText.value = "Menu"
        } else {
            headerText.value = prevText
        }

    } else {
        if(getLocation()){
           
        }
    }
}

function toggleSearch() {

    if (!document.getElementById("headerPanel").classList.contains("menu-selected")) {

        document.getElementById("headerPanel").classList.toggle("search-selected")
        headerText.classList.toggle("search-selected")
        document.getElementById("topHider").classList.toggle("menu-selected")
        document.getElementById("footer").classList.toggle("menu-selected")

        if (document.getElementById("headerPanel").classList.contains("search-selected")) {
            prevText = headerText.value
            document.getElementById("searchImg").src = "images/icons/close.svg"
            document.getElementById("menuImg").src = "images/icons/location.svg"
            headerText.value = ""
            headerText.readOnly = false
            headerText.placeholder = "lat,long"
            headerText.focus()
        } else {
            headerText.readOnly = true
            headerText.value = prevText
            document.getElementById("searchImg").src = "images/icons/search.svg"
            document.getElementById("menuImg").src = "images/icons/menu.svg"
        }
    } else {
        toggleMenu()
        toggleSearch()
    }
}

function urlExists(url) {
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    if (http.status != 404) {
        return true;
    }
    else {
        return false;
    }
    //window.location.reload();
}

function searchTextUpdate(e) {
    if (document.getElementById("headerPanel").classList.contains("search-selected")) {
        if (e.key == "Enter") {
            if (urlExists("https://api.weather.gov/points/" + headerText.value)) {
                getAllData("https://api.weather.gov/points/" + headerText.value)
                toggleSearch()
            } else {
                document.getElementById("headerPanel").classList.add("error")
                setTimeout(() => {
                    document.getElementById("headerPanel").classList.remove("error")
                }, 500);
                return
            }
        }
    }
}

function resetAssets() {
    mainTitle.innerText = "Loading..."
    mainText.innerText = "Loading..."

    document.getElementById("alertsTitle").innerText = "Loading..."
    document.getElementById("alertsText").innerText = "Loading..."

    let alertsList = document.getElementById("alertsList")
    while (alertsList.firstChild) {
        alertsList.removeChild(alertsList.firstChild);
    }

    let forecastList = document.getElementById("forecastList")
    while (forecastList.firstChild) {
        forecastList.removeChild(forecastList.firstChild);
    }

    while (listDiv.firstChild) {
        listDiv.removeChild(listDiv.firstChild);
    }

}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(locationSuccess,locationFailure);
    } else {
        console.log("Geolocation is not supported by this browser.")
        locationFailure(null)
    }
}

function locationSuccess(position) {
    latitude = position.coords.latitude
    longitude = position.coords.longitude

    if(urlExists("https://api.weather.gov/points/"+latitude+","+longitude)){
        getAllData("https://api.weather.gov/points/"+latitude+","+longitude)
    }

    if (document.getElementById("headerPanel").classList.contains("search-selected")) {
        toggleSearch()
    }

}
function locationFailure(error){

    switch(error.code) {
        // case error.PERMISSION_DENIED:
        //   console.log("User denied the request for Geolocation.")
        //   break;
        // case error.POSITION_UNAVAILABLE:
        //   console.log("Location information is unavailable.")
        //   break;
        // case error.TIMEOUT:
        //   console.log("The request to get user location timed out.")
        //   break;
        // case error.UNKNOWN_ERROR:
        //   console.log("An unknown error occurred.")
        //   break;
        default:
            if (!document.getElementById("headerPanel").classList.contains("menu-selected") || !document.getElementById("headerPanel").classList.contains("search-selected")) {
                mainTitle.innerText = "Error"
                mainText.innerText = "Unable to get your location. Allow the site to access your location or enter your coordinates in the search bar."
            }
            break;
      }
      if (document.getElementById("headerPanel").classList.contains("search-selected")) {
        document.getElementById("headerPanel").classList.add("error")
        setTimeout(() => {
            document.getElementById("headerPanel").classList.remove("error")
        }, 500);
    }
}

getLocation()