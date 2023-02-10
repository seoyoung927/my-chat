import styled from "styled-components";
import { useRecoilState, useRecoilValue } from "recoil";
import { nickNameState } from "../recoil/nickName";
import { useState } from "react";
import { chatRoomsState } from "../recoil/chatRooms";
import { useNavigate } from "react-router-dom";

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

function ChatsPage(){
    const nickName = useRecoilValue(nickNameState);
    const [newRoom, setNewRoom] = useState("");
    const navigate = useNavigate();
    //recoil
    const [chatRooms, setChatRooms] = useRecoilState(chatRoomsState);

    const onAddRoom = (event:React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const length = chatRooms.length;
        setChatRooms(prev=>[...prev,{
            id: length,
            roomName: newRoom,
        }]);
    }

    return (
        <Container>
            <h1 className="title">
                ChatsPage
            </h1>
            <h3 className="greeting">
                {nickName}님 안녕하세요.
            </h3>
            <form
                onSubmit={onAddRoom} 
                className="inputWrapper">
                <input 
                    type="text"
                    className="inputBox"
                    placeholder="채팅방이름을 입력해주세요."
                    value={newRoom}
                    onChange={(e)=>setNewRoom(e.currentTarget.value)}
                />
                <button 
                    className="inputBtn"
                    type="submit">
                    검색
                </button>
            </form>
            <div className="chatsWrapper">
                <h3 className="title-2">채팅방목록</h3>
                {chatRooms.map((room, index)=><div key={index} className="chatRoom">
                    {room.roomName}
                    <button
                        onClick={()=>{
                            navigate(`${process.env.PUBLIC_URL}/chat/${room.id}`);
                        }}
                        className="roomBtn">
                        입장</button>
                </div>)}
            </div>
        </Container>
    )
}

export default ChatsPage;