package com.arenahub.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class ApiException extends RuntimeException {

    private final HttpStatus stato;
    private final String campo;

    public ApiException(HttpStatus stato, String messaggio) {
        this(stato, messaggio, null);
    }

    public ApiException(HttpStatus stato, String messaggio, String campo) {
        super(messaggio);
        this.stato = stato;
        this.campo = campo;
    }
}
