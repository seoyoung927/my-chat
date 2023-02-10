package com.example.demo.Controller;

import com.example.demo.Model.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ChatController {
//    @MessageMapping("/hello")
//    @SendTo("/topic/roomId")
//    public Message broadCast(Message message){
//        return message;
//    }
    @Autowired
    private SimpMessagingTemplate template;

    @MessageMapping("/hello/{room}")
    public void broadCast(@DestinationVariable("room") String room, Message message){
        template.convertAndSend("/topic/"+room,message);
    }
}
