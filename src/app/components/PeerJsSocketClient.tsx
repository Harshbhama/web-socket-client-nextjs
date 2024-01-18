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
  useEffect(() => {
    const socket = io("http://localhost:3000") // Step1: Here the socket in initialized
    setSocket(socket)  // Set state of socket used in below functions
  },[])
  


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
        console.log(userID)
        if(peers[userID])
        peers[userID].close()
      })
      peer.on('open', id => { //Every Peer object is assigned a random, unique ID when it's created.
        socket.emit("join-room", 'ROOM_ID', id); // This line of code is sending message to join room to server code.
      })
    }
  },[socket, peer])

  return(
    <div>In Peer JS Client
      <div id="video-grid" className="flex flex-row gap-24 set-video-properties">
      </div>
    </div>

  )
}
export default PeerJsSocket;