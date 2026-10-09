import { Link } from 'react-router-dom'
import { ShoppingCart, User, LogOut, Menu, X, Camera, Heart, Settings, Award, Package, Activity } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useCartStore from '../../store/cartStore'
import useAuthStore from '../../store/authStore'
import { useState } from 'react'
import MobileMenu from './MobileMenu'
import SmartSearch from '../common/SmartSearch'
import MegaMenu from './MegaMenu'
import DarkModeToggle from '../common/DarkModeToggle'
import VisualSearch from '../search/VisualSearch'

function Navbar() {
  const { getTotalItems } = useCartStore()
  const { user, isAuthenticated, logout } = useAuthStore()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showVisualSearch, setShowVisualSearch] = useState(false)
  
  const totalItems = getTotalItems()

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
  }

  return (
    <>
      {/* PREMIUM NAVBAR */}
      <motion.nav 
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 bg-white dark:bg-gradient-to-b dark:from-dark-bg dark:to-dark-hover shadow-lg border-b border-gray-100 dark:border-gray-800"
      >
        {/* MAIN CONTAINER */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* TOP ROW - Main Navigation */}
          <div className="flex items-center justify-between h-20 gap-4">
            
            {/* LEFT SECTION - Logo & Brand */}
            <motion.div className="flex items-center gap-3 flex-shrink-0 min-w-0">
              {/* Mobile Menu - Hamburger Icon */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all z-50 flex flex-col gap-1.5 w-10 h-10 items-center justify-center"
                aria-label="Menüyü aç"
                title="Menüyü aç"
              >
                <span className="w-5 h-px bg-gray-800 dark:bg-white block"></span>
                <span className="w-5 h-px bg-gray-800 dark:bg-white block"></span>
                <span className="w-5 h-px bg-gray-800 dark:bg-white block"></span>
              </button>

              {/* Logo with Premium Badge */}
              <Link 
                to="/" 
                className="flex items-center gap-2.5 flex-shrink-0 group hover:opacity-90 transition-opacity"
              >
                <div className="relative w-9 h-9">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-black text-sm">M</span>
                  </div>
                </div>
                <span className="font-black text-xl hidden sm:block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  MyShop
                </span>
              </Link>
            </motion.div>

            {/* CENTER - Premium Search */}
            <motion.div className="hidden md:flex flex-1 max-w-3xl mx-4">
              <div className="w-full flex gap-3 items-center">
                {/* Search Bar */}
                <div className="flex-1 relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-300"></div>
                  <div className="relative">
                    <SmartSearch />
                  </div>
                </div>

                {/* Visual Search - Premium Style */}
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowVisualSearch(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex-shrink-0 flex items-center gap-2 font-semibold text-sm"
                  title="Görsel Arama"
                >
                  <Camera size={18} />
                  <span className="hidden lg:block">Görsel</span>
                </motion.button>
              </div>
            </motion.div>

            {/* RIGHT SECTION - Actions */}
            <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
              
              {/* Dark Mode - Premium Toggle */}
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="p-2.5 hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-900 rounded-xl transition-all duration-300">
                <DarkModeToggle />
              </motion.div>

              {/* User Account - Premium Dropdown */}
              {isAuthenticated ? (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2.5 px-3 py-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 rounded-xl transition-all duration-300 group border border-transparent hover:border-purple-200 dark:hover:border-purple-800"
                  >
                    {/* Avatar with Badge */}
                    <div className="relative">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-xl object-cover ring-2 ring-blue-500"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-md">
                          {user?.name?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-dark-bg shadow-md"></div>
                    </div>
                    <span className="font-semibold text-sm hidden lg:block dark:text-dark-text max-w-xs truncate">
                      {user?.name}
                    </span>
                  </motion.button>

                  {/* Premium User Dropdown */}
                  <AnimatePresence>
                    {showUserMenu && (
                      <>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 z-10"
                          onClick={() => setShowUserMenu(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: -20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -20, scale: 0.95 }}
                          className="absolute right-0 mt-3 w-72 bg-white dark:bg-dark-card rounded-2xl shadow-2xl z-20 border border-gray-100 dark:border-gray-700 overflow-hidden backdrop-blur-xl"
                        >
                          {/* Header with Gradient */}
                          <div className="px-6 py-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-900/40 dark:to-purple-900/40 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-4">
                              {user?.avatar ? (
                                <img
                                  src={user.avatar}
                                  alt={user.name}
                                  className="w-14 h-14 rounded-2xl object-cover ring-4 ring-blue-500"
                                />
                              ) : (
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-lg font-bold">
                                  {user?.name?.[0]?.toUpperCase()}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 dark:text-dark-text truncate">{user?.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                              </div>
                            </div>
                          </div>

                          {/* Menu Items - Premium Style */}
                          <div className="py-2 px-2">
                            <Link
                              to="/profile"
                              className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 dark:hover:from-blue-900/40 dark:hover:to-purple-900/40 rounded-lg transition-all duration-200 group dark:text-dark-text text-gray-700 font-medium text-sm"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <User size={18} className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition" />
                              Profilim
                            </Link>
                            <Link
                              to="/orders"
                              className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 dark:hover:from-blue-900/40 dark:hover:to-purple-900/40 rounded-lg transition-all duration-200 group dark:text-dark-text text-gray-700 font-medium text-sm"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <ShoppingCart size={18} className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition" />
                              Siparişlerim
                            </Link>
                            <Link
                              to="/addresses"
                              className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 dark:hover:from-blue-900/40 dark:hover:to-purple-900/40 rounded-lg transition-all duration-200 group dark:text-dark-text text-gray-700 font-medium text-sm"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <Settings size={18} className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition" />
                              Adreslerim
                            </Link>
                            <Link
                              to="/favorites"
                              className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-pink-500/10 dark:hover:from-red-900/40 dark:hover:to-pink-900/40 rounded-lg transition-all duration-200 group dark:text-dark-text text-gray-700 font-medium text-sm"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <Heart size={18} className="group-hover:text-red-600 dark:group-hover:text-red-400 transition" />
                              Favorilerim
                            </Link>
                            <Link
                              to="/loyalty"
                              className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-yellow-500/10 hover:to-orange-500/10 dark:hover:from-yellow-900/40 dark:hover:to-orange-900/40 rounded-lg transition-all duration-200 group dark:text-dark-text text-gray-700 font-medium text-sm"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <Award size={18} className="group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition" />
                              Loyalty Program
                            </Link>
                            <Link
                              to="/bundles"
                              className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 dark:hover:from-purple-900/40 dark:hover:to-pink-900/40 rounded-lg transition-all duration-200 group dark:text-dark-text text-gray-700 font-medium text-sm"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <Package size={18} className="group-hover:text-purple-600 dark:group-hover:text-purple-400 transition" />
                              Bundles
                            </Link>

                            {/* Admin Section */}
                            {user?.role === 'admin' && (
                              <>
                                <div className="my-2 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
                                <Link
                                  to="/admin/analytics/comprehensive"
                                  className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 dark:hover:from-blue-900/40 dark:hover:to-purple-900/40 rounded-lg transition-all duration-200 group text-blue-600 dark:text-blue-400 font-bold text-sm"
                                  onClick={() => setShowUserMenu(false)}
                                >
                                  <Activity size={18} className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition" />
                                  Analytics Dashboard
                                </Link>
                                <Link
                                  to="/admin/bundles"
                                  className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 dark:hover:from-purple-900/40 dark:hover:to-pink-900/40 rounded-lg transition-all duration-200 group text-purple-600 dark:text-purple-400 font-bold text-sm"
                                  onClick={() => setShowUserMenu(false)}
                                >
                                  <Package size={18} className="group-hover:text-purple-600 dark:group-hover:text-purple-400 transition" />
                                  Manage Bundles
                                </Link>
                                <Link
                                  to="/admin/loyalty/stats"
                                  className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-yellow-500/10 hover:to-orange-500/10 dark:hover:from-yellow-900/40 dark:hover:to-orange-900/40 rounded-lg transition-all duration-200 group text-yellow-600 dark:text-yellow-400 font-bold text-sm"
                                  onClick={() => setShowUserMenu(false)}
                                >
                                  <Award size={18} className="group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition" />
                                  Loyalty Stats
                                </Link>
                              </>
                            )}

                            {/* Logout */}
                            <div className="my-2 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
                            <motion.button
                              whileHover={{ x: 3 }}
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-pink-500/10 dark:hover:from-red-900/40 dark:hover:to-pink-900/40 rounded-lg transition-all duration-200 group text-red-600 dark:text-red-400 font-semibold text-sm"
                            >
                              <LogOut size={18} />
                              Çıkış Yap
                            </motion.button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-lg transition-all duration-300 text-sm font-bold shadow-md whitespace-nowrap"
                >
                  <User size={18} />
                  <span className="hidden sm:block">Giriş</span>
                </Link>
              )}

              {/* Shopping Cart - Premium Badge */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative">
                <Link 
                  to="/cart" 
                  className="relative flex items-center justify-center p-2.5 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 text-gray-800 dark:text-gray-100 transition-colors group"
                  aria-label="Sepet"
                >
                  <ShoppingCart size={24} className="group-hover:text-orange-600 transition-colors flex-shrink-0" />
                  
                  {totalItems > 0 && (
                    <span
                      className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-600 text-white text-[11px] font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center shadow-md ring-2 ring-white dark:ring-gray-900"
                    >
                      {totalItems > 99 ? "99+" : totalItems}
                    </span>
                  )}
                </Link>
              </motion.div>
            </div>
          </div>

          {/* MOBILE SEARCH BAR */}
          <motion.div className="md:hidden pb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <button
              onClick={() => setShowVisualSearch(true)}
              className="w-full px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-dark-hover dark:to-dark-bg rounded-xl text-gray-600 dark:text-gray-400 text-sm hover:from-gray-200 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-800 transition-all duration-300 flex items-center gap-2 border border-gray-200 dark:border-gray-700"
            >
              <Camera size={18} />
              Ara veya görsel ara...
            </button>
          </motion.div>
        </div>

        {/* MEGA MENU - Premium Style */}
        <motion.div 
          className="border-t border-gray-100 dark:border-gray-800 bg-gradient-to-b from-gray-50 to-white dark:from-dark-hover dark:to-dark-bg"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <MegaMenu />
          </div>
        </motion.div>
      </motion.nav>

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />

      {/* Visual Search Modal */}
      <VisualSearch isOpen={showVisualSearch} onClose={() => setShowVisualSearch(false)} />
    </>
  )
}

export default Navbar
