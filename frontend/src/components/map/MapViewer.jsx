import { useEffect, useRef } from 'react'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { KML, GeoJSON } from 'ol/format'
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style'
import { Draw } from 'ol/interaction'
import { getArea, getLength } from 'ol/sphere'

export default function MapViewer({ layers = [], activeTool = 'none', onMeasurementEnd }) {
    const mapElement = useRef()
    const mapRef = useRef()
    const layersRef = useRef({})
    const drawInteractionRef = useRef()
    const measureSourceRef = useRef(new VectorSource()) // Source for temporary measurements

    // Base URL
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

    useEffect(() => {
        // Initialize Map
        const intialMap = new Map({
            target: mapElement.current,
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
                // Layer for drawing measurements
                new VectorLayer({
                    source: measureSourceRef.current,
                    style: new Style({
                        fill: new Fill({ color: 'rgba(255, 165, 0, 0.2)' }),
                        stroke: new Stroke({ color: '#ffcc33', width: 3 }),
                        image: new CircleStyle({
                            radius: 7,
                            fill: new Fill({ color: '#ffcc33' }),
                        }),
                    }),
                    zIndex: 999
                })
            ],
            view: new View({
                center: [0, 0],
                zoom: 2,
            }),
            controls: [],
        })

        mapRef.current = intialMap

        // Resize Observer
        const observer = new ResizeObserver(() => {
            intialMap.updateSize()
        })
        if (mapElement.current) observer.observe(mapElement.current)

        return () => {
            observer.disconnect()
            intialMap.setTarget(null)
        }
    }, [])

    // Handle Layers Update
    useEffect(() => {
        if (!mapRef.current) return
        const map = mapRef.current

        const currentLayerIds = new Set(layers.map(l => l.id))

        Object.keys(layersRef.current).forEach(layerId => {
            if (!currentLayerIds.has(parseInt(layerId))) {
                map.removeLayer(layersRef.current[layerId])
                delete layersRef.current[layerId]
            }
        })

        layers.forEach(layer => {
            if (!layersRef.current[layer.id]) {
                addLayerToMap(layer)
            }
        })
    }, [layers])

    // Handle Active Tool Interaction
    useEffect(() => {
        if (!mapRef.current) return
        const map = mapRef.current

        // Remove previous interaction
        if (drawInteractionRef.current) {
            map.removeInteraction(drawInteractionRef.current)
            drawInteractionRef.current = null
        }

        if (activeTool === 'none') return

        const type = activeTool === 'distance' ? 'LineString' : 'Polygon'

        const draw = new Draw({
            source: measureSourceRef.current,
            type: type,
        })

        draw.on('drawend', (evt) => {
            const geom = evt.feature.getGeometry()
            let value = 0
            let unit = ''

            // Calculate geodesic metrics
            if (activeTool === 'distance') {
                value = getLength(geom)
                unit = 'meters'
                if (value > 1000) { value /= 1000; unit = 'kilometers' }
            } else {
                value = getArea(geom)
                unit = 'square_meters'
                if (value > 10000) { value /= 10000; unit = 'hectares' }
            }

            const writer = new GeoJSON()
            const geoJsonGeom = JSON.parse(writer.writeGeometry(geom))

            if (onMeasurementEnd) {
                onMeasurementEnd({
                    measurement_type: activeTool,
                    value: value,
                    unit: unit,
                    geometry: geoJsonGeom
                })
            }

            // Optional: Clear after drawing or let user see it until saved?
            // Let's clear it immediately to avoid clutter as the parent will handle saving
            // measureSourceRef.current.clear() 
            // Actually, keep it so user verifies what they drew. Parent can clear on save.
        })

        map.addInteraction(draw)
        drawInteractionRef.current = draw

    }, [activeTool, onMeasurementEnd])

    const getFileUrl = (filePath) => {
        if (!filePath) return null
        const filename = filePath.split(/[\\/]/).pop()
        return `${API_URL}/static/${filename}`
    }

    const addLayerToMap = (layer) => {
        const url = getFileUrl(layer.file_path)
        if (!url) return

        let format = null
        if (layer.format === 'kml') format = new KML({ extractStyles: false })
        if (layer.format === 'geojson') format = new GeoJSON()

        if (format) {
            const vectorSource = new VectorSource({
                url: url,
                format: format,
            })

            const vectorLayer = new VectorLayer({
                source: vectorSource,
                style: new Style({
                    stroke: new Stroke({ color: '#319FD3', width: 3 }),
                    fill: new Fill({ color: 'rgba(49, 159, 211, 0.1)' }),
                    image: new CircleStyle({
                        radius: 5,
                        fill: new Fill({ color: '#319FD3' }),
                    }),
                })
            })

            mapRef.current.addLayer(vectorLayer)
            layersRef.current[layer.id] = vectorLayer

            vectorSource.once('change', () => {
                if (vectorSource.getState() === 'ready') {
                    const extent = vectorSource.getExtent()
                    if (extent && isFinite(extent[0])) {
                        try {
                            mapRef.current.getView().fit(extent, {
                                padding: [50, 50, 50, 50],
                                maxZoom: 16,
                                duration: 1000
                            })
                        } catch (e) { console.warn("Could not fit extent", e) }
                    }
                }
            })
        }
    }

    return (
        <div
            ref={mapElement}
            className="w-full h-full relative"
            style={{ background: '#1f2937' }}
        />
    )
}
