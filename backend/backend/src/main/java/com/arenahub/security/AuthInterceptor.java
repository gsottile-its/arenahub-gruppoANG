package com.arenahub.security;

import com.arenahub.exception.ApiException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    public static final String ATTRIBUTO_UTENTE = "utenteLoggato";

    private final JwtService jwtService;

    public AuthInterceptor(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        UtenteLoggato utente = null;
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            utente = jwtService.leggiToken(header.substring(7)).orElse(null);
        }
        request.setAttribute(ATTRIBUTO_UTENTE, utente);

        if (!(handler instanceof HandlerMethod metodo)) {
            return true;
        }

        boolean pubblico = metodo.hasMethodAnnotation(Pubblico.class)
                || metodo.getBeanType().isAnnotationPresent(Pubblico.class);
        if (pubblico) {
            return true;
        }

        if (utente == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Autenticazione richiesta");
        }

        if (metodo.hasMethodAnnotation(SoloAdmin.class) && !utente.isAdmin()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Operazione non consentita");
        }
        return true;
    }
}
