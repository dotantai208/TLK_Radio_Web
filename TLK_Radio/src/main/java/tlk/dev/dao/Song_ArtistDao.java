package tlk.dev.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.transaction.Transactional;
import tlk.dev.entity.Artist;
import tlk.dev.entity.Song;
import tlk.dev.entity.Song_Artist;

public interface Song_ArtistDao extends JpaRepository<Song_Artist, Integer>{
	@Query("SELECT a.artist FROM Song_Artist a WHERE a.song.id = :songid")
	List<Artist> FindBySongId(@Param("songid") Integer songid);
	
	@Query("SELECT a.song FROM Song_Artist a WHERE a.artist.StageName = :stageName AND a.song.Deleted =true")
	List<Song> FindByArtistStageName(@Param("stageName") String stageName);


    @Query("SELECT sa.artist FROM Song_Artist sa WHERE sa.song.ID = :songId")
    List<Artist> findArtistsBySongId(@Param("songId") int songId);


	@Transactional
	@Modifying
	@Query("DELETE FROM Song_Artist sa WHERE sa.song.id = :songId")
	void deleteBySongId(@Param("songId") Integer songId);
}
