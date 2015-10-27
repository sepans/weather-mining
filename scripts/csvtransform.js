

var csv = require("fast-csv"),
    fs = require('fs'),
    _ = require('lodash');


var transformed = [];

csv
 .fromPath("us.csv", {headers: true})
  .on("data", function(data){
         //console.log('dd', data);
         transformed.push(data);
  })
  .on("end", function(){
        console.log("done");
        save();
  });

function save() {
  /*
  var ws = fs.createWriteStream("transformed.csv");
  csv
    .write( transformed, {headers: true})
    .pipe(ws);
  */
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var all = [];
  transformed.forEach(function(current) {
    //var current = 
    var station = current.Station;
    var recordInAll = _.find(all, function(d) { return d.Station===station; });
    //console.log('all', all, 'current', current, 'recoed', recordInAll);
    if(!recordInAll) {
      recordInAll = {Station: current.Station/*, Code: current.Code, Latitude: current.Latitude, Longitude: current.Longitude*/ };
      all.push(recordInAll);
    }
    var average = 12;
    var year = current.Period;
    if(parseInt(year)<2008) return;
    _.forEach(months, function(month) {
      recordInAll[year+'_'+month] = current[month];// ? current[month] : average;
    });

    //return all;


  });

  console.log('writing ', all);
  csv
     .writeToStream(fs.createWriteStream("trans-us.csv"), all, {headers: true});
}
