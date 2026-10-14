package com.ecommerce.service;

import com.ecommerce.dto.ForgotPasswordRequest;
import com.ecommerce.dto.ResetPasswordRequest;
import com.ecommerce.entity.PasswordResetToken;
import com.ecommerce.entity.User;
import com.ecommerce.repository.PasswordResetTokenRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public String createResetToken(
            ForgotPasswordRequest request) {

        User user = userRepository.findByEmail(
                request.getEmail().toLowerCase().trim()
        ).orElseThrow(() ->
                new IllegalArgumentException(
                        "No account found with this email"
                )
        );

        passwordResetTokenRepository
                .findByUser(user)
                .ifPresent(passwordResetTokenRepository::delete);

        String token = UUID.randomUUID().toString();

        PasswordResetToken resetToken =
                PasswordResetToken.builder()
                        .token(token)
                        .user(user)
                        .expiresAt(
                                LocalDateTime.now().plusMinutes(15)
                        )
                        .used(false)
                        .build();

        passwordResetTokenRepository.save(resetToken);

        return token;
    }

    @Transactional
    public void resetPassword(
            ResetPasswordRequest request) {

        PasswordResetToken resetToken =
                passwordResetTokenRepository
                        .findByToken(request.getToken())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Invalid password reset token"
                                )
                        );

        if (resetToken.getUsed()) {
            throw new IllegalArgumentException(
                    "Password reset token has already been used"
            );
        }

        if (resetToken.getExpiresAt()
                .isBefore(LocalDateTime.now())) {

            throw new IllegalArgumentException(
                    "Password reset token has expired"
            );
        }

        User user = resetToken.getUser();

        user.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );

        userRepository.save(user);

        resetToken.setUsed(true);

        passwordResetTokenRepository.save(resetToken);
    }
}