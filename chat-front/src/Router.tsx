import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import ChatPage from "./pages/ChatPage";
import ChatsPage from "./pages/ChatsPage";
import LoginPage from "./pages/LoginPage";
import VideoPage from "./pages/VideoPage";


const router = createBrowserRouter([
    {
        path: `${process.env.PUBLIC_URL}/`,
        element: <App />,
        children: [
            {
                path: "login/",
                element: <LoginPage />
            },
            {
                path: "chats/",
                element: <ChatsPage />
            },
            {
                path: "chat/:roomId",
                element: <ChatPage />
            },
            {
                path: "video/:roomId",
                element: <VideoPage />
            }
            // {
            //     path: "",
            //     element: <MainPage />
            // },
            // {
            //     path:"login/",
            //     element: <LoginPage />
            // },
            // {
            //     path:"todo/*",
            //     element: <PrivateRouter component={<TodoPage />} />
            // },
            // {
            //     path:"friend/*",
            //     element: <PrivateRouter component={<FriendPage />} />
            // },
            // {
            //     path:"*",
            //     element: <NotFound />
            // }
        ]
    }
])

export default router;
