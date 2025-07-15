package com.aplicativopagoescuela.backend.service;

import org.springframework.stereotype.Service;

@Service
public class ChatService {

    public String getResponse(String question) {
        // Aquí puedes integrar un modelo de IA como OpenAI GPT para generar respuestas.
        return "Esta es una respuesta generada por IA para la pregunta: " + question;
    }
}
