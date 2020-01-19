import React, { Component } from 'react'
import {  Menu } from 'semantic-ui-react'
import _ from 'lodash';
import {bikers_DB} from '../mockupdata'
import {  saveBikerPosition, getGeohashRange } from '../helpers/geohash_map'
import firebase from '../firebase/firebase';
//import {bikers} from '../bikersmockup.js'
import {generateGeoLayerData} from '../helpers/geolayerdata'

//import * as ELG from "esri-leaflet-geocoder";
var L = require('leaflet');

// store the map configuration properties in an object,
// we could also move this to a separate file & import it if desired.
let config = {};
config.params = {
  center: [48,17],
  zoomControl: false,
  zoom: 13,
  maxZoom: 19,
  minZoom: 7,
  scrollwheel: false,
  legends: true,
  infoControl: true,
  attributionControl: true
};
config.tileLayer = {
  uri: 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
  params: {
    minZoom: 5,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    id: '',
    accessToken: ''
  }
};

class MyMap extends Component  {

    constructor() {
      super();

      this.state = {
        map: null,
        tileLayer: null,
        geojsonLayer: null,
        numEntrances: null,
        marker:undefined,
        simulationActive:false,
        bikers: null,
      };

      this._mapNode = null;
      this.setMapNode = this.setMapNode.bind(this);
      this.onChangeMenuLogin = this.onChangeMenuLogin.bind(this);
      this.onChangeMenuLogout = this.onChangeMenuLogout.bind(this);
      this.handleItemClick = this.handleItemClick.bind(this);
      this.onEachFeature = this.onEachFeature.bind(this);
      this.pointToLayer = this.pointToLayer.bind(this);
      this.filterFeatures = this.filterFeatures.bind(this);
      this.filterGeoJSONLayer = this.filterGeoJSONLayer.bind(this);
      
    }

    onChangeMenuLogin() {
      console.log('/login')
    }

    onChangeMenuLogout() {
      console.log('/logout')
    }
    componentDidMount() {    
      // create the Leaflet map object
      if (!this.state.map) this.init(this._mapNode);     
      const lat_BS = 47.55333;
      const long_BS = 7.588576;
      const coord= {latitude: lat_BS, longitude:long_BS};
      this.subscribeBikerPositions(coord);
    }

    subscribeBikerPositions =(coord) => {
      const dataType = 'bikers';
      console.log('subscribeBikerPositions', coord)
      const {latitude , longitude} = coord;
      const range = getGeohashRange(latitude, longitude, 30);
      console.log('subscribeBikerPositions', range)
      firebase.firestore()
      .collection(dataType)
      .where("ghash", ">=", range.lower)
      .where("ghash", "<=", range.upper)
      .onSnapshot(        
        (docs) => {          
          const bikers = generateGeoLayerData(docs, dataType);      
          this.setState({bikers});     
      });
      
     
  }
    componentDidUpdate(prevProps, prevState) {      
      
      /*
      if(prevProps.adminUser!==this.props.adminUser) {
        console.log('adminUser', this.props.adminUser)
        const {lat, lng} = this.props.adminUser;
        const marker = new L.marker({lat,lng } );
        this.state.map.addLayer(marker);
        
        // set the map's center & zoom so that it fits the geographic extent of the layer
        this.state.map.setView({lat, lng}, 13);
      } 
      */   
      if(prevState.bikers!==this.state.bikers && this.state.geojsonLayer) {
        //console.log('novy bikery', this.state.bikers);
        this.filterGeoJSONLayer();
      }  
      if (this.state.bikers && this.state.map && !this.state.geojsonLayer) {
        // add the bikers overlay
        this.addGeoJSONLayer(this.state.bikers);
      }
    }
     
    init(id) {   
      if (this.state.map) return;
  
      // this function creates the Leaflet map object and is called after the Map component mounts
      let map = L.map(id, config.params);
            
      // map.on("zoomend", function (e) { this.rerender();}, this );
      // a TileLayer is used as the "basemap"
      const tileLayer = L.tileLayer(config.tileLayer.uri, config.tileLayer.params).addTo(map);
              
      L.control.scale({ position: "bottomright"}).addTo(map);
      L.control.zoom({ position: "bottomright"}).addTo(map);
          



      var sosIcon = L.divIcon({className: 'my-div-icon', 
      html:"<div style='font-size:10px; color:white'>🆘</div>" });
      L.marker([   47.549, 7.59], {icon: sosIcon}).addTo(map);
      L.marker([   47.544, 7.58354], {icon: sosIcon}).addTo(map);
      var waterIcon = L.divIcon({className: 'my-div-icon', 
      html:"<div style='font-size:10px; color:white'>💧</div>" });
      L.marker([   47.56, 7.58], {icon: waterIcon}).addTo(map);
      L.marker([   47.5456, 7.57454123], {icon: waterIcon}).addTo(map);
      var xxxIcon = L.divIcon({className: 'my-div-icon', 
      html:"<i aria-hidden='true' class='violet small bullseye icon'></i>" });
      L.marker([   47.54912, 7.595234], {icon: xxxIcon}).addTo(map);
      var puzzleIcon = L.divIcon({className: 'my-div-icon', 
      html:"<i aria-hidden='true' class='green small puzzle icon'></i>" });
      L.marker([   47.5532354, 7.57454123], {icon: puzzleIcon}).addTo(map);
      var dangerIcon = L.divIcon({className: 'my-div-icon', 
      html:"<div style='font-size:10px; color:white'>⚠️</div>" });
      L.marker([   47.5532354, 7.55994123], {icon: dangerIcon}).addTo(map);
      

     // const marker = new L.marker({lat:40.655769,lng:-73.938503 } );
     // map.addLayer(marker);

      // set our state to include the tile layer
      this.setState({ map, tileLayer });
    }

