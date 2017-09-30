
var COORDINATE_X_FROM = 28
var COORDINATE_Y_FROM = 40
var COORDINATE_X_TO = 30
var COORDINATE_Y_TO = 42

var vesselsInfoMap = {}
var vesselsLocationMap = {}
var firstInit = true
var vesselsBetweenCoordinates = []
var vesselsBySize = {}


function updateVesselsBeteenCordinates(vessel){
  vesselCoordinates = vessel.lastpos.geometry.coordinates;

  if (vesselCoordinates[0] >= COORDINATE_X_FROM &&  
      vesselCoordinates[0] <= COORDINATE_X_TO && 
      vesselCoordinates[1] >= COORDINATE_Y_FROM &&  
      vesselCoordinates[1] <= COORDINATE_Y_TO )
  {
      vesselsBetweenCoordinates.push({id: vessel._id,coordinates: vesselCoordinates} )
  }
}

function invalid(vessel){
  return isInvalidSize(vessel.size)
}

function isInvalidSize(size){
  return isNaN(size) || parseInt(Number(size)) != size || isNaN(parseInt(size, 10)) 
}

function addVesselsBySize(id, size){
  // new size
  var vesselInfo = {id: id, coordinates: vesselsLocationMap[id].lastpos.geometry.coordinates}
  if(vesselsBySize[size] == null){
      vesselsBySize[size] = [vesselInfo]
  }
  else {
      vesselsBySize[size].push(vesselInfo)
  }
}
function removeVesselsBySize(id, size){

  // last one
  if(vesselsBySize[size].length == 1){
      delete vesselsBySize[size]
  }
  else {
      vesselsBySize[size] = vesselsBySize[size].filter(function(x){ return x.id != id})
  }
}
function updateVesselsBySize(vesselId, oldSize, newSize ){
  removeVesselsBySize(vesselId, oldSize)
  addVesselsBySize(vesselId, newSize)
}
function createHashFromFile(filePath, map, location){
  fs = require('fs');
  try {
    var arr = JSON.parse(fs.readFileSync(filePath));
    arr.forEach(function(vessel){
      map[vessel._id] = vessel
      if(location){
          updateVesselsBeteenCordinates(vessel)
      }
      else{
        if(vessel.size != undefined){
          // new size
          addVesselsBySize(vessel._id, vessel.size)
        }
      }
    })
  } catch ( err ) {
  }
}
function importData(){
  var infoFilePath = __dirname +'/vesselInfo.txt'
  //var infoFilePath = __dirname +'/info.txt'
  var locationFilePath = __dirname + '/vesselLocations.txt'
  createHashFromFile(locationFilePath, vesselsLocationMap, true)
  createHashFromFile(infoFilePath, vesselsInfoMap) 
  firstInit = false
}


module.exports = function (app) {

  // api ---------------------------------------------------------------------
  // get all vessel
  app.get('/api/vessels', function (req, res) {      
    if (firstInit){
      importData();
    }                
    res.json(vesselsLocationMap);
  });

  // get one vessel
  app.get('/api/vessels/:vessel_id', function (req, res) {
    res.json(vesselsInfoMap[req.params.vessel_id]);
  });

  // get max size vessels
  app.get('/api/vesselsMax/', function (req, res) {  
    var allSizes = Object.keys(vesselsBySize)
    var maxSize = Math.max(...allSizes)
    res.json(vesselsBySize[maxSize])
  });

  // get vessels between cordinates
  app.get('/api/vesselsBetweenCoordinates/', function (req, res) {      
    res.json(vesselsBetweenCoordinates )
  });

  // update vessel
  app.put('/api/vessels/:vessel_id', function (req, res) {
    var id = req.params.vessel_id
    var updatedVessselData = req.body
    if(invalid(updatedVessselData)){
      return
    }
    updateVesselsBySize(id, vesselsInfoMap[id].size, updatedVessselData.size)
    vesselsInfoMap[id] = updatedVessselData 
  });

  app.get('*', function (req, res) {
    res.sendFile(__dirname + '/public/index.html'); 
  });
};
