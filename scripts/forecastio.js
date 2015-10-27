var ForecastIo = require('forecastio');
var fs = require('fs');
var csv = require("fast-csv");

var forecastIo = new ForecastIo('ee6d93200224f4aca05c5a2f732f0de6');

var options = {
  units: 'si',
  exclude: 'currently,hourly,flags'
};

var stationList = JSON.parse(fs.readFileSync('us-stations.json', 'utf8'));

var allData = [],
    monthData = [];

var queryForecastio = true,
    daysToCollect = 365,
    stationNum = stationList.length;

var year = 2008,
    curMonth = 0;
    dayOffset = 0;

stationList.forEach(function(station, i) {
//for(var i = 0; i< stationNum; i++) {
  
  //var station = stationList[i];
  //console.log('station',station);
  
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
        var dailyData = data.daily.data[0];
        
        var formattedDate = this.date;//new Date(dailyData.time).toISOString();
        dailyData.station = station.station.toLowerCase();
        dailyData.lat = station.lat;
        dailyData.long = station.long;
        dailyData.formatteddate = formattedDate.toISOString();
        dailyData.observationdate = formattedDate.getTime();
      
        allData.push(dailyData);
        //console.log('PUSHED \n',allData);
        //console.log(JSON.stringify(data, null, 2));
        //console.log(i, dayOffset);
        if(allData.length >= stationNum * daysToCollect ) {
          console.log(' ### ALL DATA ### \n', allData);
          csv
            .writeToStream(fs.createWriteStream("temp.csv"), allData, {headers: true});

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


});
