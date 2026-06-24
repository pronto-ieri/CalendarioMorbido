FROM quay.io/keycloak/keycloak:26.2

COPY realm.json /opt/keycloak/data/import/realm.json

RUN /opt/keycloak/bin/kc.sh build --db=postgres

USER 1000
EXPOSE 8080
ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start", "--optimized", "--import-realm"]
