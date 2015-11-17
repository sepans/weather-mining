

var csv = require("fast-csv"),
    fs = require('fs'),
    _ = require('lodash');


var transformed = [];

var inputFile = '../data/allAirportData.csv',
    outputFile = '../data/grouped_airport2.csv';

csv
 .fromPath(inputFile, {headers: true})
  .on("data", function(data){
         //console.log('dd', data);
         transformed.push(data);
  })
  .on("end", function(){
        console.log("done");
        save();
  });

function save() {


   var grouped = _.chain(transformed)
    .groupBy("station")
    .map(function(value, key) {
        return _.chain(value)
            .groupBy(function(d) { var monthYear = d.formatteddate.substring(0 , 7); return monthYear})
            .map(function(value1, monthYear) {
                return {
                    station: key,
                    avgTemperatureMin: avg(_.pluck(value1, "temperatureMin")),
                    avgTemperatureMax: avg(_.pluck(value1, "temperatureMax")),
                    cloudCover: avg(_.pluck(value1, "cloudCover")),
                    visibility: avg(_.pluck(value1, "visibility")),
                    pressure: avg(_.pluck(value1, "pressure")),
                    windSpeed: avg(_.pluck(value1, "windSpeed")),
                    dewPoint: avg(_.pluck(value1, "dewPoint")),
                    monthYear: monthYear
                }
            })
            .value();
    })
    .value();

  //console.log('writing ', grouped[0], grouped[1]);
  
  var results = grouped.map(function(stationArray) {
    var ret = {};
    ret.station = stationArray[0].station;
    stationArray.forEach(function(cur) {
      ret['tempMin-'+cur.monthYear] = cur.avgTemperatureMin;
      ret['tempMax-'+cur.monthYear] = cur.avgTemperatureMax;
      ret['cloudCover-'+cur.monthYear] = cur.cloudCover;
      ret['visibility-'+cur.monthYear] = cur.visibility;
      ret['pressure-'+cur.monthYear] = cur.pressure;
      ret['windSpeed-'+cur.monthYear] = cur.windSpeed;
      ret['dewPoint-'+cur.monthYear] = cur.dewPoint;
    });
    return ret;
  });

  //console.log(results);
  
  csv
     .writeToStream(fs.createWriteStream(outputFile), results, {headers: true});
}

function avg(numbers) {
    var invalid = 0;
    return _.reduce(numbers, function(result, current) {
        if(Number(current))
        {
          return result + parseFloat(current);
        }
        else {
          invalid++;
          console.log(current+' is invalid '+invalid);
          return result;
        }
    }, 0)/(numbers.length - invalid);
}
