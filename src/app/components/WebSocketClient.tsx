"use client"
import React from "react";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const WebSocketClient = () => {
  const [socket, setSocket] = useState<any>(undefined)
  const [roomName, setRoomName] = useState("")
  const [msg, setOutGoingMsg] = useState("");
  const [receivedMsg, setReceivedMsg] = useState<string[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string>("");
  const handleSendMessage = () => {
    if(socket){
      socket.emit("message", msg, roomName)
    }
  }
  const handleJoinRoom = () => {
    socket.emit("joinedRoom", roomName)
  }
  useEffect(() => {
    const socket = io("http://localhost:3000")
    setSocket(socket)
  },[])
  useEffect(() => {
    if(socket){
      socket.on("message", (message: string, roomNameReceived: string) => {
        let newMsg = [...receivedMsg]
        newMsg.push(message)
        setReceivedMsg(newMsg)
        setCurrentRoom(roomNameReceived)
      })
    }
  },[receivedMsg, socket])
  return(
    <>
    <div className="flex flex-row gap-10">
      <div className="flex flex-col gap-5">
        <button onClick={handleSendMessage}> Send Msg</button>
        <button onClick={handleJoinRoom}>join room</button>
        <input placeholder="message" className="text-black" onChange={(e) => setOutGoingMsg(e.target.value)}/>
        <input placeholder="room-name" className="text-black" onChange={(e) => setRoomName(e.target.value)} />
      </div>
      <div className="flex flex-col">
        <h1>Incoming Messages</h1>
        {!!receivedMsg?.length && receivedMsg?.map((msg, index) => {
          return(
            <p className="" key={index}>
              {msg}
            </p>
          )
        })}
      </div>
      <div>
        {currentRoom && <p>Current Room : {currentRoom}</p>}
      </div>
    </div>
    </>
  )
  
}
export default WebSocketClient;