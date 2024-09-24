package tlk.dev.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import tlk.dev.entity.Artist;
import tlk.dev.entity.Playlist_Song;
import tlk.dev.entity.Song;

public interface Playlist_SongDao extends JpaRepository<Playlist_Song, Integer>{
    @Query("SELECT a FROM Playlist_Song a WHERE a.playlist.id = :id AND a.song.Deleted = true")
	List<Playlist_Song> FindByPlaylistID(@Param("id") Integer id);
}
