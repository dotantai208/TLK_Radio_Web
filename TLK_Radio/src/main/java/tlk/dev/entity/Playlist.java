package tlk.dev.entity;

import java.util.Date;
import java.util.List;

import org.hibernate.annotations.Nationalized;

import com.fasterxml.jackson.annotation.JsonIgnore;

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
public class Playlist {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int ID;
	@Nationalized
	@Column(nullable = false)
	private String Name;
	@Column(nullable = false)
	@Temporal(TemporalType.DATE)
	private Date CreateDate = new Date();
	@Column(nullable = true)
	private String Image;

	private Boolean Deleted;

	@ManyToOne
	@JoinColumn(name="AccountUserName")
	Account account;
	
	@JsonIgnore
	@OneToMany(mappedBy = "playlist")
	List<Playlist_Song> playlist_song;
	
	private Boolean share;
	
}
