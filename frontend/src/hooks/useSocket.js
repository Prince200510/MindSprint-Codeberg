import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { API_CONFIG } from '../config/api.js'

export const useSocket = (user, room) => {
  const ref = useRef()
  useEffect(()=> {
    if(!user) return
    const s = io(API_CONFIG.SERVER_URL)
    ref.current = s
    if(room) s.emit('join', room)
    return ()=> s.disconnect()
  },[user,room])
  return ref
}
