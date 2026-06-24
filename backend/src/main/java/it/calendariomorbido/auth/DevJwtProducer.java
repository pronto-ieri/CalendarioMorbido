package it.calendariomorbido.auth;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.context.RequestScoped;
import jakarta.enterprise.inject.Produces;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.Set;

@ApplicationScoped
public class DevJwtProducer {

    @Produces
    @RequestScoped
    public JsonWebToken produceDevJwt() {
        String devSubject = System.getProperty("dev.jwt.subject", "00000000-0000-0000-0000-000000000000");
        String devGroups = System.getProperty("dev.jwt.groups", "user");
        return new DevJsonWebToken(devSubject, Set.of(devGroups.split(",")));
    }
}
