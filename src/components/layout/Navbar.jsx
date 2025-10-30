import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { logOut } from '../../services/authService'

function Navbar() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logOut()
    navigate('/login')
    setIsMenuOpen(false)
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-indigo-600">
                NyumbaConnect
              </Link>
            </div>
            {currentUser && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-indigo-500"
                >
                  Dashboard
                </Link>
                <Link
                  to="/properties"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300 border-b-2 border-transparent"
                >
                  Properties
                </Link>
                <Link
                  to="/tenants"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300 border-b-2 border-transparent"
                >
                  Tenants
                </Link>
                <Link
                  to="/payments"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300 border-b-2 border-transparent"
                >
                  Payments
                </Link>
              </div>
            )}
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {currentUser ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">
                  {currentUser.displayName || currentUser.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          {currentUser && (
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {!isMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {currentUser && (
        <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium border-indigo-500 text-indigo-700 bg-indigo-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/properties"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Properties
            </Link>
            <Link
              to="/tenants"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Tenants
            </Link>
            <Link
              to="/payments"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Payments
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="shrink-0">
                <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">
                  {currentUser.displayName || 'User'}
                </div>
                <div className="text-sm font-medium text-gray-500">
                  {currentUser.email}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="ml-auto bg-gray-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
