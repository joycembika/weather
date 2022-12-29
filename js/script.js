let searchInp = document.querySelector(".weather-search");
let city = document.querySelector(".weather-city");
let day = document.querySelector(".weather-day");
let humidity = document.querySelector(".weather-indicator--humidity>.value");
let wind = document.querySelector(".weather-indicator--wind>.value");
let pressure = document.querySelector(".weather-indicator--pressure>.value");
let image = document.querySelector(".weather-image");
let temperature = document.querySelector(".weather-temperature");
let forecastBlock = document.querySelector(".weather-forecast");
let datalist = document.getElementById("suggestions");
let weatherAPIKey = "be0315ec0ccfc5b7f3307956a8d4ba83";
let weatherBaseEndpoint =
  "https://api.openweathermap.org/data/2.5/weather?units=metric&appid=" +
  weatherAPIKey;
let forecastBaseEndpoint =
  "https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=" +
  weatherAPIKey;
let geocodingBaseEndpoint =
  "http://api.openweathermap.org/geo/1.0/direct?&limit=5&appid=" +
  weatherAPIKey +
  "&q=";

let weatherImages = [
  {
    url: "images/broken-clouds.png",
    ids: [803, 804],
  },
  {
    url: "images/clear-sky.png",
    ids: [800],
  },
  {
    url: "images/few-clouds.png",
    ids: [801],
  },
  {
    url: "images/mist.png",
    ids: [701, 711, 721, 731, 741, 751, 761, 762, 771, 781],
  },
  {
    url: "images/rain.png",
    ids: [500, 501, 502, 503, 504],
  },
  {
    url: "images/scattered-clouds.png",
    ids: [802],
  },
  {
    url: "images/shower-rain.png",
    ids: [520, 521, 522, 531, 300, 302, 302, 310, 311, 312, 313, 314, 321],
  },
  {
    url: "images/snow.png",
    ids: [511, 600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622],
  },
  {
    url: "images/thunderstorm.png",
    ids: [200, 201, 202, 210, 211, 212, 230, 231, 232],
  },
];

// Get Weather by City Name Function
let getWeatherByCityName = async (city) => {
  let endpoint = weatherBaseEndpoint + "&q=" + city;
  let response = await fetch(endpoint);
  let weather = await response.json();

  return weather;
};

//Get city by ID
let getForecastByCityID = async (id) => {
  let endpoint = forecastBaseEndpoint + "&id=" + id;
  let result = await fetch(endpoint);
  let forecast = await result.json();
  let forecastList = forecast.list;
  let daily = [];

  forecastList.forEach((day) => {
    let date = new Date(day.dt_txt.replace(" ", "T"));
    let hours = date.getHours();
    if (hours === 12) {
      daily.push(day);
    }
  });
  return daily;
};
//city weather
let weatherForCity = async (city) => {
  let weather = await getWeatherByCityName(city);
  if (weather.cod === "404") {
    return;
  }
  let cityID = weather.id;
  updateCurrentWeather(weather);
  let forecast = await getForecastByCityID(cityID);
  updateForecast(forecast);
};
//Search City
searchInp.addEventListener("keydown", async (e) => {
  if (e.keyCode === 13) {
    weatherForCity(searchInp.value);
  }
});

//when you have same city name in multiple states/countries
searchInp.addEventListener("input", async () => {
  if (searchInp.value.length <= 2) {
    return;
  }
  let endpoint = geocodingBaseEndpoint + searchInp.value;
  let result = await (await fetch(endpoint)).json();
  //clear previous search options
  datalist.innerHTML = " ";
  result.forEach((city) => {
    let option = document.createElement("option");
    option.value = `${city.name}${city.state ? "," + city.state : ""}, ${
      city.country
    }`;
    datalist.appendChild(option);
  });
});

//Display weather info on page function
let updateCurrentWeather = (data) => {
  city.textContent = data.name + ", " + data.sys.country;
  day.textContent = dayOfWeek();
  humidity.textContent = data.main.humidity;
  pressure.textContent = data.main.pressure;
  let windDirection;
  let deg = data.wind.deg;
  //get the wind direction
  if (deg > 45 && deg <= 135) {
    windDirection = "East";
  } else if (deg > 135 && deg <= 225) {
    windDirection = "South";
  } else if (deg > 225 && deg <= 315) {
    windDirection = "West";
  } else {
    windDirection = "North";
  }
  wind.textContent = windDirection + ", " + data.wind.speed;
  temperature.textContent =
    data.main.temp > 0
      ? "+" + Math.round(data.main.temp)
      : Math.round(data.main.temp);

  let imgID = data.weather[0].id;
  weatherImages.forEach((obj) => {
    if (obj.ids.includes(imgID)) {
      image.src = obj.url;
    }
  });
};

//Update Weather for the five day forecast
let updateForecast = (forecast) => {
  //delete all previously inserted data
  forecastBlock.innerHTML = "";
  //create article for each day and insert in forcast block
  forecast.forEach((day) => {
    let iconUrl =
      "http://openweathermap.org/img/wn/" + day.weather[0].icon + "@2x.png";
    let dayName = dayOfWeek(day.dt * 1000);
    let temperature =
      day.main.temp > 0
        ? "+" + Math.round(day.main.temp)
        : Math.round(day.main.temp);
    let forecastItem = `
      <article class="weather-forecast-item">
          <img
            src="${iconUrl}"
            alt="${day.weather[0].description}"
            class="weather-forecast-icon"
          />
          <h3 class="weather-forecast-day">${dayName}</h3>
          <p class="weather-forecast-temperature">
            <span class="value">${temperature}</span>&deg;C
          </p>
      </article>`;
    forecastBlock.insertAdjacentHTML("beforeend", forecastItem);
  });
};

//Get the day of the week
let dayOfWeek = (dt = new Date().getTime()) => {
  return new Date(dt).toLocaleDateString("en-EN", { weekday: "long" });
};

//Set an initial Weather Forcast
let init = async () => {
  await weatherForCity("Dubai");
  document.body.style.filter = "blur(0)";
};
init();
