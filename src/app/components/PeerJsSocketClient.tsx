"use client"
import React, { useRef } from "react";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Peer } from "peerjs";

const PeerJsSocket = () => {
  const peer = new Peer(undefined, {
    host: "/",
    port: '3001',
  });  
  const [socket, setSocket] = useState<any>(undefined)
  const videoGrid = document.getElementById('video-grid');
  const [roomNameForVideo, setRoomName] = useState<string>("ROOM-ID-1");
  const [roomCheck, setRoomCheck] = useState<Boolean>(false);
  const videoRef = useRef<undefined|null|any>(null);
  useEffect(() => {
    if(roomCheck){
      const socket = io("http://localhost:3000") // Step1: Here the socket in initialized
      setSocket(socket)  // Set state of socket used in below functions
    }
  },[roomCheck])

  useEffect(() => {
    if(!roomCheck &&  socket){
      socket.disconnect()
      setSocket(undefined)
      videoRef.current.removeChild(videoRef.current.children[0])
    }
  },[socket, roomCheck])

  const addVideoStream = (video: any, stream: any, mutiple?: string|undefined) => {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
      video.play()
    })
    videoGrid.append(video)
  }

  const connectToNewUser = (userID: any, stream: any, peers: any) => {
    const call = peer.call(userID, stream) // It is connecting to the user based on userId
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream) // Adding video steam for the second, third etc users.
    })
    call.on('close', () => {
      video.remove()
    })
    peers[userID] = call
  }

  useEffect(() => {
    if(socket){
      let myVideo = document.createElement('video') // Creating video element for current user.
      myVideo.muted = true
      const peers: any = {}
      navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      }).then(stream => {
        addVideoStream(myVideo, stream) // This function is basically adding video to the div container
        peer.on('call', call => {
          call.answer(stream)
          const video = document.createElement('video')
          call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
          })
        })
        socket.on('user-connected', userId => { // This user connected is received from server for which we have send a join room msg from peer.on('open')
          connectToNewUser(userId, stream, peers)
        })
          
      })
      socket.on('user-disconnected', userID => {
        if(peers[userID])
        peers[userID].close()
      })
      peer.on('open', id => { //Every Peer object is assigned a random, unique ID when it's created.
        socket.emit("join-room", roomNameForVideo, id); // This line of code is sending message to join room to server code.
      })
    }
  },[socket])

  return(
    <div className="flex flex-col gap-10 justify-center text-center">In Peer JS Client
      {roomNameForVideo && <div className="flex flex-row gap-5 m-auto"><span className="text-red-500 text-[24px]">Current Room Name: </span><p className=" text-white text-[24px]"> {roomNameForVideo}</p></div>}
      <div className="flex flex-row gap-5 align-middle m-auto"><input value={roomNameForVideo} placeholder="Room name" className="text-black" onChange={(e) => {setRoomName(e.target.value)
       setRoomCheck(false)}}/> <button onClick={() => {
        setRoomCheck(true)
        if(!roomNameForVideo){
          setRoomName('ROOM-ID-1')
        }
        }}>Join room</button></div>
      <div ref={videoRef} id="video-grid" className="flex flex-row gap-24 set-video-properties">
      </div>
    </div>

  )
}
export default PeerJsSocket;