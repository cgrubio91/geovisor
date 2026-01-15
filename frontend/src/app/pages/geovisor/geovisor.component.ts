import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { LayerService } from '../../services/layer.service';
import { MeasurementService } from '../../services/measurement.service';
import { AnalysisService } from '../../services/analysis.service';

// Cesium and OpenLayers imports
import * as Cesium from 'cesium';
import OlMap from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import KML from 'ol/format/KML';
import Draw from 'ol/interaction/Draw';
import { getArea, getLength } from 'ol/sphere';
import { LineString, Polygon, Point } from 'ol/geom';
import { Style, Stroke, Fill, Circle as CircleStyle } from 'ol/style';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';
import XYZ from 'ol/source/XYZ';
import GeoTIFF from 'ol/source/GeoTIFF';
import WebGLTileLayer from 'ol/layer/WebGLTile';

import { Chart, registerables } from 'chart.js';
import * as JSZip from 'jszip';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';

Chart.register(...registerables);

// Define some common UTM projections just in case
proj4.defs([
    ["EPSG:3116", "+proj=tmerc +lat_0=4.596200416666666 +lon_0=-74.07750791666666 +k=1 +x_0=1000000 +y_0=1000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"],
    ["EPSG:3117", "+proj=tmerc +lat_0=4.596200416666666 +lon_0=-77.07750791666666 +k=1 +x_0=1000000 +y_0=1000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"],
    ["EPSG:9377", "+proj=tmerc +lat_0=4.596200416666666 +lon_0=-74.07750791666666 +k=1 +x_0=5000000 +y_0=2000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"]
]);

// Must call register AFTER defining projections
register(proj4);

@Component({
    selector: 'app-geovisor',
    standalone: true,
    imports: [CommonModule, FormsModule],
    providers: [DecimalPipe],
    templateUrl: './geovisor.component.html',
    styleUrls: ['./geovisor.component.scss']
})
export class GeovisorComponent implements OnInit, AfterViewInit, OnDestroy {
    projectId: number = 0;
    project: any = null;
    viewerMode: '2D' | '3D' = '2D';
    showMeasurements: boolean = false;
    activeTab: 'layers' | 'measurements' | 'analysis' = 'layers';

    showAnalysis: boolean = false;
    showProfileChart: boolean = false;
    profileChart: any = null;
    analysisResult: any = null;

    // Map instances
    private olMap?: OlMap;
    private cesiumViewer?: Cesium.Viewer;

    layers: any[] = [];
    measurements: any[] = [];
    showTemporalSlider: boolean = false;
    temporalValue: number = 50;
    compareLayer1: any = null;
    compareLayer2: any = null;

    activeMeasurement: any = {
        type: '',
        value: 0,
        unit: '',
        color: '#ffcc33',
        width: 2,
        lineType: 'solid',
        notes: ''
    };

    // Drawing interaction
    private drawInteraction?: Draw;
    private measureSource = new VectorSource();
    private measureLayer?: VectorLayer;

    // Persistent measurements layer
    private savedMeasurementsSource = new VectorSource();
    private savedMeasurementsLayer?: VectorLayer;
    private basemapLayer?: TileLayer<any>;

    currentBasemap: string = 'osm';
    basemaps = [
        { id: 'osm', name: 'OpenStreetMap', icon: '🌍' },
        { id: 'satellite', name: 'Satélite (ArcGIS)', icon: '🛰️' },
        { id: 'topo', name: 'Topográfico', icon: '🏔️' },
        { id: 'dark', name: 'Modo Oscuro', icon: '🌑' }
    ];

