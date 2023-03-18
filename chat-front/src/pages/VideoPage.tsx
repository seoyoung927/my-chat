import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { chatRoomsState } from "../recoil/chatRooms";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import styled from "styled-components";
import { nickNameState } from "../recoil/nickName";

const Container = styled.div`
`;

function VideoPage() {
    //////////////////////////////////////////////////////////////
    const sockJS = new SockJS("http://localhost:8080/webSocket");
    const stompClient: Stomp.Client = Stomp.over(sockJS);
    stompClient.debug = () => { };
    //////////////////////////////////////////////////////////////
    const [mute, setMute] = useState(true);
    const [show, setShow] = useState(true);
    const [streams, setStreams] = useState<any[]>([]);

    const { roomId } = useParams();
    //recoil
    const chatRooms = useRecoilValue(chatRoomsState);
    const room = chatRooms.filter(room => room.id === Number(roomId))[0];
    const userName = useRecoilValue(nickNameState);
    //ref
    const myFace = useRef<HTMLVideoElement>(null);
    const peerFace = useRef<HTMLVideoElement>(null);

    const [myStream, setMyStream] = useState<any>(null);
    const [myPeerConnection,setMyPeerConnection] = useState<any>(new RTCPeerConnection());
    //let myPeerConnection: any;
    //let myStream: any;
    
    async function getMedia(deviceId?: string) {
        const initialConstrains = {
            audio: true,
            video: { facingMode: "user" }
        };
        const cameraConstrains = {
            audio: true,
            video: { deviceId: { exact: deviceId } },
        };
        try {
            let myStream = await navigator.mediaDevices.getUserMedia(
                deviceId ? cameraConstrains : initialConstrains
            );
            if (myFace.current) {
                myFace.current.srcObject = myStream;
                setStreams((prev) => [...prev, myStream]);
            }
            return myStream;
        } catch (e) {
            console.log(e);
        }
    }

    async function initCall() {
        const result = await getMedia();
        makeConnection(result);
        setMyStream(result);
        await stompClient.send(`/welcome/${room.roomName}`, {}, JSON.stringify({"id":userName}));
    }

    useEffect(() => {
        initCall();
        stompClient.connect({}, () => {
            stompClient.subscribe(`/topic/welcome/${room.roomName}`, async (data) => {
                //console.log("data: ", JSON.parse(data.body));
                if(JSON.parse(data.body).id===userName) return;
                console.log("send the offer");
                const offer = await myPeerConnection.createOffer();
                myPeerConnection.setLocalDescription(offer);
                stompClient.send(`/offer/${room.roomName}`, {}, JSON.stringify({
                    id: userName,
                    offer: offer,
                }));
            });
            stompClient.subscribe(`/topic/offer/${room.roomName}`, async (offer) => {
                //console.log("offer: ", JSON.parse(offer.body));
                if(JSON.parse(offer.body).id===userName) return;
                console.log("received the offer and send the answer");
                myPeerConnection.setRemoteDescription(JSON.parse(offer.body).offer);
                const answer = await myPeerConnection.createAnswer();
                myPeerConnection.setLocalDescription(answer);
                stompClient.send(`/answer/${room.roomName}`, {}, JSON.stringify({
                    id: userName,
                    answer: answer,
                }));
            });
            stompClient.subscribe(`/topic/answer/${room.roomName}`, (answer) => {
                //console.log("answer: ", JSON.parse(answer.body));
                if(JSON.parse(answer.body).id===userName) return;
                console.log("received the answer");
                myPeerConnection.setRemoteDescription(JSON.parse(answer.body).answer);
            });
            stompClient.subscribe(`/topic/ice/${room.roomName}`, (ice) => {
                //console.log("ice: ", JSON.parse(ice.body));
                if(JSON.parse(ice.body).id===userName) return;
                console.log("received candidate");
                myPeerConnection.addIceCandidate(JSON.parse(ice.body).ice);
            });
        });
    }, []);

    // RTC Code
    function makeConnection(myStream:any) {
        //let myPeerConnection = new RTCPeerConnection();
        myPeerConnection.addEventListener("icecandidate", handleIce);
        myPeerConnection.addEventListener("track", handleAddStream);
        myPeerConnection.addEventListener("connectionstatechange", handleChange);
        myStream
            .getTracks()
            .forEach((track: any) => myPeerConnection.addTrack(track, myStream));
    }

    function handleIce(data: any) {
        //console.log("sent candidate: ", data.candidate);
        stompClient.send(`/ice/${room.roomName}`, {}, JSON.stringify({
            id: userName,
            ice: data.candidate
        }));
    }

    function handleAddStream(data: any) {
        //console.log("final: ", data.streams[0],myStream);
        if (peerFace.current) {
            setStreams((prev) => [...prev, data.streams[0]]);
            peerFace.current.srcObject = data.streams[0];
        }
    }

    function handleChange(data: any){
        if(myPeerConnection.iceConnectionState==="disconnected"){
            if(peerFace.current){
                peerFace.current.srcObject = null;
            }
        }
    }

    //Mute and Show func
    function handleMute() {
        setMute(cur=>!cur);
        streams.forEach((stream:any)=>{
            stream.getAudioTracks().forEach((track:any)=>{
                track.enabled=!track.enabled
            })
        });
    }

    function handleShow() {
        setShow(cur=>!cur);
        streams.forEach((stream:any)=>{
            stream.getVideoTracks().forEach((track:any)=>{
                track.enabled=!track.enabled
            })
        });
    }
    
    function handleExit(){
        // Get the local media stream and stop it
        const localStream = myPeerConnection.getLocalStreams()[0];
        
        if (localStream) {
            localStream.getTracks().forEach( (track:any) => track.stop() );
        }

        // Get the remote media stream and stop it
        const remoteStream = myPeerConnection.getRemoteStreams()[0];
        if (remoteStream) {
            remoteStream.getTracks().forEach( (track:any) => track.stop() );
        }

        // Close the peer connection
        myPeerConnection.close();

        if (myFace.current) {
            myFace.current.srcObject = null;
        }
        if (peerFace.current) {
            peerFace.current.srcObject = null;
        }
    }

    //render frame func     
    const [data,setData] = useState<any>();
    const [result,setResult] = useState(""); 
    useEffect(() => {
        console.log("setInterval initiation");

        const postImg = async(data:any) => {
            const formData = new FormData();
            formData.append('file', data);

            try {
            const response = await fetch('http://127.0.0.1:5000/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "data": data.replace("data:image/png;base64,", "")
                }),
            });
            if (!response.ok) throw new Error('bad server condition');
            return response.json();
            } catch (e:any) {
                console.error('postImg Error: ', e.message);
                return false;
            }
        };

        const extractFrames = () => {
            if(myFace.current){
                const canvas = document.createElement('canvas');
                canvas.width = 400
                canvas.height = 300;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(myFace.current, 0, 0, canvas.width, canvas.height);
                setData(canvas.toDataURL("image/png"))
                postImg(canvas.toDataURL("image/png")).then((res)=>{
                    //console.log(res['class_name']);
                    setResult(res['class_name']);
                });
            }
        };

        setInterval(extractFrames, 20000);
    },[]);

    return (
        <Container>
            <div className="wrapper">
                <video
                    ref={myFace}
                    className="Face"
                    autoPlay
                    playsInline />
                <img src={data} />
                <p>현재 사용자는 눈을 {result}한 상태입니다.</p>
                <button onClick={handleMute}>{mute ? "음소거" : "음소거 해제"}</button>
                <button onClick={handleShow}>{show ? "화면송출 중지" : "화면송출"}</button>
                <button onClick={handleExit}>통화종료</button>
            </div>
            <div className="wrapper" id="peer">
                <video
                    ref={peerFace}
                    className="Face"
                    autoPlay
                    playsInline />
            </div>
        </Container>
    )
}

export default VideoPage;

