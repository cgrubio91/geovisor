import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

// Pages (to be created)
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import ProjectView from './pages/ProjectView'
// import ProjectView from './pages/ProjectView'

function App() {
    const { isAuthenticated } = useAuthStore()

    return (
        <div className="App">
            <Routes>
                {/* Public routes */}
                <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
                <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
                <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />

                {/* Protected routes */}
                <Route
                    path="/dashboard"
                    element={
                        isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
                    }
                />
                <Route
                    path="/projects"
                    element={
                        isAuthenticated ? <Projects /> : <Navigate to="/login" />
                    }
                />
                <Route
                    path="/projects/:id"
                    element={
                        isAuthenticated ? <ProjectView /> : <Navigate to="/login" />
                    }
                />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </div>
    )
}

export default App
