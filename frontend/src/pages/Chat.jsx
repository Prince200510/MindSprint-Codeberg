import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useSocket } from '../hooks/useSocket.js'
import { Input } from '../components/Input.jsx'

export const ChatPage = () => {
  const {user} = useAuth()
  const room = 'global'
  const sref = useSocket(user, room)
  const [messages,setMessages] = useState([])
  const [text,setText] = useState('')
  useEffect(()=> {
    if(!sref.current) return
    const s = sref.current
    const onMsg = m => setMessages(v=> [...v,m])
    s.on('message', onMsg)
    return ()=> { s.off('message', onMsg) }
  },[sref])
  const send = () => { if(text.trim() && sref.current){ sref.current.emit('message',{room, from:user.id, body:text}); setText('') } }
  return <div className="max-w-3xl mx-auto py-10 space-y-4">
    <div className="h-96 overflow-y-auto p-4 rounded-xl border border-white/10 glass flex flex-col gap-2">
      {messages.map(m=> <div key={m._id+Math.random()} className={`px-3 py-2 rounded-lg max-w-xs ${m.from===user.id? 'self-end bg-primary text-white':'bg-neutral-200 dark:bg-neutral-800'}`}>{m.body}</div>)}
    </div>
    <div className="flex gap-2">
      <Input value={text} onChange={e=> setText(e.target.value)} onKeyDown={e=> e.key==='Enter' && send()} placeholder="Type message" />
      <button onClick={send} className="px-4 py-2 rounded-md bg-primary text-white">Send</button>
    </div>
  </div>
}
