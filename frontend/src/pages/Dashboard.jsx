import Layout from '../components/layout/Layout'

export default function Dashboard() {
    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Panel de Control
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Bienvenido al GeoVisor. Aquí tienes un resumen de tus proyectos.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Card: Proyectos Activos */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Proyectos Activos
                        </h3>
                        <span className="text-2xl">📁</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">0</p>
                    <p className="text-sm text-gray-500 mt-2">Total de proyectos</p>
                </div>

                {/* Card: Almacenamiento */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Almacenamiento
                        </h3>
                        <span className="text-2xl">💾</span>
                    </div>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">0 MB</p>
                    <p className="text-sm text-gray-500 mt-2">Espacio utilizado</p>
                </div>

                {/* Card: Capas */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Capas Procesadas
                        </h3>
                        <span className="text-2xl">🗺️</span>
                    </div>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">0</p>
                    <p className="text-sm text-gray-500 mt-2">KML, GeoTIFF, LAS</p>
                </div>
            </div>

            {/* Recent Activity Placeholder */}
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Actividad Reciente
                    </h3>
                </div>
                <div className="p-6 text-center text-gray-500">
                    No hay actividad reciente para mostrar.
                </div>
            </div>
        </Layout>
    )
}
