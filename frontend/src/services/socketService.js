import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
  }

  connect(userId) {
    if (!this.socket) {
      // Use environment variable if available, otherwise default to localhost:5001
      const socketUrl = import.meta.env.VITE_SOCKET_URL || (
        import.meta.env.PROD 
          ? `${window.location.protocol}//${window.location.hostname}:5001`
          : 'http://localhost:5001'
      )
      
      this.socket = io(socketUrl, {
        transports: ["websocket", "polling"],
        withCredentials: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      })

      this.socket.on('connect', () => {
        console.log('🔌 Socket connected:', this.socket.id)

        if (userId) {
          this.socket.emit('join-user-room', userId)
        }
      })

      this.socket.on('disconnect', () => {
        console.log('🔌 Socket disconnected')
      })
    }

    return this.socket
  }

  joinAdminRoom() {
    if (this.socket) {
      this.socket.emit('join-admin-room')
    }
  }

  onNotification(callback) {
    if (this.socket) {
      this.socket.on('notification', callback)
    }
  }

  onAdminNotification(callback) {
    if (this.socket) {
      this.socket.on('admin-notification', callback)
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }
}

export default new SocketService()