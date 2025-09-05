import { createContext, useContext, useState, useEffect } from 'react'

const NotificationContext = createContext()

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])
  
  const addNotification = (notification) => {
    setNotifications(prev => {
      const exists = prev.find(n => 
        n.prescription?.id === notification.prescription?.id && 
        n.time === notification.time
      )
      
      if (!exists) {
        return [...prev, {
          ...notification,
          id: Date.now() + Math.random(),
          isRead: false,
          createdAt: new Date()
        }]
      }
      return prev
    })
  }
  
  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId 
          ? { ...n, isRead: true }
          : n
      )
    )
  }
  
  const removeNotification = (notificationId) => {
    setNotifications(prev => 
      prev.filter(n => n.id !== notificationId)
    )
  }
  
  const clearNotifications = () => {
    setNotifications([])
  }
  
  const unreadCount = notifications.filter(n => !n.isRead).length
  const totalCount = notifications.length
  
  return (
    <NotificationContext.Provider value={{
      notifications,
      setNotifications,
      addNotification,
      markAsRead,
      removeNotification,
      clearNotifications,
      unreadCount,
      totalCount
    }}>
      {children}
    </NotificationContext.Provider>
  )
}
