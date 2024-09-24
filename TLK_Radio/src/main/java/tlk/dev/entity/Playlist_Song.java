package tlk.dev.entity;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.Data;

@Data
@Entity
public class Playlist_Song {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int ID;
	@Temporal(TemporalType.DATE)
	@Column(nullable = false)
	private Date CreateDate = new Date();
	
	@ManyToOne
	@JoinColumn(name="SongID")
	Song song;
	
	@ManyToOne
	@JoinColumn(name="PlaylistID")
	Playlist playlist;
}
