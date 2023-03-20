package com.example.demo.Controller;

import com.example.demo.Model.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

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
        template.convertAndSend("/topic/chat/"+room,message);
    }

    @MessageMapping("/welcome/{room}")
    public void welcome(@DestinationVariable("room") String room, String message){
        template.convertAndSend("/topic/welcome/"+room, message);
    }

    @MessageMapping("/offer/{room}")
    public void offer(@DestinationVariable("room") String room, String message){
        template.convertAndSend("/topic/offer/"+room,message);
    }

    @MessageMapping("/answer/{room}")
    public void answer(@DestinationVariable("room") String room, String message){
        template.convertAndSend("/topic/answer/"+room,message);
    }

    @MessageMapping("/ice/{room}")
    public void ice(@DestinationVariable("room") String room, String message){
        template.convertAndSend("/topic/ice/"+room,message);
    }

    @MessageMapping("/exit/{room}")
    public void exit(@DestinationVariable("room") String room, String message){
        template.convertAndSend("/topic/exit/"+room,message);
    }

}
