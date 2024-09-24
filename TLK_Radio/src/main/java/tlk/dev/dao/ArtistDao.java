package tlk.dev.dao;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import tlk.dev.entity.Account;
import tlk.dev.entity.Artist;
import tlk.dev.entity.Song;
import tlk.dev.entity.Topic;

public interface ArtistDao extends JpaRepository<Artist, String>{
    @Query("SELECT s FROM Artist s WHERE s.StageName LIKE %:name% AND s.Deleted = true")
    List<Artist> findByArtistName(@Param("name") String name);

    @Query("SELECT a FROM Artist a WHERE a.StageName = :stageName")
    Optional<Artist> findByStageName(@Param("stageName") String stageName);

    @Query("SELECT a FROM Artist a WHERE a.StageName = :stageName")
    Artist findByStageName2(@Param("stageName") String stageName);
   
    @Query("SELECT t FROM Artist t WHERE t.Deleted = true")
    Page<Artist> findAllActive(Pageable pageable);

    @Query("SELECT a FROM Artist a WHERE a.Deleted=true AND (LOWER(a.StageName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(a.RealName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Artist> findAllPage(@Param("search") String search, Pageable pageable);

    @Query("SELECT t FROM Artist t WHERE t.Deleted = true")
    List<Artist> findAllNoneDeleted();

    @Query("SELECT s FROM Artist s WHERE s.Deleted = true ORDER BY s.CreateDate DESC")
    List<Artist> findArtistNew(Pageable pageable);


    @Query("SELECT t FROM Artist t WHERE t.Deleted = false")
    Page<Artist> findAllActiveFalse(Pageable pageable);

    @Query("SELECT a FROM Artist a WHERE a.Deleted=false AND (LOWER(a.StageName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(a.RealName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Artist> findAllPageFalse(@Param("search") String search, Pageable pageable);
}
