import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';

// Cesium and OpenLayers imports
import * as Cesium from 'cesium';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';

@Component({
    selector: 'app-geovisor',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './geovisor.component.html',
    styleUrls: ['./geovisor.component.scss']
})
export class GeovisorComponent implements OnInit, AfterViewInit, OnDestroy {
    projectId: number = 0;
    project: any = null;
    viewerMode: '2D' | '3D' = '2D';
    showMeasurements: boolean = false;

    // Map instances
    private olMap?: Map;
    private cesiumViewer?: Cesium.Viewer;

    layers = [
        { id: 1, name: 'Eje de Carretera', type: 'Vector', visible: true, color: '#FF671C' },
        { id: 2, name: 'Modelo Digital Terreno', type: 'Elevation', visible: true, color: '#6c757d' },
        { id: 3, name: 'Curvas de Nivel', type: 'Vector', visible: false, color: '#8d6e63' }
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private projectService: ProjectService
    ) { }

    ngOnInit() {
        this.projectId = Number(this.route.snapshot.paramMap.get('id'));
        this.projectService.getProject(this.projectId).subscribe(p => this.project = p);
    }

    ngAfterViewInit() {
        this.initOlMap();
        // Cesium will be initialized when mode switches to 3D to save resources
    }

    initOlMap() {
        this.olMap = new Map({
            target: 'map2d',
            layers: [
                new TileLayer({
                    source: new OSM()
                })
            ],
            view: new View({
                center: fromLonLat([-74.0721, 4.7110]), // Default Bogotá
                zoom: 12
            })
        });
    }

    async initCesium() {
        if (this.cesiumViewer) return;

        // Set Cesium base URL for assets
        (window as any).CESIUM_BASE_URL = '/';

        const terrainProvider = await Cesium.createWorldTerrainAsync();

        this.cesiumViewer = new Cesium.Viewer('map3d', {
            terrainProvider: terrainProvider,
            baseLayerPicker: false,
            geocoder: false,
            homeButton: false,
            sceneModePicker: false,
            navigationHelpButton: false,
            animation: false,
            timeline: false,
            fullscreenButton: false
        });
    }

    setMode(mode: '2D' | '3D') {
        this.viewerMode = mode;
        if (mode === '3D') {
            setTimeout(() => this.initCesium(), 100);
        }
    }

    toggleLayer(layer: any) {
        layer.visible = !layer.visible;
        // Logic to update map visibility
    }

    goBack() {
        this.router.navigate(['/dashboard']);
    }

    ngOnDestroy() {
        if (this.cesiumViewer) this.cesiumViewer.destroy();
    }
}
