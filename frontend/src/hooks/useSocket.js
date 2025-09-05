import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
export const useSocket = (user, room) => {
  const ref = useRef()
  useEffect(()=> {
    if(!user) return
    const s = io(import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:5000')
    ref.current = s
    if(room) s.emit('join', room)
    return ()=> s.disconnect()
  },[user,room])
  return ref
}
