package it.calendariomorbido.model;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class SavedEventId implements Serializable {
    public UUID userId;
    public UUID eventId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof SavedEventId that)) return false;
        return Objects.equals(userId, that.userId) && Objects.equals(eventId, that.eventId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, eventId);
    }
}
