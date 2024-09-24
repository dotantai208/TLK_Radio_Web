package tlk.dev.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Data
@Entity
public class Song_Topic {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int ID;

	@ManyToOne
    @JoinColumn(name="SongID", nullable = false)
    private Song song;

    @ManyToOne
    @JoinColumn(name="TopicID", nullable = false)
    private Topic topic;
}
