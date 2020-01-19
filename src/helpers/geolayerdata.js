export const generateGeoLayerData= (items, type) => {

   
    const obj = {
      "type": "FeatureCollection",
      "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
      }
      
      obj.features = []; 
      items.forEach((item)=>{
        var f = generateFeature({id:Math.random()*100, ...item.data()}, type);
        obj.features.push(f);
      })
        
      return obj;
}


function generateFeature(item, type) {
    

    var obj = {};
    obj.type ="Feature"; 
    obj.properties=generateProperties(item, type);
    obj.geometry = generateGeometrie(item);
    return obj;
}

function generateProperties(item, type) {
  var obj = {};
  obj.ID= item.id;
  obj.TYPE = type;
  return obj;
}

function generateGeometrie(item) {
     
    const {latitude, longitude} = item;
    var obj = {};
    obj.type = "Point";
    var coo = [longitude, latitude];
    obj.coordinates=coo;
    return obj;
}