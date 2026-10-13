package com.arenahub.Service;

import com.arenahub.dto.request.UtenteUpdateRequest;
import com.arenahub.dto.response.UtenteResponse;
import com.arenahub.entity.Utente;
import com.arenahub.exception.ApiException;
import com.arenahub.repository.UtenteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import com.arenahub.security.PasswordService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class UtenteService {

    private final UtenteRepository utenteRepository;
    private final PasswordService passwordEncoder;

    public UtenteResponse aggiorna(Long idUtente, UtenteUpdateRequest r) {
        Utente u = utenteRepository.findById(idUtente)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Autenticazione richiesta"));

        if (r.email() != null && !r.email().equals(u.getEmail())) {
            if (utenteRepository.existsByEmailAndIdNot(r.email(), idUtente)) {
                throw new ApiException(HttpStatus.CONFLICT, "Email già registrata", "email");
            }
            u.setEmail(r.email());
        }
        if (r.nickname() != null && !r.nickname().equals(u.getNickname())) {
            if (utenteRepository.existsByNicknameAndIdNot(r.nickname(), idUtente)) {
                throw new ApiException(HttpStatus.CONFLICT, "Nickname già in uso", "nickname");
            }
            u.setNickname(r.nickname());
        }
        if (r.nome() != null) {
            u.setNome(r.nome());
        }
        if (r.cognome() != null) {
            u.setCognome(r.cognome());
        }
        if (r.password() != null && !r.password().isBlank()) {
            u.setPasswordHash(passwordEncoder.encode(r.password()));
        }
        return UtenteResponse.da(u);
    }
}
