// variable declaration
var searchBar = $("#searchBar");
var searchBtn = $("#searchBtn");
var citySearched = $("#citySearched");
var temperature = $("#temperature");
var humidty= $("#humidityPer");
var windSpeed=$("#windSpeed");
var uvIndex= $("#uvIndex");
var sCity=[];

// searches the city to see if it exists in the entries from the storage
function find(c){
    for (var i=0; i<sCity.length; i++){
        if(c.toUpperCase()===sCity[i]){
            return -1;
        }
    }
    return 1;
}

// display weather of current city searched
function displayWeather(event){
    event.preventDefault();
    if(searchBar.val().trim()!==""){
         var city=searchBar.val().trim();
        currentWeather(city);
    }
}

// get ajax call
function currentWeather(city){
   var queryURL= "https://api.openweathermap.org/data/2.5/weather?q=" + city +"&units=imperial&appid=27c9211b5d8e1b6977681116bda54b7d";
   
    $.ajax({
        url:queryURL,
        method:"GET",
    }).then(function(response){

        var weathericon= response.weather[0].icon;
        var iconurl="https://openweathermap.org/img/wn/"+weathericon +"@2x.png";
        var date=new Date(response.dt*1000).toLocaleDateString();
        $(searchedCity).html(response.name +"("+date+")" + "<img src="+iconurl+">");
        
        var tempF = (response.main.temp )
        $(temperature).html(tempF + " &#8457");
        $(humidty).html(response.main.humidity+" %");
        var windS=response.wind.speed;
        $(windSpeed).html(windS+" MPH");

        // get uvIndex 
        UVIndex(response.coord.lon,response.coord.lat);
        forecast(response.id);
        if(response.cod==200){
            sCity=JSON.parse(localStorage.getItem("cityname"));
            console.log(sCity);
            if (sCity==null){
                sCity=[];
                sCity.push(city.toUpperCase()
                );
                localStorage.setItem("cityname",JSON.stringify(sCity));
                addToList(city);
            }
            else {
                if(find(city)>0){
                    sCity.push(city.toUpperCase());
                    localStorage.setItem("cityname",JSON.stringify(sCity));
                    addToList(city);
                }
            }
        }

    });
}

    // ucIndex Response
function UVIndex(lon,lat){
    var uvqURL="https://api.openweathermap.org/data/2.5/uvi?appid=27c9211b5d8e1b6977681116bda54b7d&lat="+lat+"&lon="+lon;
    $.ajax({
            url:uvqURL,
            method:"GET"
            }).then(function(response){
                $(uvIndex).html(response.value);
            });
}
    
//  display 5 day forecast 
function forecast(cityid){
    var queryforcastURL="https://api.openweathermap.org/data/2.5/forecast?id="+cityid+"&units=imperial&appid=27c9211b5d8e1b6977681116bda54b7d";
    $.ajax({
        url:queryforcastURL,
        method:"GET"
    }).then(function(response){
        
        for (i=0;i<5;i++){
            var date= new Date((response.list[((i+1)*8)-1].dt)*1000).toLocaleDateString();
            var iconcode= response.list[i+1].weather[0].icon;
            var iconurl="https://openweathermap.org/img/wn/"+iconcode+".png";
            var tempK= response.list[i+1].main.temp;
            var tempF=(tempK).toFixed(0);
            var humidity= response.list[i+1].main.humidity;
        
            $("#date"+i).html(date);
            $("#img"+i).html("<img src="+iconurl+">");
            $("#temp"+i).html(tempF+"&#8457");
            $("#humidity"+i).html(humidity+"%");
        }
        
    });
}

// add city to search
function addToList(c){
    var listEl= $("<li>"+c.toUpperCase()+"</li>");
    $(listEl).attr("class","list-group-item");
    $(listEl).attr("data-value",c.toUpperCase());
    $(".list-group").append(listEl);
}

// display the past search again when the list group item is clicked in search history
function pastSearch(event){
    var liEl=event.target;
    if (event.target.matches("li")){
        city=liEl.textContent.trim();
        currentWeather(city);
    }

}

// render function
function lastCity(){
    $("ul").empty();
    var sCity = JSON.parse(localStorage.getItem("cityname"));
    if(sCity!==null){
        sCity=JSON.parse(localStorage.getItem("cityname"));
        for(i=0; i<sCity.length;i++){
            addToList(sCity[i]);
        }
        city=sCity[i-1];
        currentWeather(city);
    }

}

//Click Handlers
$("#searchBtn").on("click",displayWeather);
$(document).on("click",pastSearch);
$(window).on("load",lastCity);