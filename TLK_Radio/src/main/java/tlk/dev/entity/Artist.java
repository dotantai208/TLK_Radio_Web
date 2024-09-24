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
public class Artist {
	@Id
	@Nationalized
	@Column(nullable = false)
	private String StageName;
	@Column(nullable = false)
	@Nationalized
	private String RealName;
	@Temporal(TemporalType.DATE)
	private Date DateOfBirth;
	@Nationalized
	@Column(length = 4000)
	private String Story;
	private String Image;
	
	@Temporal(TemporalType.DATE)
	private Date CreateDate = new Date();
    private String CreateUser;
	@Temporal(TemporalType.DATE)
	private Date UpdateDate;
    private String UpdateUser;
	
	private Boolean Deleted;
	
	//Khoá ngoại tới danh sách bài hát
	@JsonIgnore
	@OneToMany(mappedBy = "artist")
	List<Song_Artist> song_artist;
	@JsonIgnore
	//Khoá ngoại tới danh sách album
	@OneToMany(mappedBy = "artist")
	List<Album> album;
}
