import React, { useEffect, useState, forwardRef, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  ZoomControl,
  useMap,
  GeoJSON
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import BoundingBoxSelection from './BoundingBoxSelection';
import { ScaleControl } from 'react-leaflet';
import Switch from '@mui/material/Switch';
import { Typography } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import { MapOverlay } from './Overlays';
import { LegendControl } from './Legend';
import { MapClickHandler } from './Queries';
import './MapView.css';
// import { GeoRasterLayer } from 'georaster';
import GeoRaster from './GeoRasterLayer'
// import georaster from 'georaster';
// import GeoRasterLayer from 'georaster-layer-for-leaflet';



// const UpdateLayer = ({ wmsParams, geoserverUrl }) => {
//   const map = useMap();
//   {/* <GeoRasterLayer */ }
//   // paths={["http://drop4crop:88/api/layers/sdfrs/cog"]}
//   // resolution={RESOLUTION}
//   pixelValuesToColorFn = { setPixelColours }
//   {/* /> */ }
//   var url_to_geotiff_file = "http://drop4crop:88/api/layers/sdfrs/cog";
//   fetch(url_to_geotiff_file).then(response =>
//     response.arrayBuffer()).then(arrayBuffer => {
//       parseGeoraster(arrayBuffer).then(georaster => {
//         console.log("georaster", georaster);
//         const layer = new GeoRasterLayer({
//           georaster: georaster,
//           opacity: 0.7,
//           pixelValuesToColorFn: setPixelColours
//           resolution: 64

//         });
//         layer.addTo(map);
//       }
//       )
//     }
//     )


// useEffect(() => {
//     if (!wmsParams) return;

//     const layer = L.tileLayer.wms(geoserverUrl, {
//       layers: wmsParams,
//       format: 'image/png',
//       transparent: true,
//       attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//     });

//     map.addLayer(layer);

//     return () => {
//       map.removeLayer(layer);
//     };
//   }, [wmsParams, geoserverUrl, map]);

// return null;
// };


const MapView = forwardRef(({
  wmsParams,
  geoserverUrl,
  setBoundingBox,
  enableSelection,
  setEnableSelection,
  countryAverages,
  setCountryAverages,
  countryPolygons,
  globalAverage,
  countryAverageValues,
}, ref) => {
  const [highlightedFeature, setHighlightedFeature] = useState(null);

  const highlightFeature = useCallback((e) => {
    const layer = e.target;
    setHighlightedFeature(layer.feature);
    layer.bringToFront();
  }, []);

  const resetHighlight = useCallback(() => {
    setHighlightedFeature(null);
  }, []);


  const geoJsonStyle = useCallback((feature) => ({
    weight: 2,
    color: highlightedFeature && highlightedFeature === feature ? '#ff7800' : '#3388ff',
    opacity: 1,
    fillOpacity: 0.2,
    fillColor: '#3388ff'
  }), [highlightedFeature]);


  const onEachFeature = useCallback((feature, layer) => {
    layer.on({
      click: highlightFeature,
    });
  }, [highlightFeature]);

  const corner1 = L.latLng(-90, -200);
  const corner2 = L.latLng(90, 200);
  const bounds = L.latLngBounds(corner1, corner2);

  return (
    <>
      <div style={toggleContainerMapStyle}>
        <FormControlLabel
          control={
            <Switch
              checked={countryAverages}
              size="small"
              onChange={(e) => {
                e.stopPropagation();
                setCountryAverages(e.target.checked);
              }}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#d1a766', // Active track color
                },
                '& .MuiSwitch-track': {
                  backgroundColor: countryAverages ? '#d1a766' : '#888', // Active: '#d1a766', Inactive: '#888'
                },
                '& .MuiSwitch-thumb': {
                  backgroundColor: countryAverages ? '#d1a766' : '#ccc', // Active: '#d1a766', Inactive: '#ccc'
                },
              }}
            />
          }
          label={<Typography variant="body2">Country Averages</Typography>}
          labelPlacement="end"
        />
      </div>
      <MapContainer
        center={[35, 20]}
        zoom={1}
        style={{ height: "100vh", width: "100%" }}
        zoomControl={false}
        maxBoundsViscosity={1.0}
        maxBounds={bounds}
        minZoom={3}
      >
        {/* <UpdateLayer wmsParams={wmsParams} geoserverUrl={geoserverUrl} /> */}
        <TileLayer
          url='https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png'
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains='abcd'
          maxZoom={20}
          zIndex={0} // Ensuring the base layer is below the WMS layer
        />
        <GeoRaster
          url={"http://drop4crop:88/api/layers/sdfrs/cog"}
          opacity={0.7}
          resolution={256}
        // resolution={ RESOLUTION }
        // pixelValuesToColorFn={setPixelColours}
        />
        {countryAverages && (
          <>
            <GeoJSON
              data={countryPolygons}
              style={geoJsonStyle}
              onEachFeature={onEachFeature}
            />
          </>
        )}
        {/* <MapOverlay wmsParams={wmsParams} /> */}
        <ZoomControl position="bottomright" />
        <ScaleControl imperial={false} maxWidth={250} />
        <MapClickHandler wmsParams={wmsParams} geoserverUrl={geoserverUrl} countryAverages={countryAverages} highlightedFeature={highlightedFeature} countryPolygons={countryPolygons} countryAverageValues={countryAverageValues} />
        <BoundingBoxSelection ref={ref} setBoundingBox={setBoundingBox} enableSelection={enableSelection} setEnableSelection={setEnableSelection} />
        <LegendControl wmsParams={wmsParams} geoserverUrl={geoserverUrl} globalAverage={globalAverage} />

      </MapContainer>
    </>
  );
});




export default MapView;

const toggleContainerMapStyle = {
  position: 'absolute',
  bottom: '110px',
  left: '100px',
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#333',
  color: '#d3d3d3',
  borderColor: 'rgba(0, 0, 0, 0.7)',
  boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
  zIndex: 1000, // Ensure the toggle switch is above the map
  opacity: '0.8',
  borderTop: '1px solid #444',
  justifyContent: 'center',
  paddingLeft: '20px',
  borderRadius: '10px',
};
