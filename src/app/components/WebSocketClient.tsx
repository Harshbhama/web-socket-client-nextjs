"use client"
import React from "react";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const WebSocketClient = () => {
  const [socket, setSocket] = useState<any>(undefined)
  const [roomName, setRoomName] = useState("")
  const [msg, setOutGoingMsg] = useState("");
  const [receivedMsg, setReceivedMsg] = useState<any>([]);
  const [currentRoom, setCurrentRoom] = useState<string>("");
  const [userId, setUserId] = useState<number>(0);
  const handleSendMessage = () => {
    if(socket){
      socket.emit("message", msg, roomName, userId)
    }
  }
  const handleJoinRoom = () => {
    socket.emit("joinedRoom", roomName)
  }
  useEffect(() => {
    let userId = Math.floor(Math.random() * 100)
    console.log("userId", userId)
    const socket = io("http://localhost:3000")
    setSocket(socket)
    setUserId(userId);
  },[])
  useEffect(() => {
    if(socket){
      socket.on("message", (message: string, roomNameReceived: string, userId: number) => {
        let newMsg = [...receivedMsg]
        newMsg.push({message: message,   userId: userId})
        console.log("newMsg",newMsg)
        setReceivedMsg(newMsg)
        setCurrentRoom(roomNameReceived)
      })
    }
    console.log("receivedMsg",receivedMsg)
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
        {!!receivedMsg?.length && receivedMsg?.map((msg: any, index:number) => {
          return(
            <p className={msg?.userId === userId ? " text-red-700" : " text-blue-700"} key={index}>
              {msg?.message}
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