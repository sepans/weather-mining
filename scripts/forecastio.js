var ForecastIo = require('forecastio');
var fs = require('fs');
var csv = require("fast-csv");

var outFileName = '../data/allAirportData.csv',
    coordinatesFileName = '../data/intl_airports.csv';

var csvStream = csv.createWriteStream({headers: true}),
        writableStream = fs.createWriteStream(outFileName);

csvStream.pipe(writableStream);

writableStream.on("finish", function(){
    console.log("DONE!");
});

var forecastIo = new ForecastIo('ee6d93200224f4aca05c5a2f732f0de6');

var options = {
  units: 'si',
  exclude: 'currently,hourly,flags'
};

var stationList;// = JSON.parse(fs.readFileSync('us-stations.json', 'utf8'));
//processData();

var index = 0;

csv
 .fromPath(coordinatesFileName, {headers: true})
  .on("data", function(data){
    //stationList = data;
    
    processRow(data, index);
    index++;
   // console.log(data);
  })
 .on("end", function(){
        console.log("done reading coordinates");
  });


var allData = [],
    monthData = [];

var queryForecastio = false,
    daysToCollect = 365,
    stationNum = 400;//stationList.length;

var year = 2008,
    curMonth = 0;
    dayOffset = 0;

function processData() {
    
  stationList.forEach();
}

function processRow(station, i) {
  //for(var i = 0; i< stationNum; i++) {
    
    //var station = stationList[i];
    //console.log('station',station, i);
    
    var curDate = new Date(year, curMonth, 1, 0, 0, 0);

    for(dayOffset = 0; dayOffset < daysToCollect; dayOffset++) {

      //console.log(curDate, curDate.toISOString());
      // '2008-01-01T00:00:01Z',

      if(queryForecastio && i < stationNum) {
        var context = { date: new Date(curDate) };
        forecastIo.timeMachine(station.lat, station.long, curDate.toISOString().replace(/00.000Z/g, '01Z'), options, function(err, data) {
          if (err) throw err;
          //console.log(JSON.stringify(data));
          //console.log(data.daily.data[0]);
           
          //monthData.push(data.daily.data[0]);
          if(err || !data.daily) {
            console.log(i, station.municipality);
            console.log(err);
            return;
          }
          var dailyData = data.daily.data[0];
          
          var formattedDate = this.date;//new Date(dailyData.time).toISOString();
          dailyData.station = station.municipality;
          dailyData.region = station.iso_region;
          dailyData.country = station.iso_country;
          dailyData.lat = station.lat;
          dailyData.long = station.long;
          dailyData.formatteddate = formattedDate.toISOString();
          dailyData.observationdate = formattedDate.getTime();
        
          allData.push(dailyData);
          //console.log('PUSHED \n',allData);
          //console.log(JSON.stringify(data, null, 2));
          //console.log(i, dayOffset);

          console.log('writing data '+station.municipality+' '+formattedDate);
          csvStream.write(dailyData);
          
          if(allData.length >= stationNum * daysToCollect ) {
           // console.log(' ### ALL DATA ### \n', allData);
           // csv
           //   .writeToStream(fs.createWriteStream("temp.csv"), allData, {headers: true});
            csvStream.end();
          }
          
     
        
        }.bind(context));
      
      
     }
      

      curDate.setDate(curDate.getDate() + 1);
    /*
      if(curDate.getMonth()>curMonth) {
        //new month
        console.log('NEW MONTH', curMonth + 1);
        curMonth = curDate.getMonth();
        

        //reset month
        curMonth = 0;
        

      }
    */
    }

  //}


  }
