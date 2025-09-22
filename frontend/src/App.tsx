import { useState, useEffect } from "react";
import { FaSignOutAlt, FaUser, FaRobot, FaFileUpload, FaComments, FaMoon, FaSun } from "react-icons/fa";
import AuthForm from "./components/AuthForm";
import Upload from "./components/Upload";
import Chat from "./components/Chat";
import './index.css';

type Tab = 'upload' | 'chat';

export default function App() {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem("token");
    } catch {
      return null;
    }
  });
  
  const [activeTab, setActiveTab] = useState<Tab>('upload');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem("darkMode") === "true";
    } catch {
      return false;
    }
  });
  
  const [userEmail, setUserEmail] = useState<string>("");
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem("darkMode", darkMode.toString());
    } catch {
      // Ignore storage errors
    }
  }, [darkMode]);

  const handleSetToken = (t: string, email?: string) => {
    setToken(t);
    if (email) setUserEmail(email);
    try {
      localStorage.setItem("token", t);
      if (email) localStorage.setItem("userEmail", email);
    } catch {
      // Ignore storage errors
    }
  };

  const logout = () => {
    console.log("Logout function called");
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("userEmail");
      console.log("LocalStorage cleared");
    } catch (error) {
      console.log("Error clearing localStorage:", error);
    }
    setToken(null);
    setUserEmail("");
    setActiveTab('upload');
    setShowUserMenu(false);
    console.log("State updated, reloading page");
    window.location.reload();
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-green-50'
    }`}>
      <div className="min-h-screen backdrop-blur-sm">
        {/* Navigation Header */}
        {token && (
          <nav className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300 ${
            darkMode 
              ? 'bg-gray-900/80 border-gray-700' 
              : 'bg-white/80 border-gray-200'
          }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* Logo and Title */}
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-xl ${
                    darkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                  }`}>
                    <FaRobot className={`text-2xl ${
                      darkMode ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                  </div>
                  <div>
                    <h1 className={`text-xl font-bold ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      RAG Application
                    </h1>
                    <p className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Document AI Intelligence
                    </p>
                  </div>
                </div>

                {/* Tabs Navigation */}
                <div className={`flex space-x-1 p-1 rounded-lg ${
                  darkMode ? 'bg-gray-800' : 'bg-gray-100'
                }`}>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeTab === 'upload'
                        ? darkMode 
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : 'bg-blue-600 text-white shadow-lg'
                        : darkMode
                          ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                    }`}
                  >
                    <FaFileUpload className="text-sm" />
                    <span className="hidden sm:inline">Upload</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeTab === 'chat'
                        ? darkMode 
                          ? 'bg-green-600 text-white shadow-lg' 
                          : 'bg-green-600 text-white shadow-lg'
                        : darkMode
                          ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                    }`}
                  >
                    <FaComments className="text-sm" />
                    <span className="hidden sm:inline">Chat</span>
                  </button>
                </div>

                {/* User Menu */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={toggleDarkMode}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      darkMode 
                        ? 'text-yellow-400 hover:bg-gray-800' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    title={darkMode ? 'Light mode' : 'Dark mode'}
                  >
                    {darkMode ? <FaSun /> : <FaMoon />}
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className={`flex items-center space-x-2 p-2 rounded-lg transition-colors duration-200 ${
                        darkMode 
                          ? 'text-gray-300 hover:bg-gray-800' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        darkMode ? 'bg-gray-700' : 'bg-gray-200'
                      }`}>
                        <FaUser className="text-sm" />
                      </div>
                      <span className="hidden sm:inline text-sm">
                        {userEmail || 'User'}
                      </span>
                    </button>
                  </div>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("Direct logout button clicked!");
                      logout();
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                      darkMode 
                        ? 'text-red-400 hover:bg-red-900/20 hover:text-red-300 border border-red-800/50 hover:border-red-700' 
                        : 'text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-200 hover:border-red-300'
                    }`}
                    title="Logout"
                    type="button"
                  >
                    <FaSignOutAlt className="text-xs" />
                    <span className="hidden md:inline">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </nav>
        )}

        {/* Main Content */}
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!token ? (
            /* Landing Page for Auth */
            <div className="min-h-screen flex items-center justify-center">
              <div className="max-w-md w-full">
                <div className="text-center mb-8">
                  <div className={`inline-flex p-4 rounded-full mb-4 ${
                    darkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                  }`}>
                    <FaRobot className={`text-4xl ${
                      darkMode ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                  </div>
                  <h1 className={`text-4xl font-bold mb-2 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    RAG Application
                  </h1>
                  <p className={`text-lg ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Analyze your documents with AI
                  </p>
                </div>
                <AuthForm onAuth={handleSetToken} darkMode={darkMode} />
              </div>
            </div>
          ) : (
            /* oard Content */
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className={`text-2xl font-bold ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {activeTab === 'upload' ? 'Document Analysis' : 'AI Assistant'}
                    </h2>
                    <p className={`text-sm mt-1 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {activeTab === 'upload' 
                        ? 'Upload your PDF documents for analysis'
                        : 'Ask questions about your uploaded documents'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="transition-all duration-500 ease-in-out">
                {activeTab === 'upload' ? (
                  <Upload token={token} darkMode={darkMode} />
                ) : (
                  <Chat token={token} darkMode={darkMode} />
                )}
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        {token && (
          <footer className={`border-t mt-16 py-8 ${
            darkMode 
              ? 'border-gray-700 bg-gray-900/50' 
              : 'border-gray-200 bg-white/50'
          } backdrop-blur-sm`}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <p className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  © 2025 RAG Dashboard.
                </p>
              </div>
            </div>
          </footer>
        )}
      </div>

      {/* Click outside handler for user menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}
    </div>
  );
}