package tlk.dev.entity;

import java.util.Date;

import org.hibernate.annotations.Nationalized;

import com.fasterxml.jackson.annotation.JsonIgnore;

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
public class Favorite {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int ID;
	@Nationalized
	@Column(nullable = false)
	@Temporal(TemporalType.DATE)
	private Date CreateDate = new Date();
	

	@ManyToOne
	@JoinColumn(name="SongID")
	Song song;
	
	
	@ManyToOne
	@JoinColumn(name="AccountUserName")
	Account account;
}