    // Tracking Cesium DataSources
    private cesiumDataSources: Map<string | number, Cesium.DataSource> = new Map();
    private cesiumMeasurementSources: Map<number, Cesium.DataSource> = new Map();
    mousePosition: string = 'Lat: 0.0000 Lon: 0.0000';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private projectService: ProjectService,
        private layerService: LayerService,
        private measurementService: MeasurementService,
        private analysisService: AnalysisService,
        private decimalPipe: DecimalPipe
    ) { }

    ngOnInit() {
        this.projectId = Number(this.route.snapshot.paramMap.get('id'));
        this.projectService.getProject(this.projectId).subscribe(p => this.project = p);
        this.loadLayers();
        this.loadMeasurements();
    }

    ngAfterViewInit() {
        this.initOlMap();
    }

    loadLayers() {
        this.layerService.getLayers(this.projectId).subscribe(layers => {
            this.layers = layers.map(l => ({
                ...l,
                visible: true,
                opacity: 1,
                color: this.getRandomColor()
            }));
            if (this.olMap) this.layers.forEach(l => this.addLayerToMap(l));
        });
    }

    loadMeasurements() {
        this.measurementService.getMeasurements(this.projectId).subscribe(m => {
            this.measurements = m.map((item: any) => ({ ...item, visible: true }));
            this.renderSavedMeasurements();
        });
    }

    renderSavedMeasurements() {
        this.savedMeasurementsSource.clear();
        const geojson = new GeoJSON();

        this.measurements.forEach(m => {
            if (!m.visible || !m.geometry || !m.geometry.type) return;

            try {
                const featureOrFeatures = geojson.readFeatures(m.geometry, {
                    dataProjection: 'EPSG:4326',
                    featureProjection: 'EPSG:3857'
                });

                const features = Array.isArray(featureOrFeatures) ? featureOrFeatures : [featureOrFeatures];

                features.forEach((feature: Feature<Geometry>) => {
                    feature.setId(m.id);
                    const color = m.params?.color || '#ffcc33';
                    const width = m.params?.width || 2;

                    feature.setStyle(new Style({
                        stroke: new Stroke({
                            color: color,
                            width: width,
                            lineDash: m.params?.lineType === 'dashed' ? [10, 10] : undefined
                        }),
                        fill: new Fill({
                            color: 'rgba(255, 255, 255, 0.2)'
                        }),
                        image: new CircleStyle({
                            radius: 5,
                            fill: new Fill({ color: color })
                        })
                    }));
                    this.savedMeasurementsSource.addFeature(feature);
                });
            } catch (e) {
                console.warn('Error rendering measurement feature:', m.id, e);
            }
        });

        if (this.cesiumViewer) this.renderMeasurementsInCesium();
    }

    async renderMeasurementsInCesium() {
        if (!this.cesiumViewer) return;

        // Clear existing measurement data sources that are no longer in the list
        const currentIds = new Set(this.measurements.map(m => m.id));
        for (const [id, ds] of this.cesiumMeasurementSources.entries()) {
            if (!currentIds.has(id)) {
                this.cesiumViewer.dataSources.remove(ds);
                this.cesiumMeasurementSources.delete(id);
            }
        }

        for (const m of this.measurements) {
            if (!m.visible || !m.geometry || !m.geometry.type) {
                const ds = this.cesiumMeasurementSources.get(m.id);
                if (ds) ds.show = false;
                continue;
            }

            let ds = this.cesiumMeasurementSources.get(m.id);
            if (!ds) {
                // Feature collection to wrap the single geometry
                const featureCollection = {
                    type: 'FeatureCollection',
                    features: [{
                        type: 'Feature',
                        geometry: m.geometry,
                        properties: { ...m.params, id: m.id, name: m.name }
                    }]
                };

                try {
                    ds = await Cesium.GeoJsonDataSource.load(featureCollection, {
                        stroke: Cesium.Color.fromCssColorString(m.params?.color || '#ffcc33'),
                        fill: Cesium.Color.fromCssColorString(m.params?.color || '#ffcc33').withAlpha(0.2),
                        strokeWidth: m.params?.width || 2
                    });
                    this.cesiumViewer.dataSources.add(ds);
                    this.cesiumMeasurementSources.set(m.id, ds);
                } catch (e) {
                    console.error('Error loading measurement in Cesium:', e);
                    continue;
                }
            }

            if (ds) {
                ds.show = m.visible;
                // Update styling if needed (though GeoJsonDataSource options are mostly applied during load)
            }
        }
    }

    getRandomColor() {
        const colors = ['#FF671C', '#6c757d', '#8d6e63', '#4caf50', '#2196f3', '#ff9800'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    initOlMap() {
        this.measureLayer = new VectorLayer({
            source: this.measureSource,
            style: (feature) => {
                return new Style({
                    fill: new Fill({ color: 'rgba(255, 255, 255, 0.2)' }),
                    stroke: new Stroke({
                        color: this.activeMeasurement.color,
                        width: this.activeMeasurement.width,
                        lineDash: this.activeMeasurement.lineType === 'dashed' ? [10, 10] : undefined
                    }),
                    image: new CircleStyle({ radius: 5, fill: new Fill({ color: this.activeMeasurement.color }) })
                });
            }
        });

        this.savedMeasurementsLayer = new VectorLayer({
            source: this.savedMeasurementsSource
        });

        this.basemapLayer = new TileLayer({
            source: new OSM()
        });

        this.olMap = new OlMap({
            target: 'map2d',
            layers: [
                this.basemapLayer,
                this.savedMeasurementsLayer,
                this.measureLayer!
            ],
            view: new View({
                center: fromLonLat([-74.0721, 4.7110]),
                zoom: 12
            })
        });

        this.olMap.on('pointermove', (evt) => {
            const coords = toLonLat(evt.coordinate);
            this.mousePosition = `Lat: ${coords[1].toFixed(4)} Lon: ${coords[0].toFixed(4)}`;
        });

        if (this.layers.length > 0) this.layers.forEach(l => this.addLayerToMap(l));
    }

    switchBasemap(id: string) {
        this.currentBasemap = id;
        if (!this.basemapLayer) return;

        let source: any;
        switch (id) {
            case 'satellite':
                source = new XYZ({
                    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                    maxZoom: 19
                });
                break;
            case 'topo':
                source = new XYZ({
                    url: 'https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png',
                    maxZoom: 17
                });
                break;
            case 'dark':
                source = new XYZ({
                    url: 'https://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
                    maxZoom: 20
                });
                break;
            default:
                source = new OSM();
        }
        this.basemapLayer.setSource(source);

        // Update Cesium as well
        if (this.cesiumViewer) {
            // Cesium logic to change base layer if needed
        }
    }

    async initCesium() {
        if (this.cesiumViewer) return;
        (window as any).CESIUM_BASE_URL = '/';
        const terrainProvider = await Cesium.createWorldTerrainAsync();

        this.cesiumViewer = new Cesium.Viewer('map3d', {
            terrainProvider: undefined,
            baseLayerPicker: true,
            geocoder: false,
            homeButton: false,
            sceneModePicker: true,
            navigationHelpButton: false,
            animation: false,
            timeline: false,
            fullscreenButton: false,
            scene3DOnly: false,
            sceneMode: Cesium.SceneMode.COLUMBUS_VIEW // Start in 2.5D (Flat) for speed
        });

        if (this.cesiumViewer) {
            if (this.cesiumViewer.scene.skyAtmosphere) {
                this.cesiumViewer.scene.skyAtmosphere.show = false;
            }
            if (this.cesiumViewer.scene.fog) {
                this.cesiumViewer.scene.fog.enabled = false;
            }
            this.cesiumViewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#eef2f5');
        }

        // Use a faster terrain provider if needed, or stick to ellipsoid
        // this.cesiumViewer.terrainProvider = await Cesium.createWorldTerrainAsync();

        this.layers.forEach(l => this.addLayerToMap(l));
        this.renderSavedMeasurements();
    }

    setMode(mode: '2D' | '3D') {
        this.viewerMode = mode;
        if (mode === '3D') {
            setTimeout(() => this.initCesium(), 100);
        }
    }

    getLayerUrl(layer: any): string {
        if (!layer.file_path) return '';
        let path = layer.file_path.replace(/\\/g, '/');
        const base = "http://localhost:8000/static/";

        let subPath = '';
        if (path.toLowerCase().includes('uploads/')) {
            subPath = 'uploads/' + path.split(/uploads\//i)[1];
        } else if (path.toLowerCase().includes('datos/')) {
            subPath = 'datos/' + path.split(/datos\//i)[1];
        } else {
            subPath = 'uploads/' + path;
        }

        return base + subPath.split('/').map(p => encodeURIComponent(p)).join('/');
    }

    addLayerToMap(layer: any) {
        if (!layer.visible) return;
        const url = this.getLayerUrl(layer);

        // Mapping common extensions to formats
        const format = (layer.format || '').toLowerCase();

        if (this.olMap) {
            const existingLayer = this.olMap.getLayers().getArray().find((l: any) => l.get('id') === layer.id);
            if (!existingLayer) {
                let olLyr: any;
                if (format === 'geojson' || format === 'json') {
                    olLyr = new VectorLayer({
                        source: new VectorSource({ url: url, format: new GeoJSON() })
                    });
                    olLyr.set('id', layer.id);
                } else if (format === 'kml') {
                    olLyr = new VectorLayer({
                        source: new VectorSource({ url: url, format: new KML({ extractStyles: true }) })
                    });
                    olLyr.set('id', layer.id);
                } else if (format === 'kmz') {
                    fetch(this.getLayerUrl(layer))
                        .then(res => res.arrayBuffer())
                        .then(buffer => JSZip.loadAsync(buffer))
                        .then(zip => {
                            const kmlFile = Object.values(zip.files).find(f => f.name.endsWith('.kml'));
                            if (kmlFile) return kmlFile.async('string');
                            throw new Error('No KML found in KMZ');
                        })
                        .then(kmlText => {
                            const vectorSource = new VectorSource({
                                features: new KML().readFeatures(kmlText, {
                                    featureProjection: 'EPSG:3857'
                                })
                            });
                            const kmlLayer = new VectorLayer({ source: vectorSource });
                            kmlLayer.set('id', layer.id);
                            this.olMap?.addLayer(kmlLayer);
                            this.olMap?.getView().fit(vectorSource.getExtent(), { duration: 1000, padding: [100, 100, 100, 100] });
                        })
                        .catch(err => {
                            console.error('Error loading KMZ:', err);
                            alert(`Error al cargar KMZ: ${layer.name}.`);
                        });
                } else if (format === 'tiff' || format === 'geotiff' || format === 'tif') {
                    console.log('--- Loading GeoTIFF ---', layer.name, url);
                    const source = new GeoTIFF({
                        sources: [{ url: url }],
                        normalize: true
                    });
                    olLyr = new WebGLTileLayer({
                        source: source,
                        opacity: layer.opacity || 1
                    });
                    olLyr.set('id', layer.id);
                    source.getView().then(v => {
                        if (v.extent && layer.visible && this.olMap) {
                            this.olMap.getView().fit(v.extent, { duration: 1000, padding: [100, 100, 100, 100] });
                        }
                    }).catch(err => console.error('GeoTIFF error:', layer.name, err));
                }
                else if (format === 'dwg' || format === 'dxf') {
                    console.warn('Formatos CAD (DWG/DXF) requieren conversión previa a GeoJSON.');
                }

                if (olLyr) {
                    this.olMap.addLayer(olLyr);
                    const source: any = olLyr.getSource();

                    // Solo intentar getExtent si el método existe (GeoTIFF no lo tiene síncrono)
                    if (source && typeof source.getExtent === 'function') {
                        source.once('change', () => {
                            if (source.getState() === 'ready') {
                                const extent = source.getExtent();
                                if (extent && !extent.includes(Infinity)) {
                                    this.olMap?.getView().fit(extent, { duration: 1000, padding: [100, 100, 100, 100] });
                                }
                            }
                        });
                    }
                }
            }
        }

        if (this.cesiumViewer) {
            const existingDS = this.cesiumDataSources.get(layer.id);
            if (!existingDS) {
                if (format === 'geojson' || format === 'json') {
                    Cesium.GeoJsonDataSource.load(url).then(ds => {
                        this.cesiumViewer?.dataSources.add(ds);
                        this.cesiumDataSources.set(layer.id, ds);
                    });
                } else if (format === 'kml' || format === 'kmz') {
                    Cesium.KmlDataSource.load(url).then(ds => {
                        this.cesiumViewer?.dataSources.add(ds);
                        this.cesiumDataSources.set(layer.id, ds);
                        if (layer.visible) this.cesiumViewer?.zoomTo(ds);
                    });
                } else if (format === 'tiff' || format === 'geotiff' || format === 'tif') {
                    // Basic imagery provider for tiff in 3D
                    const imageryPath = url;
                    const provider = new Cesium.SingleTileImageryProvider({
                        url: imageryPath,
                        rectangle: Cesium.Rectangle.fromDegrees(-180, -90, 180, 90) // Fallback, would need actual extent
                    });
                    const lyr = this.cesiumViewer.imageryLayers.addImageryProvider(provider);
                    this.cesiumDataSources.set(layer.id, lyr as any);
                }
            } else {
                const ds: any = existingDS;
                if (ds && typeof ds.show !== 'undefined') {
                    ds.show = layer.visible;
                }
            }
        }
    }

    toggleLayer(layer: any) {
        layer.visible = !layer.visible;
        this.syncLayerState(layer);
    }

    syncLayerState(layer: any) {
        if (this.olMap) {
            const olLayer = this.olMap.getLayers().getArray().find((l: any) => l.get('id') === layer.id);
            if (olLayer) {
                olLayer.setVisible(layer.visible);
                if ((olLayer as any).setOpacity) (olLayer as any).setOpacity(layer.opacity ?? 1);
            }
            else if (layer.visible) this.addLayerToMap(layer);
        }
        if (this.cesiumViewer) {
            const ds = this.cesiumDataSources.get(layer.id);
            if (ds) {
                if ('show' in ds) ds.show = layer.visible;
                // Opacity is harder in Cesium for DataSources, mostly for ImageryLayers
            }
            else if (layer.visible) this.addLayerToMap(layer);
        }
    }

    updateTemporalComparison() {
        if (!this.compareLayer1 || !this.compareLayer2) return;

        // layer1 opacity: 1 -> 0 as temporalValue goes 0 -> 100
        // layer2 opacity: 0 -> 1 as temporalValue goes 0 -> 100
        this.compareLayer1.opacity = (100 - this.temporalValue) / 100;
        this.compareLayer2.opacity = this.temporalValue / 100;

        this.compareLayer1.visible = this.compareLayer1.opacity > 0;
        this.compareLayer2.visible = this.compareLayer2.opacity > 0;

        this.syncLayerState(this.compareLayer1);
        this.syncLayerState(this.compareLayer2);
    }

    toggleMeasurement(m: any) {
        m.visible = !m.visible;
        this.renderSavedMeasurements();
    }

    startMeasurement(type: string) {
        if (this.drawInteraction) {
            this.olMap?.removeInteraction(this.drawInteraction);
            this.drawInteraction = undefined;
        }
        this.measureSource.clear();

        if (type === 'volume' && this.viewerMode === '2D') {
            alert('El cálculo de volumen requiere la vista 3D.');
            this.setMode('3D');
            return;
        }

        this.activeMeasurement = {
            type, value: 0, unit: type === 'distance' ? 'm' : type === 'area' ? 'm²' : 'm³',
            color: this.activeMeasurement.color || '#ffcc33',
            width: this.activeMeasurement.width || 2,
            lineType: this.activeMeasurement.lineType || 'solid',
            notes: ''
        };

        if (this.viewerMode === '2D' && this.olMap) {
            this.addInteraction(type);
        } else if (this.viewerMode === '3D' && this.cesiumViewer) {
            this.startCesiumMeasurement(type);
        }
    }

    addInteraction(type: string) {
        if (this.drawInteraction) this.olMap?.removeInteraction(this.drawInteraction);
        const typeGeom = type === 'distance' ? 'LineString' : 'Polygon';
        this.drawInteraction = new Draw({
            source: this.measureSource, type: typeGeom as any
        });

        this.olMap?.addInteraction(this.drawInteraction);

        this.drawInteraction.on('drawend', (evt) => {
            const geom = evt.feature.getGeometry();
            if (!geom) return;

            let output = 0;
            const geojson = new GeoJSON();

            // Clone and transform to WGS84 (EPSG:4326) for the backend
            const geomIn4326 = geom.clone().transform('EPSG:3857', 'EPSG:4326');
            const geomData = JSON.parse(geojson.writeGeometry(geomIn4326));

            if (geom instanceof Polygon) {
                output = getArea(geom);
            } else if (geom instanceof LineString) {
                output = getLength(geom);
            }

            this.activeMeasurement.value = output.toFixed(2);
            this.activeMeasurement.geometry = geomData;

            if (this.olMap && this.drawInteraction) this.olMap.removeInteraction(this.drawInteraction);
        });
    }

    startCesiumMeasurement(type: string) {
        alert('Modo de medición 3D activado (Simulado).');
        setTimeout(() => {
            this.activeMeasurement.value = (Math.random() * 5000 + 100).toFixed(2);
            this.activeMeasurement.geometry = { type: 'Point', coordinates: [-74.0721, 4.7110] };
        }, 1000);
    }

    saveMeasurement() {
        if (!this.projectId) {
            alert('Error: Proyecto no definido.');
            return;
        }

        if (this.activeMeasurement.value > 0) {
            const payload = {
                name: `Medición ${new Date().toLocaleTimeString()}`,
                type: this.activeMeasurement.type,
                value: Number(this.activeMeasurement.value),
                unit: this.activeMeasurement.unit,
                project_id: this.projectId,
                geometry: this.activeMeasurement.geometry || {},
                notes: this.activeMeasurement.notes,
                params: {
                    color: this.activeMeasurement.color || '#ffcc33',
                    width: Number(this.activeMeasurement.width) || 2,
                    lineType: this.activeMeasurement.lineType || 'solid'
                }
            };

            this.measurementService.createMeasurement(payload).subscribe({
                next: (m) => {
                    this.measurements.push({ ...m, visible: true });
                    this.activeMeasurement = {
                        type: '',
                        value: 0,
                        unit: '',
                        color: this.activeMeasurement.color,
                        width: this.activeMeasurement.width,
                        lineType: this.activeMeasurement.lineType,
                        notes: '',
                        geometry: null
                    };
                    if (this.measureSource) this.measureSource.clear();
                    this.renderSavedMeasurements();
                    this.showMeasurements = false; // Close modal after saving
                },
                error: (err) => {
                    console.error('Error saving measurement:', err);
                    alert('Error al guardar la medición. Verifique la conexión.');
                }
            });
        }
    }

    startAnalysis(type: 'profile' | 'volume' | 'slope') {
        this.activeMeasurement.type = type;
        if (type === 'profile') {
            this.startMeasurement('distance');
        } else if (type === 'volume') {
            this.startMeasurement('area');
        }
    }

    executeAnalysis() {
        if (!this.activeMeasurement.geometry) {
            alert('Primero dibuje el área o línea en el mapa.');
            return;
        }

        const layer = this.layers.find(l => l.visible && (['tiff', 'geotiff', 'tif'].includes(l.format?.toLowerCase())));
        if (!layer) {
            alert('Se requiere una capa GeoTIFF (MDS/MDT) visible para este análisis.');
            return;
        }

        if (this.activeMeasurement.type === 'profile') {
            this.analysisService.getProfile(layer.id, this.activeMeasurement.geometry).subscribe({
                next: (res) => {
                    this.analysisResult = res;
                    this.showProfileChart = true;
                    setTimeout(() => this.renderProfileChart(res.profile), 100);
                },
                error: (err) => {
                    console.error('Profile error:', err);
                    alert('Error en el análisis de perfil. Asegúrese de que la línea esté sobre la ortofoto.');
                }
            });
        } else if (this.activeMeasurement.type === 'volume') {
            this.analysisService.calculateVolume(layer.id, this.activeMeasurement.geometry).subscribe({
                next: (res) => {
                    this.analysisResult = res;
                    this.activeMeasurement.value = res.net;
                    this.activeMeasurement.unit = res.unit || 'm3';
                    this.activeMeasurement.notes = `Corte: ${res.cut.toFixed(2)} m3, Relleno: ${res.fill.toFixed(2)} m3, Neto: ${res.net.toFixed(2)} m3`;
                    alert(`Análisis de Volumen:\nNeto: ${res.net.toFixed(2)} m³\nCorte: ${res.cut.toFixed(2)} m³\nRelleno: ${res.fill.toFixed(2)} m³`);
                },
                error: (err) => {
                    console.error('Volume error:', err);
                    alert('Error en el cálculo de volumen.');
                }
            });
        }
    }

    renderProfileChart(data: any[]) {
        const ctx = document.getElementById('profileChart') as HTMLCanvasElement;
        if (!ctx) return;

        if (this.profileChart) {
            this.profileChart.destroy();
        }

        const elevations = data.map(p => p.z);
        const labels = data.map(p => p.dist.toFixed(1));

        this.profileChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Elevación (m)',
                    data: elevations,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    fill: true,
                    tension: 0.2,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { title: { display: true, text: 'Distancia (m)' } },
                    y: { title: { display: true, text: 'Elevación (m)' } }
                }
            }
        });
    }

    downloadReport(format: 'pdf' | 'excel') {
        this.analysisService.exportReport(this.projectId, format).subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Reporte_Interventoria_${this.projectId}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
                a.click();
                window.URL.revokeObjectURL(url);
            },
            error: (err) => alert('Error al generar el reporte')
        });
    }

    deleteMeasurement(id: any) {
        if (confirm('¿Estás seguro de eliminar esta medición?')) {
            const numericId = Number(id);
            this.measurementService.deleteMeasurement(numericId).subscribe({
                next: () => {
                    this.measurements = this.measurements.filter(m => Number(m.id) !== numericId);
                    this.renderSavedMeasurements();
                },
                error: (err) => {
                    console.error('Error deleting measurement:', err);
                    alert('Error al eliminar la medición.');
                }
            });
        }
    }

    zoomToLayer(layer: any) {
        if (!layer.visible) {
            this.toggleLayer(layer);
        }

        if (this.viewerMode === '2D' && this.olMap) {
            const allLayers = this.olMap.getLayers().getArray();
            const olLayer: any = allLayers.find((l: any) => l.get('id') === layer.id);

            if (olLayer) {
                const source = olLayer.getSource();
                if (source) {
                    if (source instanceof GeoTIFF) {
                        source.getView().then((view: any) => {
                            if (view && view.extent) {
                                this.olMap?.getView().fit(view.extent, { duration: 1000, padding: [100, 100, 100, 100] });
                            }
                        });
                    } else {
                        const extent = source.getExtent ? source.getExtent() : null;
                        if (extent && !extent.includes(Infinity)) {
                            this.olMap.getView().fit(extent, { duration: 1000, padding: [100, 100, 100, 100] });
                        } else if (source.once) {
                            source.once('change', () => {
                                const newExtent = source.getExtent();
                                if (newExtent && !newExtent.includes(Infinity)) {
                                    this.olMap?.getView().fit(newExtent, { duration: 1000, padding: [100, 100, 100, 100] });
                                }
                            });
                        }
                    }
                }
            }
        } else if (this.viewerMode === '3D' && this.cesiumViewer) {
            const ds = this.cesiumDataSources.get(layer.id);
            if (ds) {
                if (ds instanceof Cesium.ImageryLayer) {
                    this.cesiumViewer.flyTo(ds);
                } else {
                    this.cesiumViewer.zoomTo(ds);
                }
            }
        }
    }

    zoomToMeasurement(m: any) {
        if (!m.visible) {
            this.toggleMeasurement(m);
        }

        if (this.viewerMode === '2D' && this.olMap) {
            const feature = this.savedMeasurementsSource.getFeatureById(m.id);
            if (feature) {
                const geom = feature.getGeometry();
                if (geom) {
                    this.olMap.getView().fit(geom.getExtent(), { duration: 1000, padding: [100, 100, 100, 100] });
                }
            }
        } else if (this.viewerMode === '3D' && this.cesiumViewer) {
            const ds = this.cesiumMeasurementSources.get(m.id);
            if (ds) this.cesiumViewer.zoomTo(ds);
        }
    }

    zoomToAll() {
        if (this.viewerMode === '2D' && this.olMap) {
            const extent = this.savedMeasurementsSource.getExtent();
            if (extent && !extent.includes(Infinity)) {
                this.olMap.getView().fit(extent, { duration: 1000, padding: [100, 100, 100, 100] });
            }
        } else if (this.viewerMode === '3D' && this.cesiumViewer) {
            // Zoom to all data sources in the viewer
            const allDS = [];
            for (let i = 0; i < this.cesiumViewer.dataSources.length; i++) {
                allDS.push(this.cesiumViewer.dataSources.get(i));
            }
            if (allDS.length > 0) this.cesiumViewer.zoomTo(allDS as any);
        }
    }

    goBack() { this.router.navigate(['/dashboard']); }
    goToUpload() { this.router.navigate(['/admin/files']); }
    ngOnDestroy() { if (this.cesiumViewer) this.cesiumViewer.destroy(); }
}
