
const temp = document.getElementById("temp"),
  date = document.getElementById("date-time"),
  currentLocation = document.getElementById("location"),
  condition = document.getElementById("condition"),
  rain = document.getElementById("rain"),
  mainIcon = document.getElementById("icon"),
  uvIndex = document.querySelector(".uv-index"),
  uvText = document.querySelector(".uv-text"),
  windSpeed = document.querySelector(".wind-speed"),
  sunRise = document.querySelector(".sun-rise"),
  sunSet = document.querySelector(".sun-set"),
  humidity = document.querySelector(".humidity"),
  visibility = document.querySelector(".visibility"),
  humidityStatus = document.querySelector(".humidity-status"),
  airQuality = document.querySelector(".air-quality"),
  airQualityStatus = document.querySelector(".air-quality-status"),
  visibilityStatus = document.querySelector(".visibility-status"),
  weatherCards = document.getElementById("weather-cards"),
  celciusBtn = document.querySelector(".celcius"),
  fahrenheitBtn = document.querySelector(".fahrenheit"),
  hourlyBtn = document.querySelector(".hourly"),
  weekBtn = document.querySelector(".week"),
  tempUnit = document.querySelectorAll(".temp-unit"),
  searchForm = document.querySelector("#search"),
  search = document.querySelector("#query");

let currentCity = "";
let currentUnit = "c";
let hourlyorWeek = "Week";
let currentTimezone = "";


