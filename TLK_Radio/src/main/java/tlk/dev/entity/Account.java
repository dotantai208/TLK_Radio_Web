package tlk.dev.entity;

import java.util.Date;
import java.util.List;

import org.hibernate.annotations.Nationalized;
import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonIgnore;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.Data;

@Data
@Entity
public class Account {
	@Id
	@Column(name = "username")
	private String Username;
	@Column(nullable = false)
	private String Password;
	
	@Nationalized
	@Column(nullable = false, name = "fullname")	
	private String Fullname;
	@DateTimeFormat(pattern = "yyyy-MM-dd")
	@Temporal(TemporalType.DATE)
	private Date DateOfBirth;
	private Boolean Gender;
	private Boolean Role;
	private Boolean Vip;
	@DateTimeFormat(pattern = "yyyy-MM-dd")
	@Temporal(TemporalType.DATE)
	private Date DateVip;
	@JsonIgnore
	@OneToMany(mappedBy = "account")
	List<RecentSong> resentSongs;
	@JsonIgnore
	@OneToMany(mappedBy = "account")
	List<Favorite> favorite;
	@JsonIgnore
	@OneToMany(mappedBy = "account")
	List<Playlist> playlist;
}
