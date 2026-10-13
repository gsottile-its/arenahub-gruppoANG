package com.arenahub.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Map<String, Object>> api(ApiException e) {
        Map<String, Object> corpo = new LinkedHashMap<>();
        corpo.put("errore", e.getMessage());
        if (e.getCampo() != null) {
            corpo.put("campo", e.getCampo());
        }
        return ResponseEntity.status(e.getStato()).body(corpo);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> validazione(MethodArgumentNotValidException e) {
        List<String> campi = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getField)
                .distinct()
                .toList();
        Map<String, Object> corpo = new LinkedHashMap<>();
        corpo.put("errore", "Dati non validi");
        corpo.put("campi", campi);
        return ResponseEntity.badRequest().body(corpo);
    }

    @ExceptionHandler({
            HttpMessageNotReadableException.class,
            MethodArgumentTypeMismatchException.class,
            MissingServletRequestParameterException.class,
            MissingServletRequestPartException.class
    })
    public ResponseEntity<Map<String, Object>> richiestaNonValida(Exception e) {
        return ResponseEntity.badRequest().body(Map.of("errore", "Dati non validi"));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, Object>> fileTroppoGrande(MaxUploadSizeExceededException e) {
        return ResponseEntity.status(413).body(Map.of("errore", "Immagine troppo grande (max 2 MB)"));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> conflitto(DataIntegrityViolationException e) {
        log.warn("Violazione di integrita' dei dati", e);
        return ResponseEntity.status(409).body(Map.of("errore", "Operazione in conflitto con i dati esistenti"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> imprevisto(Exception e) {
        log.error("Errore imprevisto", e);
        return ResponseEntity.status(500).body(Map.of("errore", "Errore interno, riprova più tardi"));
    }
}
