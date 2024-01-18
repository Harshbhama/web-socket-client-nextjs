import Image from 'next/image'
import WebSocketClient from './components/WebSocketClient'
import PeerJsSocket from './components/PeerJsSocketClient'
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
     {/* <WebSocketClient /> */}
     <PeerJsSocket />
    </main>
  )
}
