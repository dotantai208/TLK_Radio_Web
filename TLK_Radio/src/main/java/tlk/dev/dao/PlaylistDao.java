package tlk.dev.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import tlk.dev.entity.Playlist;


public interface PlaylistDao extends JpaRepository<Playlist, Integer>{
    @Query("SELECT s FROM Playlist s WHERE s.Name LIKE %:name% AND s.Deleted = true")
    List<Playlist> findByPlaylistName(@Param("name") String name);

    @Query("SELECT s FROM Playlist s WHERE s.account.Username LIKE %:name% AND s.Deleted = true")
    List<Playlist> findWithUserName(@Param("name") String name);

    @Query("SELECT s FROM Playlist s WHERE s.share = true AND s.Deleted = true")
    List<Playlist> getPlaylistPublic();
}
