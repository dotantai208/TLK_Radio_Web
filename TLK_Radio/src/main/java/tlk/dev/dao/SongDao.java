package tlk.dev.dao;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import tlk.dev.entity.Album;
import tlk.dev.entity.Artist;
import tlk.dev.entity.Song;
import tlk.dev.entity.Song_Artist;

public interface SongDao extends JpaRepository<Song, Integer>{
	
    @Query("SELECT s FROM Song s WHERE s.Name LIKE %:name% AND s.Deleted = true")
    List<Song> findBySongName(@Param("name") String name);
  
    @Query("SELECT s FROM Song s WHERE s.album.ID = :albumid")
    List<Song> findByAlbumId(@Param("albumid") int albumid);

    @Query("SELECT s FROM Song s " +
        "LEFT JOIN s.album a " +
        "LEFT JOIN s.song_artist sa " +
        "LEFT JOIN sa.artist art " +
        "LEFT JOIN s.song_topic st " +
        "LEFT JOIN st.topic t " +
        "WHERE s.Deleted = true AND (" +
        "LOWER(s.Name) LIKE LOWER(CONCAT('%', :search, '%')) " +
        "OR LOWER(art.StageName) LIKE LOWER(CONCAT('%', :search, '%')) " +
        "OR LOWER(a.Name) LIKE LOWER(CONCAT('%', :search, '%')) " +
        "OR LOWER(t.Name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Song> findByNameOrArtistOrAlbumOrTopicContainingIgnoreCase(@Param("search") String search, Pageable pageable);


    @Query("SELECT s.album.ID FROM Song s WHERE s.ID = :songId")
    Integer findAlbumIdBySongId(@Param("songId") Integer songId);

    @Query("SELECT s FROM Song s WHERE s.Deleted = true")
    Page<Song> findAllActive(Pageable pageable);

    @Query("SELECT COUNT(s) > 0 FROM Song s WHERE s.Name = :name")
    boolean existsByName(@Param("name") String name);

    @Query("SELECT s FROM Song s WHERE s.Deleted = true")
    List<Song> findAllNoneDeleted();

    @Query("SELECT s FROM Song s WHERE s.Deleted = true ORDER BY s.ID DESC")
    List<Song> findSongNew(Pageable pageable);


    @Query("SELECT COUNT(t) > 0 FROM Song t WHERE t.Name = :name AND t.ID != :id")
    boolean existsByNameAndIdNot(@Param("name") String name, @Param("id") int id);

    @Query("SELECT s FROM Song s " +
        "LEFT JOIN s.album a " +
        "LEFT JOIN s.song_artist sa " +
        "LEFT JOIN sa.artist art " +
        "LEFT JOIN s.song_topic st " +
        "LEFT JOIN st.topic t " +
        "WHERE s.Deleted = false AND (" +
        "LOWER(s.Name) LIKE LOWER(CONCAT('%', :search, '%')) " +
        "OR LOWER(art.StageName) LIKE LOWER(CONCAT('%', :search, '%')) " +
        "OR LOWER(a.Name) LIKE LOWER(CONCAT('%', :search, '%')) " +
        "OR LOWER(t.Name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Song> findByNameOrArtistOrAlbumOrTopicContainingDeleteFalse(@Param("search") String search, Pageable pageable);

    @Query("SELECT s FROM Song s WHERE s.Deleted = false")
    Page<Song> findAllActiveFalse(Pageable pageable);

    @Query("SELECT s.album FROM Song s WHERE s.ID = :songId")
    Album findAlbumBySongId(@Param("songId") int songId);

    @Query("SELECT s FROM Song s WHERE s.ID != :songId AND s.Deleted = true AND s.ID IN " +
    "(SELECT st.song.ID FROM Song_Topic st WHERE st.topic.ID IN " +
    "(SELECT st2.topic.ID FROM Song_Topic st2 WHERE st2.song.ID = :songId)) " +
    "AND s.ID NOT IN :excludedSongIds ORDER BY RAND()")
    List<Song> findFilteredRandomSongWithSameTopic(@Param("songId") int songId, @Param("excludedSongIds") List<Integer> excludedSongIds);


    @Query("SELECT s FROM Song s WHERE s.ID NOT IN :excludedSongIds AND s.Deleted = true AND s.ID IN " +
       "(SELECT st.song.ID FROM Song_Topic st WHERE st.topic.ID = :topicId) " +
       "ORDER BY RAND()")
    List<Song> findFilteredRandomSongWithSameTopicRecent(@Param("topicId") int topicId, @Param("excludedSongIds") List<Integer> excludedSongIds);

    @Query("SELECT s FROM Song s WHERE s.Deleted = true AND s.ID NOT IN :excludedSongIds")
    List<Song> findAllDeletedSongsExcludingIds(@Param("excludedSongIds") List<Integer> excludedSongIds);


    @Query("SELECT s FROM Song s WHERE s.Deleted = true AND s.album IS NULL")
Page<Song> findAllActiveAndAlbumIsNull(Pageable pageable);



@Query("SELECT s FROM Song s " +
       "LEFT JOIN s.album a " +
       "LEFT JOIN s.song_artist sa " +
       "LEFT JOIN sa.artist art " +
       "LEFT JOIN s.song_topic st " +
       "LEFT JOIN st.topic t " +
       "WHERE s.Deleted = true AND s.album IS NULL AND (" +
       "LOWER(s.Name) LIKE LOWER(CONCAT('%', :search, '%')) " +
       "OR LOWER(art.StageName) LIKE LOWER(CONCAT('%', :search, '%')) " +
       "OR LOWER(a.Name) LIKE LOWER(CONCAT('%', :search, '%')) " +
       "OR LOWER(t.Name) LIKE LOWER(CONCAT('%', :search, '%')))")
Page<Song> findByNameOrArtistOrAlbumOrTopicContainingIgnoreCaseAndAlbumIsNull(@Param("search") String search, Pageable pageable);

}
