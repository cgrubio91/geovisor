import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import MapViewer from '../components/map/MapViewer'
import Map3DViewer from '../components/map/Map3DViewer'
import api from '../services/api'

export default function ProjectView() {
    const { id } = useParams()
    const [project, setProject] = useState(null)
    const [layers, setLayers] = useState([])
    const [measurements, setMeasurements] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    // Upload Modal State
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
    const [uploadData, setUploadData] = useState({
        name: '', description: '', layer_type: 'vector', format: 'kml', file: null
    })
    const [isUploading, setIsUploading] = useState(false)

    // Measurement State
    const [activeTool, setActiveTool] = useState('none') // 'none', 'distance', 'area'
    const [measurementData, setMeasurementData] = useState(null) // Temp data for modal
    const [measurementName, setMeasurementName] = useState('')

    // View Mode State
    const [viewMode, setViewMode] = useState('2D') // '2D' or '3D'

    useEffect(() => {
        fetchProjectData()
    }, [id])

    const fetchProjectData = async () => {
        try {
            const [projectRes, layersRes, measurementsRes] = await Promise.all([
                api.get(`/api/projects/${id}`),
                api.get(`/api/projects/${id}/layers/`),
                api.get(`/api/projects/${id}/measurements/`)
            ])
            setProject(projectRes.data)
            setLayers(layersRes.data)
            setMeasurements(measurementsRes.data)
        } catch (error) {
            console.error(error)
            toast.error('Error al cargar datos del proyecto')
        } finally {
            setIsLoading(false)
        }
    }

    // --- File Upload Logic ---
    const handleFileChange = (e) => setUploadData({ ...uploadData, file: e.target.files[0] })

    const handleUpload = async (e) => {
        e.preventDefault()
        if (!uploadData.file) return toast.warning('Selecciona un archivo')

        setIsUploading(true)
        const formData = new FormData()
        formData.append('name', uploadData.name)
        formData.append('description', uploadData.description)
        formData.append('layer_type', uploadData.layer_type)
        formData.append('format', uploadData.format)
        formData.append('file', uploadData.file)

        try {
            const response = await api.post(`/api/projects/${id}/layers/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            setLayers([...layers, response.data])
            setIsUploadModalOpen(false)
            setUploadData({ name: '', description: '', layer_type: 'vector', format: 'kml', file: null })
            toast.success('Capa subida exitosamente')
        } catch (error) {
            console.error(error)
            const message = error.response?.data?.detail || 'Error al subir capa'
            const displayMessage = Array.isArray(message) ? `${message[0].loc.pop()}: ${message[0].msg}` : message
            toast.error(displayMessage)
        } finally {
            setIsUploading(false)
        }
    }

    const handleDeleteLayer = async (layerId) => {
        if (!window.confirm('¿Eliminar esta capa?')) return
        try {
            await api.delete(`/api/layers/${layerId}`)
            setLayers(layers.filter(l => l.id !== layerId))
            toast.success('Capa eliminada')
        } catch (error) {
            toast.error('Error al eliminar capa')
        }
    }

    // --- Measurement Logic ---
    const handleMeasurementEnd = (data) => {
        setMeasurementData(data) // Open modal
        setMeasurementName(`Medición ${measurements.length + 1}`)
        setActiveTool('none')
    }

    const saveMeasurement = async () => {
        try {
            const payload = {
                name: measurementName,
                measurement_type: measurementData.measurement_type,
                value: measurementData.value,
                unit: measurementData.unit,
                geometry: measurementData.geometry,
                project_id: parseInt(id)
            }
            const res = await api.post(`/api/projects/${id}/measurements/`, payload)
            setMeasurements([...measurements, res.data])
            setMeasurementData(null)
            toast.success('Medición guardada')
        } catch (error) {
            console.error(error)
            const message = error.response?.data?.detail || 'Error al guardar medición'
            const displayMessage = Array.isArray(message) ? `${message[0].loc.pop()}: ${message[0].msg}` : message
            toast.error(displayMessage)
        }
    }

    const deleteMeasurement = async (mId) => {
        if (!window.confirm('¿Eliminar medición?')) return
        try {
            await api.delete(`/api/measurements/${mId}`)
            setMeasurements(measurements.filter(m => m.id !== mId))
            toast.success('Medición eliminada')
        } catch (error) {
            toast.error('Error al eliminar')
        }
    }

    const formatValue = (val, unit) => {
        if (!val) return '0'
        let displayUnit = unit
        if (unit === 'meters') displayUnit = 'm'
        if (unit === 'kilometers') displayUnit = 'km'
        if (unit === 'square_meters') displayUnit = 'm²'
        if (unit === 'hectares') displayUnit = 'ha'
        return `${val.toFixed(2)} ${displayUnit}`
    }

    if (isLoading) return <div className="flex h-screen items-center justify-center text-white">Cargando...</div>
    if (!project) return <div className="text-white">Proyecto no encontrado</div>

    return (
        <div className="flex h-screen bg-gray-900 overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col z-10">
                <div className="p-4 border-b border-gray-700">
                    <Link to="/projects" className="text-gray-400 hover:text-white mb-2 block text-sm">&larr; Volver</Link>
                    <h1 className="text-xl font-bold text-white truncate">{project.name}</h1>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Layers Section */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Capas</h2>
                            <button onClick={() => setIsUploadModalOpen(true)} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded">+ Añadir</button>
                        </div>
                        <div className="space-y-2">
                            {layers.length === 0 ? <p className="text-xs text-gray-500">Sin capas</p> :
                                layers.map(layer => (
                                    <div key={layer.id} className="bg-gray-700 p-2 rounded flex justify-between items-center group">
                                        <div className="truncate">
                                            <p className="text-sm text-white font-medium truncate" title={layer.name}>{layer.name}</p>
                                            <p className="text-xs text-gray-400">{layer.format}</p>
                                        </div>
                                        <button onClick={() => handleDeleteLayer(layer.id)} className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100">✕</button>
                                    </div>
                                ))
                            }
                        </div>
                    </div>

                    {/* Measurements Section */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mediciones</h2>
                        </div>
                        <div className="space-y-2">
                            {measurements.length === 0 ? <p className="text-xs text-gray-500">Sin mediciones</p> :
                                measurements.map(m => (
                                    <div key={m.id} className="bg-gray-700/50 border border-gray-700 p-2 rounded flex justify-between items-center group">
                                        <div className="truncate">
                                            <p className="text-sm text-gray-200 font-medium truncate">{m.name}</p>
                                            <p className="text-xs text-yellow-500 font-mono">{formatValue(m.value, m.unit)}</p>
                                        </div>
                                        <button onClick={() => deleteMeasurement(m.id)} className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100">✕</button>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Area */}
            <div className="flex-1 bg-gray-900 relative">

                {/* View Mode Toggle */}
                <div className="absolute top-4 left-4 z-10 bg-gray-800 rounded shadow border border-gray-700 p-1 flex">
                    <button
                        onClick={() => setViewMode('2D')}
                        className={`px-3 py-1 rounded text-xs font-bold ${viewMode === '2D' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                    >
                        2D
                    </button>
                    <button
                        onClick={() => setViewMode('3D')}
                        className={`px-3 py-1 rounded text-xs font-bold ${viewMode === '3D' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                    >
                        3D
                    </button>
                </div>

                {viewMode === '2D' ? (
                    <MapViewer
                        layers={layers}
                        activeTool={activeTool}
                        onMeasurementEnd={handleMeasurementEnd}
                    />
                ) : (
                    <Map3DViewer
                        layers={layers}
                        activeTool={activeTool}
                        onMeasurementEnd={handleMeasurementEnd}
                    />
                )}

                {/* Map Controls */}
                <div className="absolute top-4 right-4 flex flex-col space-y-2">
                    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
                        <button
                            onClick={() => setActiveTool(activeTool === 'distance' ? 'none' : 'distance')}
                            className={`p-3 block w-full hover:bg-gray-700 transition-colors ${activeTool === 'distance' ? 'bg-blue-600 hover:bg-blue-600 text-white' : 'text-gray-300'}`}
                            title="Medir Distancia"
                        >
                            <span className="text-xl">📏</span>
                        </button>

                        {viewMode === '2D' && (
                            <>
                                <div className="h-px bg-gray-700"></div>
                                <button
                                    onClick={() => setActiveTool(activeTool === 'area' ? 'none' : 'area')}
                                    className={`p-3 block w-full hover:bg-gray-700 transition-colors ${activeTool === 'area' ? 'bg-blue-600 hover:bg-blue-600 text-white' : 'text-gray-300'}`}
                                    title="Medir Área"
                                >
                                    <span className="text-xl">⬠</span>
                                </button>
                            </>
                        )}
                    </div>
                    {activeTool !== 'none' && (
                        <div className="bg-blue-600 text-white text-xs px-3 py-1 rounded shadow animate-pulse">
                            Modo: {activeTool === 'distance' ? 'Distancia' : 'Área'} {viewMode === '3D' ? '(Click Der. para terminar)' : ''}
                        </div>
                    )}
                </div>
            </div>

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
                    <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Subir Capa</h2>
                        <form onSubmit={handleUpload}>
                            {/* ... Same Form Content ... */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-300 mb-1">Nombre</label>
                                    <input type="text" required value={uploadData.name} onChange={e => setUploadData({ ...uploadData, name: e.target.value })} className="w-full bg-gray-700 border border-gray-600 rounded text-white px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-300 mb-1">Tipo</label>
                                    <select value={uploadData.layer_type} onChange={e => setUploadData({ ...uploadData, layer_type: e.target.value })} className="w-full bg-gray-700 border border-gray-600 rounded text-white px-3 py-2">
                                        <option value="vector">Vector</option>
                                        <option value="raster">Raster</option>
                                        <option value="point_cloud">Nube de Puntos</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-300 mb-1">Formato</label>
                                    <select value={uploadData.format} onChange={e => setUploadData({ ...uploadData, format: e.target.value })} className="w-full bg-gray-700 border border-gray-600 rounded text-white px-3 py-2">
                                        <option value="kml">KML</option>
                                        <option value="geojson">GeoJSON</option>
                                        <option value="geotiff">GeoTIFF</option>
                                        <option value="las">LAS</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-300 mb-1">Archivo</label>
                                    <input type="file" required onChange={handleFileChange} className="w-full bg-gray-700 border border-gray-600 rounded text-white px-3 py-2" />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button type="button" onClick={() => setIsUploadModalOpen(false)} className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded">Cancelar</button>
                                <button type="submit" disabled={isUploading} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium disabled:opacity-50">{isUploading ? 'Subiendo...' : 'Subir'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Measurement Save Modal */}
            {measurementData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
                    <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-sm p-6">
                        <h2 className="text-xl font-bold text-white mb-2">Guardar Medición</h2>
                        <div className="mb-4">
                            <p className="text-gray-400 text-sm">Valor Calculado:</p>
                            <p className="text-2xl text-yellow-500 font-mono font-bold">{formatValue(measurementData.value, measurementData.unit)}</p>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm text-gray-300 mb-1">Nombre</label>
                            <input
                                type="text"
                                autoFocus
                                value={measurementName}
                                onChange={e => setMeasurementName(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded text-white px-3 py-2"
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => setMeasurementData(null)} className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded">Descartar</button>
                            <button onClick={saveMeasurement} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded">Guardar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
