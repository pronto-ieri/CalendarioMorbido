package it.calendariomorbido.auth;

import org.eclipse.microprofile.jwt.Claims;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.security.Principal;
import java.util.Collections;
import java.util.Optional;
import java.util.Set;

public class DevJsonWebToken implements JsonWebToken {

    private final String subject;
    private final Set<String> groups;

    public DevJsonWebToken(String subject, Set<String> groups) {
        this.subject = subject;
        this.groups = groups;
    }

    @Override
    public String getName() {
        return subject;
    }

    @Override
    public String getRawToken() {
        return "dev-token";
    }

    @Override
    public String getIssuer() {
        return "dev";
    }

    @Override
    public Set<String> getAudience() {
        return Collections.emptySet();
    }

    @Override
    public String getSubject() {
        return subject;
    }

    @Override
    public String getTokenID() {
        return "dev-token-id";
    }

    @Override
    public long getExpirationTime() {
        return Long.MAX_VALUE;
    }

    @Override
    public long getIssuedAtTime() {
        return 0L;
    }

    @Override
    public Set<String> getGroups() {
        return groups;
    }

    @Override
    public Set<String> getClaimNames() {
        return Collections.emptySet();
    }

    @Override
    public <T> T getClaim(String claimName) {
        return null;
    }

    @Override
    public <T> T getClaim(Claims claim) {
        return null;
    }

    @Override
    public <T> Optional<T> claim(String claimName) {
        return Optional.empty();
    }

    @Override
    public <T> Optional<T> claim(Claims claim) {
        return Optional.empty();
    }
}
