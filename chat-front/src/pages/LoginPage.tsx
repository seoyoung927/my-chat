import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import styled from "styled-components";
import { nickNameState } from "../recoil/nickName";

const Container = styled.div`
    width: 100vw;
    height: 100vh;

    display: flex;
    justify-content: center;
    align-items: center;

    .loginBox{
        display: flex;
        flex-direction: column;

        border: 2px solid black;
        border-radius: 10px;
        padding: 20px;
    }
    .title{
        font-size: 32px;
        font-weight: 500;
        margin-bottom: 20px;
    }
    .inputWrapper{
        display: flex;
        justify-content: center;
        align-items: flex-start;
    }
    .inputBox{
        width: calc(100% - 50px);
        height: 24px;
    }
    .inputBtn{
        width: 50px;
        height: 24px;
    }
`;

function LoginPage(){
    const [name, setName] = useState("");
    const navigate = useNavigate();
    //recoils
    const setNickName = useSetRecoilState(nickNameState);
    const onSubmit = (event:React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setNickName(name);
        navigate(`${process.env.PUBLIC_URL}/chats`);
    }
    return (
        <Container>
            <div className="loginBox">
                <h1 className="title">
                    로그인
                </h1>
                <form className="inputWrapper" onSubmit={onSubmit}>
                        <input 
                            className="inputBox"
                            placeholder="닉네임을 입력해주세요."
                            value={name}
                            onChange={(e)=>setName(e.currentTarget.value)}
                        />
                        <button 
                            className="inputBtn"
                            type="submit">
                            시작
                        </button>
                </form>
            </div>
        </Container>
    )
}

export default LoginPage;