// Function for updating date and time
function getDateTime() {
  let now = new Date();
  if (currentTimezone) {
    now = new Date(now.toLocaleString("en-US", { timeZone: currentTimezone }));
  }
  let hour = now.getHours(),
    minute = now.getMinutes();
  seconds = now.getSeconds();

  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  // for the 12 hours format
  hour = hour % 12 || 12; // Add || 12 to handle 0 as 12 AM
  let ampm = now.getHours() >= 12 ? "PM" : "AM"; // Determine AM or PM
  if (hour < 10) {
    hour = "0" + hour;
  }
  if (minute < 10) {
    minute = "0" + minute;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  let dayString = days[now.getDay()];
  return `${dayString}, ${hour}:${minute}:${seconds} ${ampm}`;
}

// Updating time every second
date.innerText = getDateTime();
setInterval(() => {
  date.innerText = getDateTime();
}, 1000);

function getPublicIp() {
  fetch("https://geolocation-db.com/json/", {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      currentCity = data.city;
      getWeatherData(data.city, currentUnit, hourlyorWeek);
    });
}

getPublicIp();

// Function to get weather data
function getWeatherData(city, unit, hourlyorweek) {
  const apikey = "7WE2WUNLBFTEC389W4RREVRRC";
  fetch(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=metric&key=${apikey}&contentType=json`,
    {
      method: "GET",
    }
  )
    .then((response) => response.json())
    .then((data) => {
      let today = data.currentConditions;
      console.log(today); 
      if (unit === "c") {
        temp.innerText = today.temp;
      } else {
        temp.innerText = celsiusToFahrenheit(today.temp);
      }
      currentLocation.innerText = data.resolvedAddress;
      condition.innerText = today.conditions;
      uvIndex.innerText = today.uvindex;
      windSpeed.innerText = today.windspeed;
      humidity.innerText = today.humidity + "%";
      visibility.innerText = today.visibility;
      airQuality.innerText = today.winddir;
      measureUvIndex(today.uvindex);
      updateHumidityStatus(today.humidity);
      updateVisibilityStatus(today.visibility);
      updateAirQualityStatus(today.winddir);
      sunRise.innerText = convertTimeTo12HourFormat(today.sunrise);
      sunSet.innerText = convertTimeTo12HourFormat(today.sunset); // Corrected sunSet instead of sunRise
      mainIcon.src = getIcon(today.icon);
      changeBackground(today.icon);
      if (hourlyorweek === "hourly") {
        rain.innerText = "Perc -" + data.days[0].precip + "%";
      } else {
        // Show daily precipitation
        rain.innerText = "Perc -" + data.days[0].precip + "%";
      }
      if (hourlyorWeek === "hourly") {
        updateForecast(data.days[0].hours, unit, "day");
      } else {
        updateForecast(data.days, unit, "week");
         
      }
      getTimeZone(data.latitude, data.longitude); // Get time zone information
    })
    .catch((err)=>{
      alert("city you have given is our database please search another city");
    });
}

// Convert celsius to fahrenheit
function celsiusToFahrenheit(temp) {
  console.log(temp);
  return ((temp * 9) / 5 + 32).toFixed(1);
}

// Function to get UV index status
function measureUvIndex(uvIndex) {
  if (uvIndex <= 2) {
    uvText.innerText = "Low";
  } else if (uvIndex <= 5) {
    uvText.innerText = "Moderate";
  } else if (uvIndex <= 8) {
    uvText.innerText = "High";
  } else {
    uvText.innerText = "Extreme";
    alert("Warning: Extreme UV levels detected! Take precautions.");
  }
}
function changeBodyColor() {
  let now = new Date();
  let hour = now.getHours();
  if (hour >= 6 && hour < 18) {
    // Morning (6 AM to 6 PM)
    document.body.classList.add("light");
    document.body.classList.remove("dark");
  } else {
    // Night (6 PM to 6 AM)
    document.body.classList.add("dark");
    document.body.classList.remove("light");
  }
}
changeBodyColor(); // Initial call to set the correct theme
setInterval(changeBodyColor, 60000); // Check every minute
// Function to update humidity
function updateHumidityStatus(humidityValue) {
  console.log("Humidity Value:", humidityValue); // Log the humidity value for debugging
  if (humidityValue <= 30.0) {
    humidityStatus.innerText = "Low";
  } else if (humidityValue <= 60.0) {
    humidityStatus.innerText = "Moderate";
  } else {
    humidityStatus.innerText = "High";
    alert("Warning: Extreme hummidity detected! Take precautions.");
  }
}

// Function to update visibility status
function updateVisibilityStatus(visibilityValue) {
  if (visibilityValue >= 10) {
    visibilityStatus.innerText = "Good";
  } else if (visibilityValue >= 5) {
    visibilityStatus.innerText = "Moderate";
  } else {
    visibilityStatus.innerText = "Poor";
  }
}

// Function to update air quality status
function updateAirQualityStatus(airQualityValue) {
  if (airQualityValue <= 50) {
    airQualityStatus.innerText = "Good";
  } else if (airQualityValue <= 100) {
    airQualityStatus.innerText = "Moderate";
  } else if (airQualityValue <= 150) {
    airQualityStatus.innerText = "Unhealthy for Sensitive Groups";
  } else if (airQualityValue <= 200) {
    airQualityStatus.innerText = "Unhealthy";
  } else if (airQualityValue <= 300) {
    airQualityStatus.innerText = "Very Unhealthy";
  } else {
    airQualityStatus.innerText = "Hazardous";
  }
}

// Convert time to 12-hour format
function convertTimeTo12HourFormat(time) {
  let [hour, minute] = time.split(":");
  hour = parseInt(hour);
  let ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
  return `${hour}:${minute} ${ampm}`;
}

// Function to get icon
function getIcon(condition) {
  if (condition === "partly-cloudy-day") {
    return "icons/sun/27.png";
  } else if (condition === "partly-cloudy-night") {
    return "icons/moon/15.png";
  } else if (condition === "rain") {
    return "icons/rain/39.png";
  } else if (condition === "clear-day") {
    return "icons/sun/26.png";
  } else if (condition === "clear-night") {
    return "icons/moon/10.png";
  } else if (condition === "cloudy"){
    return "images/cloudy.png";
  }
  else {
    return "icons/sun/27.png";
  }
}

function getDayName(date) {
  let day = new Date(date);
  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[day.getDay()];
}

function getHour(time) {
  let hour = time.split(":")[0];
  let min = time.split(":")[1];
  if (hour > 12) {
    hour = hour - 12;
    return `${hour}:${min} PM`;
  } else {
    return `${hour}:${min} AM`;
  }
}

function updateForecast(data, unit, type) {
  weatherCards.innerHTML = "";
  let day = 0;
  let numCards = 0;
  if (type === "day") {
    numCards = 24;
  } else {
    numCards = 7;
  }
  for (let i = 0; i < numCards; i++) {
    let card = document.createElement("div");
    card.classList.add("card");
    let dayName;
    if (type === "week") {
      dayName = getDayName(data[day].datetime);
    } else {
      dayName = getHour(data[day].datetime);
    }
    let dayTemp = data[day].temp;
    if (unit === "f") {
      dayTemp = celsiusToFahrenheit(data[day].temp);
    }
    let iconCondition = data[day].icon;
    let iconSrc = getIcon(iconCondition);
    let tempUnit = "°C";
    if (unit === "f") {
      tempUnit = "°F";
    }
    card.innerHTML = `
      <h2 class="day-name">${dayName}</h2>
      <div class="card-icon">
        <img src="${iconSrc}" alt="" />
      </div>
      <div class="day-temp">
        <h2 class="temp">${dayTemp}</h2>
        <span class="temp-unit">${tempUnit}</span>
      </div>
    `;
    weatherCards.appendChild(card);
    day++;
  }
}

fahrenheitBtn.addEventListener("click", () => {
  changeUnit("f");
});
celciusBtn.addEventListener("click", () => {
  changeUnit("c");
});

function changeUnit(unit) {
  if (currentUnit !== unit) {
    currentUnit = unit;{
    tempUnit.forEach((elem) => {
      elem.innerText = `°${unit.toUpperCase()}`;
    });
    if (unit === "c") {
      celciusBtn.classList.add("active");
      fahrenheitBtn.classList.remove("active");
    } else {
      celciusBtn.classList.remove("active");
      fahrenheitBtn.classList.add("active");
    }
    // calling weather data after change of unit
    getWeatherData(currentCity, currentUnit, hourlyorWeek);
  }
}
}
 hourlyBtn.addEventListener("click",() => {
  changeTimeSpan("hourly");
 });
 weekBtn.addEventListener("click",() => {
  changeTimeSpan("week");
 });

 function changeTimeSpan(unit){
  if(hourlyorWeek !== unit){
    hourlyorWeek = unit;
    if (unit === "hourly"){
      hourlyBtn.classList.add("active");
      weekBtn.classList.remove("active");
    }
    else{
      hourlyBtn.classList.remove("active");
      weekBtn.classList.add("active");
    }
    getWeatherData(currentCity, currentUnit, hourlyorWeek);
  }
 }

 function changeBackground(condition) {
  const videos = document.querySelectorAll('.bg-video');
  videos.forEach(video => video.style.display = 'none');

  let videoToShow = '';

  if (condition === 'partly-cloudy-day') {
    videoToShow = 'video-partly-cloudy-day';
  } else if (condition === 'partly-cloudy-night') {
    videoToShow = 'video-partly-cloudy-night';
  } else if (condition === 'rain') {
    videoToShow = 'video-rain';
  } else if (condition === 'clear-day') {
    videoToShow = 'video-clear-day';
  } else if (condition === 'clear-night') {
    videoToShow = 'video-clear-night';
  } else {
    videoToShow = 'video-partly-cloudy-day'; // Default video
  }

  // Show the selected video
  const selectedVideo = document.getElementById(videoToShow);
  if (selectedVideo) {
    selectedVideo.style.display = 'block';
  }
}

 searchForm.addEventListener("submit" , (e) => {
  e.preventDefault();
  let location = search.value;
  if(location){
    currentCity = location;
    getWeatherData(currentCity,currentUnit,hourlyorWeek);
  }
});

// Function to get time zone data
function getTimeZone(lat, lon) {
  const timezoneApiKey = "C0M07B615UJ2";
  fetch(`https://api.timezonedb.com/v2.1/get-time-zone?key=${timezoneApiKey}&format=json&by=position&lat=${lat}&lng=${lon}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data); 
      currentTimezone = data.zoneName;
    })
    .catch((error) => {
      console.error("Error fetching time zone data:", error);
    });
}