    setMapNode(node) {
      this._mapNode = node;
    }
    handleItemClick = (e, { name }) => {

     if(name==='start') {
      this.setState({ simulationActive: true }, ()=> this.simulate())      
     } else if(name==='stop') {
      this.setState({ simulationActive: false })      
     }

      this.setState({ activeItem: name })
    }

    simulate = ()=> {
      if(this.state.simulationActive) {
        setTimeout(
          () => {             
            if(this.state.simulationActive) {
              this.changePosition();
              this.simulate(); 
            }                     
        }, 3000);
      }     
    }
    changePosition = () => {
      const mileToKm = 1.60934;
      const lat = 0.0144927536231884; // degrees latitude per mile
      const lon = 0.0181818181818182; // degrees longitude per mile
      const latM = lat/mileToKm/1000; // degrees latitude per mile
      const lonM = lon/mileToKm/1000; // degrees longitude per mile
      
      _.each( bikers_DB, ( val, key ) => { 
        val.latitude = val.latitude + 10*Math.random()*latM;
        val.longitude = val.longitude + 10*Math.random()*lonM;
        saveBikerPosition(val.id, val)
      } );
    }

    filterGeoJSONLayer() {
      // clear the bikers layer of its data
      this.state.geojsonLayer.clearLayers();
      // re-add the bikers so that it filters out subway lines which do not match state.filter
     
      this.state.geojsonLayer.addData(this.state.bikers);
      // fit the map to the new bikers layer's geographic extent
      //if(false) 
      //zoom after filter ? 
      //this.zoomToFeature(this.state.geojsonLayer);
    }

    addGeoJSONLayer(bikers) {
      // create a native Leaflet GeoJSON SVG Layer to add as an interactive overlay to the map
      // an options object is passed to define functions for customizing the layer
      const geojsonLayer = L.geoJson(bikers, {
        onEachFeature: this.onEachFeature,
        pointToLayer: this.pointToLayer,
        filter: this.filterFeatures
      });
      // add our GeoJSON layer to the Leaflet map object
      geojsonLayer.addTo(this.state.map);
      // store the Leaflet GeoJSON layer in our component state for use later
      this.setState({ geojsonLayer });
      // fit the geographic extent of the GeoJSON layer within the map's bounds / viewport
      this.zoomToFeature(geojsonLayer);
    }

    zoomToFeature(target) {
      // pad fitBounds() so features aren't hidden under the Filter UI element
      var fitBoundsParams = {
        paddingTopLeft: [200,10],
        paddingBottomRight: [10,10],
        maxZoom : 13
      };
      
      // set the map's center & zoom so that it fits the geographic extent of the layer
      this.state.map.fitBounds(target.getBounds(), fitBoundsParams);
    }
    filterFeatures(feature, layer) {
      // filter the subway entrances based on the map's current search filter
      // returns true only if the filter value matches the value of feature.properties.LINE
     
      if(feature.properties.TYPE==='bikers')
        return true;      
    }

    pointToLayer(feature, latlng) {
      // renders our GeoJSON points as circle markers, rather than Leaflet's default image markers
      // parameters to style the GeoJSON markers
            
      console.log('feature', feature.properties.TYPE); 
      let fillColor = 'blue';
      if(feature.properties.TYPE) {
        fillColor= 'orange';
      }
      var markerParams = {
        radius: 4,
        fillColor,
        color: '#fff',
        weight: 1,
        opacity: 0.5,
        fillOpacity: 0.8
      };
      
      return L.circleMarker(latlng, markerParams);
    }

    onEachFeature(feature, layer) {
          
    }

    
    renderMenu() {      
  
      const { activeItem } = this.state
      return (
      <div className="mymenuback">
      <Menu inverted className="mymenu">
        <Menu.Item
          name='start'
          active={activeItem === 'start'}
          content='start'
          onClick={this.handleItemClick}
        />
        <Menu.Item
          name='stop'
          active={activeItem === 'stop'}
          content='stop'
          onClick={this.handleItemClick}
        />
        </Menu>       
        
        </div>
      );      
    }
        
    render() {

      return (       
        <div id="mapUI" > 
        {this.renderMenu()}        
      
        <div ref={this.setMapNode} id="map" />
        </div>    
      
      )
    }
   
}


export default MyMap;



  
  
  