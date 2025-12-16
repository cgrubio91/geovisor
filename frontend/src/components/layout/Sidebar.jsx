import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function Sidebar() {
    const location = useLocation()
    const { logout, user } = useAuthStore()

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: '📊' },
        { name: 'Proyectos', href: '/projects', icon: '📁' },
        { name: 'Mapa', href: '/map', icon: '🗺️' },
        { name: 'Análisis', href: '/analysis', icon: '🔬' },
    ]

    const isActive = (path) => location.pathname === path

    return (
        <div className="flex flex-col h-screen w-64 bg-gray-900 border-r border-gray-800">
            {/* Logo */}
            <div className="flex items-center justify-center h-16 border-b border-gray-800">
                <span className="text-xl font-bold text-white">🌍 GeoVisor</span>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-gray-800">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                        {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                            {user?.full_name || user?.username || 'Usuario'}
                        </p>
                        <p className="text-xs text-gray-400 truncate capitalise">
                            {user?.role || 'User'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 space-y-1">
                {navigation.map((item) => (
                    <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive(item.href)
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            }`}
                    >
                        <span className="mr-3">{item.icon}</span>
                        {item.name}
                    </Link>
                ))}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-800">
                <button
                    onClick={logout}
                    className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-400 rounded-md hover:bg-gray-800 hover:text-red-300 transition-colors"
                >
                    <span className="mr-3">🚪</span>
                    Cerrar Sesión
                </button>
            </div>
        </div>
    )
}
