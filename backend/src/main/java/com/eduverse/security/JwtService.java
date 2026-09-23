package com.eduverse.security;

import com.eduverse.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final JwtProperties jwtProperties;

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(jwtProperties.secret().getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(SecurityUser securityUser) {
        return buildToken(securityUser, jwtProperties.accessTokenExpirationMs());
    }

    public String generateRefreshToken(SecurityUser securityUser) {
        return buildToken(securityUser, jwtProperties.refreshTokenExpirationMs());
    }

    private String buildToken(SecurityUser securityUser, long expirationMs) {
        Map<String, Object> claims = Map.of(
                "uid", securityUser.getUserId(),
                "role", securityUser.getUser().getRole().name(),
                "institutionId", securityUser.getInstitutionId() == null ? -1 : securityUser.getInstitutionId(),
                "name", securityUser.getUser().getFullName()
        );
        Date now = new Date();
        return Jwts.builder()
                .claims(claims)
                .subject(securityUser.getUsername())
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expirationMs))
                .signWith(signingKey())
                .compact();
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Long extractUserId(String token) {
        Object uid = extractAllClaims(token).get("uid");
        return uid == null ? null : Long.valueOf(uid.toString());
    }

    public Long extractInstitutionId(String token) {
        Object val = extractAllClaims(token).get("institutionId");
        if (val == null) return null;
        long id = Long.parseLong(val.toString());
        return id == -1 ? null : id;
    }

    public String extractRole(String token) {
        return (String) extractAllClaims(token).get("role");
    }

    public boolean isTokenValid(String token, String expectedEmail) {
        try {
            String email = extractEmail(token);
            return email.equals(expectedEmail) && !isExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private boolean isExpired(String token) {
        try {
            return extractClaim(token, Claims::getExpiration).before(new Date());
        } catch (ExpiredJwtException e) {
            return true;
        }
    }

    private <T> T extractClaim(String token, Function<Claims, T> resolver) {
        return resolver.apply(extractAllClaims(token));
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
