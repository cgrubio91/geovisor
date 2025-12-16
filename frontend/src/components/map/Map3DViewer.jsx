import { useEffect, useRef, useState } from 'react'
import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'

export default function Map3DViewer({ layers = [], activeTool = 'none', onMeasurementEnd }) {
    const cesiumContainer = useRef(null)
    const viewerRef = useRef(null)
    const handlerRef = useRef(null)
    const activeShapePointsRef = useRef([])
    const activeShapeRef = useRef(null)
    const floatingPointRef = useRef(null)

    // Base URL
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

    // State for loading indicator
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!cesiumContainer.current) return

        try {
            // Initialize Cesium Viewer
            const viewer = new Cesium.Viewer(cesiumContainer.current, {
                terrainProvider: Cesium.createWorldTerrain(), // Use standard terrain
                timeline: false,
                animation: false,
                baseLayerPicker: false,
                geocoder: false,
                homeButton: false,
                sceneModePicker: false,
                navigationHelpButton: false,
                fullscreenButton: false,
                selectionIndicator: false,
                infoBox: false,
            })

            // Hide credit (optional, respect license)
            // const creditDisplay = viewer.scene.frameState.creditDisplay
            // creditDisplay.container.style.display = 'none';

            viewer.camera.setView({
                destination: Cesium.Cartesian3.fromDegrees(-74.07, 4.71, 20000),
                orientation: {
                    heading: Cesium.Math.toRadians(0.0),
                    pitch: Cesium.Math.toRadians(-45.0),
                }
            })

            viewerRef.current = viewer
            setIsLoading(false) // Ready
        } catch (e) {
            console.error("Cesium Initialization Error:", e)
            setIsLoading(false)
        }


        return () => {
            if (viewerRef.current && !viewerRef.current.isDestroyed()) {
                viewerRef.current.destroy()
                viewerRef.current = null
            }
        }
    }, [])

    const getFileUrl = (filePath) => {
        if (!filePath) return null
        const filename = filePath.split(/[\\/]/).pop()
        return `${API_URL}/static/${filename}`
    }

    // Handle Layers
    useEffect(() => {
        const viewer = viewerRef.current
        if (!viewer || viewer.isDestroyed()) return

        viewer.dataSources.removeAll()

        layers.forEach(async (layer) => {
            const url = getFileUrl(layer.file_path)
            if (!url) return

            try {
                let dsPromise = null
                if (layer.format === 'kml' || layer.format === 'kmz') {
                    dsPromise = Cesium.KmlDataSource.load(url, {
                        camera: viewer.scene.camera,
                        canvas: viewer.scene.canvas,
                        clampToGround: true
                    })
                }
                else if (layer.format === 'geojson') {
                    dsPromise = Cesium.GeoJsonDataSource.load(url, {
                        stroke: Cesium.Color.HOTPINK,
                        fill: Cesium.Color.PINK.withAlpha(0.5),
                        strokeWidth: 3
                    })
                }

                if (dsPromise) {
                    const ds = await dsPromise
                    viewer.dataSources.add(ds)
                    viewer.zoomTo(ds)
                }
            } catch (error) {
                console.error("Error loading layer in 3D:", error)
            }
        })
    }, [layers])

    // Handle Measurement Tool
    useEffect(() => {
        const viewer = viewerRef.current
        if (!viewer || viewer.isDestroyed()) return

        // Cleanup previous handler
        if (handlerRef.current) {
            handlerRef.current.destroy()
            handlerRef.current = null
        }

        // Reset shapes
        activeShapeRef.current = null
        activeShapePointsRef.current = []
        if (floatingPointRef.current) {
            viewer.entities.remove(floatingPointRef.current)
            floatingPointRef.current = null
        }

        if (activeTool === 'none') {
            // Clean up temp entities? Keeping for now until next tool usage
            return
        }

        if (activeTool === 'distance') {
            const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
            handlerRef.current = handler

            const createPoint = (worldPosition) => {
                const point = viewer.entities.add({
                    position: worldPosition,
                    point: {
                        color: Cesium.Color.YELLOW,
                        pixelSize: 10,
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
                    }
                })
                return point
            }

            const drawShape = (positionData) => {
                let shape
                shape = viewer.entities.add({
                    polyline: {
                        positions: positionData,
                        clampToGround: true,
                        width: 3,
                        material: Cesium.Color.YELLOW
                    }
                })
                return shape
            }

            handler.setInputAction((event) => {
                // Left Click
                // Try pickPosition (Terrain/Models) first
                let earthPosition = viewer.scene.pickPosition(event.position)
                // Fallback to pickEllipsoid (Globe Surface) if undefined (e.g. clicking on sky or error)
                if (!Cesium.defined(earthPosition)) {
                    earthPosition = viewer.camera.pickEllipsoid(event.position, viewer.scene.globe.ellipsoid)
                }

                if (Cesium.defined(earthPosition)) {
                    if (activeShapePointsRef.current.length === 0) {
                        floatingPointRef.current = createPoint(earthPosition)
                        activeShapePointsRef.current.push(earthPosition)
                        const dynamicPositions = new Cesium.CallbackProperty(() => activeShapePointsRef.current, false)
                        activeShapeRef.current = drawShape(dynamicPositions)
                    }
                    activeShapePointsRef.current.push(earthPosition)
                    createPoint(earthPosition)
                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

            handler.setInputAction((event) => {
                // Mouse Move
                if (Cesium.defined(floatingPointRef.current)) {
                    let newPosition = viewer.scene.pickPosition(event.endPosition)
                    if (!Cesium.defined(newPosition)) {
                        newPosition = viewer.camera.pickEllipsoid(event.endPosition, viewer.scene.globe.ellipsoid)
                    }

                    if (Cesium.defined(newPosition)) {
                        floatingPointRef.current.position.setValue(newPosition)
                        activeShapePointsRef.current.pop()
                        activeShapePointsRef.current.push(newPosition)
                    }
                }
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

            handler.setInputAction((event) => {
                // Right Click or Double Click to Finish
                activeShapePointsRef.current.pop() // Remove moving point

                // Calculate Distance
                let totalDistance = 0
                for (let i = 0; i < activeShapePointsRef.current.length - 1; i++) {
                    totalDistance += Cesium.Cartesian3.distance(activeShapePointsRef.current[i], activeShapePointsRef.current[i + 1])
                }

                // Convert Geometry to GeoJSON for saving (Approximate)
                // Need to convert Cartesian3 to Long/Lat
                const coordinates = activeShapePointsRef.current.map(cart => {
                    const cartographic = Cesium.Cartographic.fromCartesian(cart)
                    const lon = Cesium.Math.toDegrees(cartographic.longitude)
                    const lat = Cesium.Math.toDegrees(cartographic.latitude)
                    return [lon, lat]
                })

                if (onMeasurementEnd) {
                    onMeasurementEnd({
                        measurement_type: 'distance',
                        value: totalDistance,
                        unit: totalDistance > 1000 ? 'kilometers' : 'meters',
                        geometry: {
                            type: 'LineString',
                            coordinates: coordinates
                        }
                    })
                }

                // Reset
                handler.destroy()
                handlerRef.current = null
                activeShapeRef.current = null
                activeShapePointsRef.current = []

            }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
        }

    }, [activeTool, onMeasurementEnd])


    return (
        <div className="w-full h-full relative">
            {isLoading && (
                <div className="absolute inset-0 bg-gray-900 z-50 flex flex-col items-center justify-center text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                    <p>Cargando Entorno 3D...</p>
                </div>
            )}
            <div
                ref={cesiumContainer}
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    )
}
```
