package tlk.dev.entity;

import java.util.Date;
import java.util.List;

import org.hibernate.annotations.Nationalized;
import org.springframework.format.annotation.DateTimeFormat;

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
import com.fasterxml.jackson.annotation.JsonIgnore;
@Data
@Entity
public class Album {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int ID;
	@Nationalized
	@Column(nullable = false)
	private String Name;
	@DateTimeFormat(pattern = "yyyy-MM-dd")
	@Temporal(TemporalType.DATE)
	private Date DateReleast;
	@Nationalized
	private String Description;	
	private String Image;
	
	@Temporal(TemporalType.DATE)
	private Date CreateDate = new Date();
    private String CreateUser;
	@Temporal(TemporalType.DATE)
	private Date UpdateDate;
    private String UpdateUser;
	
	private Boolean Deleted;
	
	
	@OneToMany(mappedBy = "album")
	List<Song> Song;
	
	@ManyToOne
	@JoinColumn(name="ArtistID")
	Artist artist;
}
