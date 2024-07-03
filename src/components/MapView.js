import React, { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  useMap,
  ZoomControl,
  useMapEvent,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

const UpdateLayer = ({ wmsParams }) => {
  const map = useMap();
  // const [layerExists, setLayerExists] = useState(null);

  // useEffect(() => {
  //   const checkLayerExists = async () => {
  //     try {
  //       const response = await axios.get("https://drop4crop-api-dev.epfl.ch/geoserver/ows", {
  //         params: {
  //           service: 'WMS',
  //           version: '1.1.0',
  //           request: 'GetCapabilities',
  //           tiled: true,
  //         },
  //       });

  //       console.log(response);
  //       if (response.status === 200) {

  //         const parser = new DOMParser();
  //         const xmlDoc = parser.parseFromString(response.data, 'text/xml');
  //         const layers = xmlDoc.getElementsByTagName('Layer');
  //         let layerFound = false;

  //         for (let i = 0; i < layers.length; i++) {
  //           const nameElement = layers[i].getElementsByTagName('Name')[0];
  //           if (nameElement && nameElement.textContent === wmsParams) {
  //             layerFound = true;
  //             break;
  //           }
  //         }

  //         setLayerExists(layerFound);
  //       } else {
  //         console.log('Failed to fetch capabilities');
  //         setLayerExists(false);
  //       }
  //     } catch (error) {
  //       console.error('Error checking layer existence:', error);
  //       setLayerExists(false);
  //     }
  //   };

  //   checkLayerExists();
  // }, [wmsParams]);

  useEffect(() => {
    // if (layerExists) {
      console.log('Adding WMS layer:', wmsParams);
    const wmsLayer = L.tileLayer.wms("https://drop4crop-api-dev.epfl.ch/geoserver/ows", {
      // const wmsLayer = L.tileLayer.wms("http://localhost:8015/wms", {
        layers: wmsParams,
        format: "image/png",
        transparent: true,
        version: "1.3.0",
        tiled: true,
        zIndex: 2 // Setting zIndex to ensure WMS layer is on top
      }).addTo(map);

      return () => {
        map.removeLayer(wmsLayer);
      };
    // } else if (layerExists === false) {
    //   const overlay = L.DomUtil.create('div', 'map-overlay');
    //   overlay.innerHTML = '<div class="overlay-content">No layer available. Please refer to the publication for more information.</div>';
    //   map.getContainer().appendChild(overlay);

    //   return () => {
    //     map.getContainer().removeChild(overlay);
    //   };
    // }
  }, [wmsParams, map,
    // layerExists
  ]);

  return null;
};

const MapClickHandler = ({ wmsParams }) => {
  const map = useMap();

  useMapEvent('click', async (e) => {
    const bbox = map.getBounds().toBBoxString();
    const size = map.getSize();
    const width = size.x;
    const height = size.y;

    const url = `https://drop4crop-api-dev.epfl.ch/geoserver/ows?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&LAYERS=${wmsParams}&QUERY_LAYERS=${wmsParams}&STYLES=&BBOX=${bbox}&CRS=CRS:84&WIDTH=${width}&HEIGHT=${height}&FORMAT=image/png&INFO_FORMAT=text/plain&I=${Math.floor(e.containerPoint.x)}&J=${Math.floor(e.containerPoint.y)}`;

    try {
      const response = await axios.get(url);
      const responseText = response.data;

      const match = responseText.match(/-{40,}\n(.*?)\n-{40,}/s);
      const value = match ? match[1].trim() : 'No data';

      L.popup()
        .setLatLng(e.latlng)
        .setContent(`${value}`)
        .openOn(map);
    } catch (error) {
      console.error('Error fetching WMS data:', error);
    }
  });

  return null;
};

const MapView = ({ wmsParams }) => {
  const corner1 = L.latLng(-90, -200)
  const corner2 = L.latLng(90, 200)
  const bounds = L.latLngBounds(corner1, corner2)

  return (
    <MapContainer
      center={[35, 20]}
      zoom={4}
      style={{ height: "100vh", width: "100%"}}
      zoomControl={false}
      maxBoundsViscosity={1.0}
      maxBounds={bounds}
      minZoom={3}
    >
      <UpdateLayer wmsParams={wmsParams} />
      <TileLayer
        url='https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png'
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        subdomains='abcd'
        maxZoom={20}
        zIndex={0} // Ensuring the base layer is below the WMS layer
      />
      <ZoomControl position="bottomright" />
      <MapClickHandler wmsParams={wmsParams} />
    </MapContainer>
  );
};

export default MapView;
