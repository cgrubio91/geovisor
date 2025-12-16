import Sidebar from './Sidebar'

export default function Layout({ children }) {
    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-8">
                {children}
            </main>
        </div>
    )
}
