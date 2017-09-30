var COORDINATE_X_FROM = 28
var COORDINATE_Y_FROM = 40
var COORDINATE_X_TO = 30
var COORDINATE_Y_TO = 42

var vesselsInfoMap = {}
var vesselsLocationMap = {}
var firstInit = true
var vesselsBetweenCoordinates = []
var vesselsBySize = {}


function updateVesselsBetweenCordinates(vessel){
  vesselCoordinates = vessel.lastpos.geometry.coordinates;
  if (vesselCoordinates[0] >= COORDINATE_X_FROM &&  
      vesselCoordinates[0] <= COORDINATE_X_TO && 
      vesselCoordinates[1] >= COORDINATE_Y_FROM &&  
      vesselCoordinates[1] <= COORDINATE_Y_TO )
  {
      vesselsBetweenCoordinates.push({id: vessel._id, coordinates: vesselCoordinates} )
  }
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
  // last one - delete key
  if(vesselsBySize[size].length == 1){
    delete vesselsBySize[size]
  }
  //remove id from size ids
  else {
    vesselsBySize[size] = vesselsBySize[size].filter(function(x){ return x.id != id})
  }
}
function updateVesselsBySize(vesselId, oldSize, newSize ){
  if(!isInvalidSize(oldSize)){
    removeVesselsBySize(vesselId, oldSize)
  }
  if(!isInvalidSize(newSize)){
    addVesselsBySize(vesselId, newSize)
  }  
}
function createHashFromFile(filePath, map, location){
  fs = require('fs');
  try {
    var arr = JSON.parse(fs.readFileSync(filePath));
    arr.forEach(function(vessel){
      map[vessel._id] = vessel
      if(location){
          updateVesselsBetweenCordinates(vessel)
      }
      else{
        if(vessel.size != undefined){
          addVesselsBySize(vessel._id, vessel.size)
        }
      }
    })
  } catch ( err ) {
  }
}
function importData(){
  var infoFilePath = __dirname +'/vesselInfo.txt'
  var locationFilePath = __dirname + '/vesselLocations.txt'
  createHashFromFile(locationFilePath, vesselsLocationMap, true)
  createHashFromFile(infoFilePath, vesselsInfoMap) 
  firstInit = false
}

module.exports = function (app) {

  // api ---------------------------------------------------------------------
  // get all vessel
  app.get('/api/vessels', function (req, res) {   
    // first time import data from files
    if(firstInit) {
      importData();
    }
    //get all the vessels of max size
    if(req.query.size == "max"){
      var allSizes = Object.keys(vesselsBySize)
      //sizes are sorted, max size is the last one
      var maxSize = allSizes[allSizes.length-1]
      res.json(vesselsBySize[maxSize])
    }
    //get all vesseles bewtween given cordinatis
    else if(req.query.coordinates == "fix"){
      res.json(vesselsBetweenCoordinates)
    }
    //get all  vessels             
    else{
      res.json(vesselsLocationMap);
    }
  });

  // get one vessel
  app.get('/api/vessels/:vessel_id', function (req, res) {
    res.json(vesselsInfoMap[req.params.vessel_id]);
  });

  // update vessel
  app.put('/api/vessels/:vessel_id', function (req, res) {
    var id = req.params.vessel_id
    var updatedVessselData = req.body
    updateVesselsBySize(id, vesselsInfoMap[id].size, updatedVessselData.size)
    vesselsInfoMap[id] = updatedVessselData 
  });
};
