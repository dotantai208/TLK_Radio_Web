package tlk.dev.dao;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import tlk.dev.entity.Advertise;
import tlk.dev.entity.Album;




public interface AdvertiseDao extends JpaRepository<Advertise, Integer>{

  @Query(value = "SELECT a FROM Advertise a ORDER BY FUNCTION('RAND')", nativeQuery = true)
  Advertise findRandomAdvertise();

  @Query("SELECT s FROM Advertise s ")
  Page<Advertise> findAllActive(Pageable pageable);

    @Query("SELECT a FROM Advertise a WHERE  LOWER(a.Name) LIKE LOWER(CONCAT('%', :search, '%'))")
  Page<Advertise> findByAdvertisePage(@Param("search") String search, Pageable pageable);

  @Query("SELECT COUNT(s) > 0 FROM Advertise s WHERE s.Name = :name")
  boolean existsByName(@Param("name") String name);

  
  @Query("SELECT COUNT(t) > 0 FROM Advertise t WHERE t.Name = :name AND t.ID != :id")
  boolean existsByNameAndIdNot(@Param("name") String name, @Param("id") int id);

  @Query("SELECT a FROM Advertise a WHERE a.Deleted = true")
  List<Advertise> findAllNoneDeleted();
}
