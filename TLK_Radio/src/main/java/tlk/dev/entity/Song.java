package tlk.dev.entity;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.hibernate.annotations.Nationalized;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.Data;

@Data
@Entity
public class Song {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int ID;

	@Nationalized
	@Column(nullable = false)
	private String Name;

	private int CountView;
	private int Download;
	private String Image;
	private String Mp3;

	@Temporal(TemporalType.DATE)
	private Date CreateDate = new Date();

    private String CreateUser;

	@Temporal(TemporalType.DATE)
	private Date UpdateDate;

    private String UpdateUser;

	private Boolean Deleted;

    @JsonIgnore
	@ManyToOne
	@JoinColumn(name = "AlbumID")	
	Album album;

    @JsonIgnore
	@OneToMany(mappedBy = "song")
	List<Playlist_Song> playlist_song;

    @JsonIgnore
	@OneToMany(mappedBy = "song")
	List<Song_Artist> song_artist = new ArrayList<>();

    @JsonIgnore
	@OneToMany(mappedBy = "song")
	List<Song_Topic> song_topic = new ArrayList<>();
}
