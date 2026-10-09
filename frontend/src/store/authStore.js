import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI } from '../api/authAPI'

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: localStorage.getItem('token') || null,
      isAuthenticated: !!localStorage.getItem('token'),
      loading: false,
      error: null,

      // Kayıt Ol
      register: async (arg1, arg2, arg3) => {
        let userData = typeof arg1 === "object" && arg1 !== null
          ? arg1
          : { name: arg1, email: arg2, password: arg3 };
        set({ loading: true, error: null })
        try {
          const data = await authAPI.register(userData)

          // Data yapısını kontrol et
          if (!data) {
            throw new Error('Sunucudan boş yanıt alındı')
          }

          set({
            user: data.user || null,
            token: data.token || null,
            isAuthenticated: !!data.token,
            loading: false
          })

          return { success: true, user: data.user || null }
        } catch (error) {
          console.error('Register Error Details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            fullError: error
          })

          const message =
            error.response?.data?.message ||
            error.message ||
            'Kayıt başarısız. Lütfen tekrar deneyin.'

          set({ loading: false, error: message })
          return { success: false, error: message }
        }
      },

      // Giriş Yap
      login: async (email, password) => {
        set({ loading: true, error: null })
        try {
          const data = await authAPI.login(email, password)
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            loading: false
          })
          return { success: true, user: data.user }
        } catch (error) {
          const message = error.response?.data?.message || 'Giriş başarısız'
          set({ loading: false, error: message })
          return { success: false, error: message }
        }
      },

      // Google ile Giriş
      loginWithGoogle: async (googleToken) => {
        set({ loading: true, error: null })
        try {
          if (!googleToken) {
            throw new Error('Google token alınamadı')
          }

          // Backend'e token gönder
          const response = await API.post('/auth/google-login', { token: googleToken })
          const data = response.data

          if (!data?.token) {
            throw new Error('Sunucudan token alınamadı')
          }

          localStorage.setItem('token', data.token)
          set({
            user: data.user || null,
            token: data.token,
            isAuthenticated: true,
            loading: false
          })

          return { success: true, user: data.user || null }
        } catch (error) {
          console.error('Google Login Error:', error)
          const message = error.response?.data?.message || error.message || 'Google giriş başarısız'
          set({ loading: false, error: message })
          return { success: false, error: message }
        }
      },

      // Generic Social Login (Demo or Custom Provider)
      socialLogin: async (providerData) => {
        set({ loading: true, error: null })
        try {
          const response = await authAPI.socialLogin(providerData)
          const data = response.data

          if (!data?.token) {
            throw new Error('Sunucudan token alınamadı')
          }

          localStorage.setItem('token', data.token)
          set({
            user: data.user || null,
            token: data.token,
            isAuthenticated: true,
            loading: false
          })

          return { success: true, user: data.user || null }
        } catch (error) {
          console.error('Social Login Error:', error)
          const message = error.response?.data?.message || error.message || 'Giriş başarısız'
          set({ loading: false, error: message })
          return { success: false, error: message }
        }
      },

      // Çıkış Yap
      logout: async () => {
        try {
          await authAPI.logout()
        } catch (error) {
          console.error('Logout error:', error)
        }
        set({
          user: null,
          token: null,
          isAuthenticated: false
        })
      },

      // Mevcut kullanıcıyı getir
      fetchUser: async () => {
        const token = get().token
        if (!token) return

        set({ loading: true })
        try {
          const data = await authAPI.getMe()
          set({
            user: data.user,
            isAuthenticated: true,
            loading: false
          })
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false
          })
        }
      },

      // Profil Güncelle
      updateProfile: async (userData) => {
        set({ loading: true, error: null })
        try {
          const data = await authAPI.updateProfile(userData)
          set({
            user: data.user,
            loading: false
          })
          return { success: true, user: data.user }
        } catch (error) {
          const message = error.response?.data?.message || 'Güncelleme başarısız'
          set({ loading: false, error: message })
          return { success: false, error: message }
        }
      },

      // Şifre Değiştir
      changePassword: async (currentPassword, newPassword) => {
        set({ loading: true, error: null })
        try {
          await authAPI.changePassword(currentPassword, newPassword)
          set({ loading: false })
          return { success: true }
        } catch (error) {
          const message = error.response?.data?.message || 'Şifre değiştirme başarısız'
          set({ loading: false, error: message })
          return { success: false, error: message }
        }
      },

      // Şifremi Unuttum
      forgotPassword: async (email) => {
        set({ loading: true, error: null })
        try {
          const data = await authAPI.forgotPassword(email)
          set({ loading: false })
          return { success: true, message: data.message }
        } catch (error) {
          const message = error.response?.data?.message || 'İşlem başarısız'
          set({ loading: false, error: message })
          return { success: false, error: message }
        }
      }
    }),
    {
      name: 'auth-storage'
    }
  )
)

export default useAuthStore