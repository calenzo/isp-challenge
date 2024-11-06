require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/renderers/ClassBreaksRenderer",
  "esri/widgets/Legend",
], function (Map, MapView, FeatureLayer, ClassBreaksRenderer, Legend) {
  const map = new Map({
    basemap: "dark-gray",
  });

  const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [-77, 39],
    zoom: 6,
  });

  const countiesLayer = new FeatureLayer({
    url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Census_Counties/FeatureServer/0",
    outFields: ["*"],
  });

  const camerasLayer = new FeatureLayer({
    url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/Traffic_Cameras/FeatureServer/0",
  });

  map.add(countiesLayer);
  map.add(camerasLayer);

  function generateChoroplethMap() {
    camerasLayer
      .queryFeatures({
        where: "1=1",
        geometry: countiesLayer.fullExtent,
        spatialRelationship: "intersects",
        outFields: ["*"],
        returnGeometry: false,
      })
      .then((results) => {
        const cameraCounts = {};

        results.features.forEach((feature) => {
          const countyId = feature.attributes.CountyID;
          cameraCounts[countyId] = (cameraCounts[countyId] || 0) + 1;
        });

        const renderer = new ClassBreaksRenderer({
          field: "camera_count",
          legendOptions: {
            title: "Contagem de Câmeras por Condado",
          },
          classBreakInfos: [
            {
              minValue: 0,
              maxValue: 5,
              symbol: { type: "simple-fill", color: "#FFEDA0" },
              label: "0-5 Câmeras",
            },
            {
              minValue: 6,
              maxValue: 15,
              symbol: { type: "simple-fill", color: "#FEB24C" },
              label: "6-15 Câmeras",
            },
            {
              minValue: 16,
              maxValue: 30,
              symbol: { type: "simple-fill", color: "#FD8D3C" },
              label: "16-30 Câmeras",
            },
            {
              minValue: 31,
              maxValue: 50,
              symbol: { type: "simple-fill", color: "#FC4E2A" },
              label: "31-50 Câmeras",
            },
            {
              minValue: 51,
              maxValue: 100,
              symbol: { type: "simple-fill", color: "#E31A1C" },
              label: "51-100 Câmeras",
            },
            {
              minValue: 101,
              maxValue: 200,
              symbol: { type: "simple-fill", color: "#BD0026" },
              label: "101-200 Câmeras",
            },
            {
              minValue: 201,
              maxValue: Infinity,
              symbol: { type: "simple-fill", color: "#800026" },
              label: "200+ Câmeras",
            },
          ],
        });
        
        countiesLayer.renderer = renderer;

        const legend = new Legend({
          view: view,
          layerInfos: [
            {
              layer: countiesLayer,
              title: "Contagem de Câmeras por Condado",
            },
          ],
        });
        view.ui.add(legend, "bottom-right");
      });
  }

  generateChoroplethMap();
});
