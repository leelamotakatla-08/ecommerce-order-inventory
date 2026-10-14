package com.ecommerce.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    private final CustomAuthenticationEntryPoint customAuthenticationEntryPoint;

    private final CustomAccessDeniedHandler customAccessDeniedHandler;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            // Stateless REST API using JWT
            .csrf(csrf -> csrf.disable())

            .cors(cors -> {})

            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            // Custom 401 and 403 handlers
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(
                    customAuthenticationEntryPoint
                )
                .accessDeniedHandler(
                    customAccessDeniedHandler
                )
            )

            .authorizeHttpRequests(auth -> auth

                // Public authentication endpoints
                .requestMatchers("/api/auth/**").permitAll()

                // Public product, category and inventory browsing
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/products/**",
                    "/api/categories/**",
                    "/api/inventory/**"
                ).permitAll()

                // Authenticated customers and admins can create products
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/products",
                    "/api/products/"
                ).hasAnyRole("CUSTOMER", "ADMIN")

                // Only admins can create categories and inventory
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/categories/**",
                    "/api/inventory/**"
                ).hasRole("ADMIN")

                // Only admins can update products, categories and inventory
                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/products/**",
                    "/api/categories/**",
                    "/api/inventory/**"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.PATCH,
                    "/api/products/**",
                    "/api/categories/**",
                    "/api/inventory/**"
                ).hasRole("ADMIN")

                // Only admins can delete products, categories and inventory
                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/products/**",
                    "/api/categories/**",
                    "/api/inventory/**"
                ).hasRole("ADMIN")

                // Admin-only endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // Only admins can update order status
                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/orders/*/status"
                ).hasRole("ADMIN")

                // Customers and admins can access their commerce endpoints
                .requestMatchers(
                    "/api/carts/**",
                    "/api/orders/**",
                    "/api/wishlists/**",
                    "/api/addresses/**",
                    "/api/payments/**"
                ).hasAnyRole("CUSTOMER", "ADMIN")

                // All other endpoints require authentication
                .anyRequest().authenticated()
            )

            // Process JWT before username/password authentication
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}