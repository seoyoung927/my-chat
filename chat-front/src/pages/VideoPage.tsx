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
    const [streams, setStreams] = useState<any[]>([]);
    const { roomId } = useParams();
    //recoil
    const chatRooms = useRecoilValue(chatRoomsState);
    const room = chatRooms.filter(room => room.id === Number(roomId))[0];
    const userName = useRecoilValue(nickNameState);
    //ref
    const myFace = useRef<HTMLVideoElement>(null);
    const peerFace = useRef<HTMLVideoElement>(null);

    let myStream: any;
    let myPeerConnection: any;

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
            myStream = await navigator.mediaDevices.getUserMedia(
                deviceId ? cameraConstrains : initialConstrains
            );
            if (myFace.current) {
                myFace.current.srcObject = myStream;
                setStreams((prev) => [...prev, myStream]);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async function initCall() {
        await getMedia();
        makeConnection();
    }

    async function initCall2() {
        await initCall();
        await stompClient.send(`/welcome/${room.roomName}`, {}, JSON.stringify({"id":userName}));
    }

    useEffect(() => {
        initCall2();
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
    function makeConnection() {
        myPeerConnection = new RTCPeerConnection();
        myPeerConnection.addEventListener("icecandidate", handleIce);
        myPeerConnection.addEventListener("track", handleAddStream);
        console.log(myStream.getTracks());
        myStream
            .getTracks()
            .forEach((track: any) => myPeerConnection.addTrack(track, myStream));

    }

    function handleIce(data: any) {
        console.log("sent candidate: ", data.candidate);
        stompClient.send(`/ice/${room.roomName}`, {}, JSON.stringify({
            id: userName,
            ice: data.candidate
        }));
    }

    function handleAddStream(data: any) {
        console.log("final: ", data.streams[0],myStream);
        if (peerFace.current) {
            setStreams((prev) => [...prev, data.streams[0]]);
            peerFace.current.srcObject = data.streams[0];
        }
    }
    
    return (
        <Container>
            <div className="wrapper">
                <video
                    ref={myFace}
                    className="Face"
                    autoPlay
                    playsInline />
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