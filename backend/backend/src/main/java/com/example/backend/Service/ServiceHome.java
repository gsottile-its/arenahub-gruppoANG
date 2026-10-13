package com.example.backend.Service;

import org.springframework.stereotype.Service;

@Service
public class ServiceHome {

    public String messaggioBenvenuto() {
        return "Benvenuto in ArenaHub";
    }
}