import { useParams } from "react-router-dom";
import { chatRoomsState } from "../recoil/chatRooms";
import { useRecoilValue } from "recoil";
import { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import styled from "styled-components";
import { nickNameState } from "../recoil/nickName";

const Container = styled.div`
    width: 100vw;
    height: 100vh;

    padding: 20px;

    .title{
        font-size: 32px;
        font-weight: 500;
    }
    .title-2{
        font-size: 24px;
        font-weight: 500;
    }
    .inputWrapper{
        display: flex;
        justify-content: center;
        align-items: flex-start;

        width: 300px;

        margin: 20px 0px;
    }
    .inputBox{
        width: calc(100% - 50px);
        height: 24px;
    }
    .inputBtn{
        width: 50px;
        height: 24px;
    }
    .chatRoom{
        background-color: rgb(135, 206, 250);
        border-radius: 20px;
        margin: 10px;
        padding: 10px 20px;
        width: 400px;

        display: flex;
        justify-content: space-around;
    }
`;

interface IMessage{
    username: string;
    content: string;
}

function ChatPage(){
    //////////////////////////////////////////////////////////////
    const sockJS = new SockJS("http://localhost:8080/webSocket");
    const stompClient : Stomp.Client = Stomp.over(sockJS);
    stompClient.debug = () => {};
    //////////////////////////////////////////////////////////////
    const [contents, setContents] = useState<IMessage[]>([]);
    const userName = useRecoilValue(nickNameState);
    const [message, setMessage] = useState("");
    
    const {roomId} = useParams();
    //recoil
    const chatRooms = useRecoilValue(chatRoomsState);
    const room = chatRooms.filter(room=>room.id===Number(roomId))[0];
    
    
    const addMessage = (message:IMessage) => {
        setContents(prev=>[...prev,message]);
    }

    useEffect(()=>{
        stompClient.connect({},()=>{
            stompClient.subscribe(`/topic/${room.roomName}`,(data)=>{
                console.log(data);
                const newMessage : IMessage = JSON.parse(data.body) as IMessage;
                addMessage(newMessage);
            })
        })
    },[]);
    
    const onSubmit = (event:React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const newMessage : IMessage = {username: userName, content:message};
        stompClient.send(`/hello/${room.roomName}`,{},JSON.stringify(newMessage));
        setMessage("");
    }

    return (
        <Container>
            <h1 className="title">
                ChatsPage
            </h1>
            <h3 className="greeting">
                {room.roomName} 채팅방입니다.
            </h3>
            <form
                onSubmit={onSubmit} 
                className="inputWrapper">
                <input 
                    type="text"
                    className="inputBox"
                    value={message}
                    onChange={(e)=>setMessage(e.currentTarget.value)}
                />
                <button 
                    className="inputBtn"
                    type="submit">
                    전송
                </button>
            </form>
            <div className="chatsWrapper">
                <h3 className="title-2">채팅목록</h3>
                {contents.map((content, index)=><div key={index} className="chatRoom">
                    {content.username}: {content.content}
                </div>)}
            </div>
        </Container>
    )
}

export default ChatPage;