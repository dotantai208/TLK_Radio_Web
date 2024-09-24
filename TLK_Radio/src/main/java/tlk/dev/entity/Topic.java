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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.Data;

@Data
@Entity
public class Topic {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int ID;
	@Nationalized
	@Column(nullable = false)
	private String Name;
	private String Image;
	
	@Temporal(TemporalType.DATE)
	private Date CreateDate = new Date();
    private String CreateUser;
	@Temporal(TemporalType.DATE)
	private Date UpdateDate;
    private String UpdateUser;

	
	private Boolean Deleted;
	@JsonIgnore
	@OneToMany(mappedBy = "topic")
	List<Song_Topic> song_topic;
}
