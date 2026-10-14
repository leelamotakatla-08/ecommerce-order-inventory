package com.ecommerce.config;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.ecommerce.service.CustomUserDetailsService;
import com.ecommerce.service.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter
        extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader =
                request.getHeader("Authorization");

        System.out.println(
                "========== JWT FILTER =========="
        );

        System.out.println(
                "REQUEST: "
                        + request.getMethod()
                        + " "
                        + request.getRequestURI()
        );

        System.out.println(
                "AUTH HEADER PRESENT: "
                        + (authHeader != null)
        );

        if (authHeader == null
                || !authHeader.startsWith("Bearer ")) {

            System.out.println(
                    "NO BEARER TOKEN FOUND"
            );

            filterChain.doFilter(request, response);
            return;
        }

        String token =
                authHeader.substring(7).trim();

        System.out.println(
                "JWT TOKEN RECEIVED: YES"
        );

        try {

            String email =
                    jwtService.extractEmail(token);

            System.out.println(
                    "JWT EMAIL: " + email
            );

            UserDetails userDetails =
                    userDetailsService
                            .loadUserByUsername(email);

            System.out.println(
                    "USER FOUND: "
                            + userDetails.getUsername()
            );

            System.out.println(
                    "AUTHORITIES: "
                            + userDetails.getAuthorities()
            );

            if (!jwtService.isTokenValid(token)) {

                System.out.println(
                        "JWT TOKEN INVALID"
                );

                filterChain.doFilter(
                        request,
                        response
                );

                return;
            }

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

            authentication.setDetails(
                    new WebAuthenticationDetailsSource()
                            .buildDetails(request)
            );

            SecurityContextHolder
                    .getContext()
                    .setAuthentication(authentication);

            System.out.println(
                    "JWT AUTHENTICATION SUCCESS"
            );

            System.out.println(
                    "SECURITY CONTEXT USER: "
                            + SecurityContextHolder
                                    .getContext()
                                    .getAuthentication()
                                    .getName()
            );

        } catch (Exception exception) {

            System.out.println(
                    "========== JWT ERROR =========="
            );

            System.out.println(
                    "ERROR TYPE: "
                            + exception
                                    .getClass()
                                    .getName()
            );

            System.out.println(
                    "ERROR MESSAGE: "
                            + exception.getMessage()
            );

            SecurityContextHolder
                    .clearContext();
        }

        filterChain.doFilter(
                request,
                response
        );
    }
}