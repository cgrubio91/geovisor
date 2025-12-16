import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import Layout from '../components/layout/Layout'
import api from '../services/api'

export default function Projects() {
    const [projects, setProjects] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [newProject, setNewProject] = useState({ name: '', description: '' })
    const [isCreating, setIsCreating] = useState(false)

    useEffect(() => {
        fetchProjects()
    }, [])

    const fetchProjects = async () => {
        try {
            const response = await api.get('/api/projects/')
            setProjects(response.data)
        } catch (error) {
            console.error(error)
            toast.error('Error al cargar proyectos')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateProject = async (e) => {
        e.preventDefault()
        setIsCreating(true)
        try {
            const response = await api.post('/api/projects/', newProject)
            setProjects([...projects, response.data])
            setIsModalOpen(false)
            setNewProject({ name: '', description: '' })
            toast.success('Proyecto creado exitosamente')
        } catch (error) {
            console.error(error)
            toast.error('Error al crear proyecto')
        } finally {
            setIsCreating(false)
        }
    }

    const handleDeleteProject = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este proyecto? Se perderán todas las capas y mediciones.')) return

        try {
            await api.delete(`/api/projects/${id}`)
            setProjects(projects.filter(p => p.id !== id))
            toast.success('Proyecto eliminado')
        } catch (error) {
            console.error(error)
            toast.error('Error al eliminar proyecto')
        }
    }

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Mis Proyectos
                    </h1>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                        Gestiona tus proyectos geoespaciales
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow transition-colors flex items-center"
                >
                    <span className="mr-2">+</span> Nuevo Proyecto
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="spinner"></div>
                </div>
            ) : projects.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <span className="text-4xl">📂</span>
                    <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No tienes proyectos</h3>
                    <p className="mt-2 text-gray-500">Comienza creando tu primer proyecto.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div key={project.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        {project.name}
                                    </h3>
                                    <button
                                        onClick={() => handleDeleteProject(project.id)}
                                        className="text-red-400 hover:text-red-600"
                                        title="Eliminar"
                                    >
                                        🗑️
                                    </button>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                                    {project.description || 'Sin descripción'}
                                </p>
                            </div>
                            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <span className="text-xs text-gray-500">
                                    {new Date(project.created_at).toLocaleDateString()}
                                </span>
                                <Link
                                    to={`/projects/${project.id}`}
                                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
                                >
                                    Abrir Mapa &rarr;
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Crear Proyecto */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Nuevo Proyecto
                        </h2>
                        <form onSubmit={handleCreateProject}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Nombre del Proyecto
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newProject.name}
                                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Mi Proyecto Geoespacial"
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Descripción (Opcional)
                                </label>
                                <textarea
                                    value={newProject.description}
                                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    rows="3"
                                    placeholder="Descripción corta..."
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold disabled:opacity-50"
                                >
                                    {isCreating ? 'Creando...' : 'Crear Proyecto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    )
}
