package tlk.dev.dao;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import tlk.dev.entity.Account;
import tlk.dev.entity.Album;
import tlk.dev.entity.Artist;

public interface AlbumDao extends JpaRepository<Album, Integer>{
    @Query("SELECT s FROM Album s WHERE s.Name LIKE %:name% AND s.Deleted = true")
    List<Album> findByAlbumName(@Param("name") String name);
	
    @Query("SELECT s FROM Album s WHERE s.Name = :name")
    Album findByAlbumNameExactly(@Param("name") String name);

    @Query("SELECT t FROM Album t WHERE t.Deleted = true")
    Page<Album> findAllActive(Pageable pageable);

    @Query("SELECT a FROM Album a WHERE  a.Deleted=true AND LOWER(a.Name) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Album> findByAlbumPage(@Param("search") String search, Pageable pageable);

    @Query("SELECT t FROM Album t WHERE t.Deleted = false")
    Page<Album> findAllActiveFalse(Pageable pageable);

    @Query("SELECT a FROM Album a WHERE  a.Deleted=false AND LOWER(a.Name) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Album> findByAlbumPageFalse(@Param("search") String search, Pageable pageable);

    @Query("SELECT COUNT(s) > 0 FROM Album s WHERE s.Name = :name")
    boolean existsByName(@Param("name") String name);

    @Query("SELECT s FROM Album s WHERE s.artist.StageName LIKE %:name%")
    List<Album> findAlbumBySatgeName(@Param("name") String name);

    @Query("SELECT t FROM Album t WHERE t.Deleted = true")
    List<Album> findAllNoneDeleted();

       
    @Query("SELECT COUNT(t) > 0 FROM Album t WHERE t.Name = :name AND t.ID != :id")
    boolean existsByNameAndIdNot(@Param("name") String name, @Param("id") int id);
    
}
