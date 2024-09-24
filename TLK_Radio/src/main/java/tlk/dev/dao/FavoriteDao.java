package tlk.dev.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import tlk.dev.entity.Favorite;
import java.util.List;

public interface FavoriteDao extends JpaRepository<Favorite, Integer>{
   @Query("SELECT f FROM Favorite f WHERE f.account.Username = :username AND f.song.ID = :id")
	Favorite findByAccountAndSong(String username, Integer id);

   @Query("SELECT f FROM Favorite f WHERE f.account.Username = :username AND f.song.Deleted = true")
	List<Favorite> findByAccount(String username);
}
