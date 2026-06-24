package it.calendariomorbido.auth;

import io.quarkus.arc.properties.IfBuildProperty;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.Set;

@ApplicationScoped
public class DevJwtProducer {

    @Produces
    @IfBuildProperty(name = "quarkus.oidc.enabled", stringValue = "false")
    public JsonWebToken produceDevJwt() {
        String devSubject = System.getProperty("dev.jwt.subject", "00000000-0000-0000-0000-000000000000");
        String devGroups = System.getProperty("dev.jwt.groups", "user");
        return new DevJsonWebToken(devSubject, Set.of(devGroups.split(",")));
    }
}
