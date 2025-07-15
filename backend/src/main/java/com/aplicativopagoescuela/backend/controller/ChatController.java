package com.aplicativopagoescuela.backend.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import com.aplicativopagoescuela.backend.service.ChatService;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/ask")
    public ResponseEntity<String> askQuestion(@RequestBody String question) {
        String response = chatService.getResponse(question);
        return ResponseEntity.ok(response);
    }
}
