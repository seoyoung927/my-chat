import { atom } from "recoil";

export interface IChatRooms{
    id: number;
    roomName: string;
}
export const chatRoomsState = atom<IChatRooms[]>({
    key: "chatRooms",
    default: [],
});
