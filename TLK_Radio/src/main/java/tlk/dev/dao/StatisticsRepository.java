package tlk.dev.dao;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import tlk.dev.entity.Song;


public interface StatisticsRepository extends JpaRepository<Song, Integer> {
    
      @Query(value = "EXEC GetArtistStatistics", nativeQuery = true)
    List<Object[]> getAllArtistStatistics();

    @Query(value = "EXEC GetArtistStatisticsByName :artistName", nativeQuery = true)
    List<Object[]> getArtistStatisticsByName(@Param("artistName") String artistName);

    @Query(value = "EXEC GetTop10SongsByViews", nativeQuery = true)
    List<Object[]> findTop10SongsByViews();

    @Query(value = "EXEC GetTop10SongsByFavorites",nativeQuery = true)
    List<Object[]> findTop10SongsByFavorites();

    @Query(value = "SELECT COUNT(*) AS total_songs FROM Song ", nativeQuery = true)
    int getTotalSongs();

    @Query(value = "SELECT COUNT(*) AS total_accounts FROM Account", nativeQuery = true)
    int getTotalAccounts();

    @Query(value = "SELECT COUNT(*) AS total_albums FROM Album", nativeQuery = true)
    int getTotalAlbums();

    @Query(value = "SELECT COUNT(*) AS total_topics FROM Topic", nativeQuery = true)
    int getTotalTopics();
}