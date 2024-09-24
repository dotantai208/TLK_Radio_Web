package tlk.dev.dao;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import tlk.dev.entity.Topic;

public interface TopicDao extends JpaRepository<Topic, Integer>{
    @Query("SELECT t FROM Topic t WHERE t.Deleted = true")
    Page<Topic> findAllActive(Pageable pageable);

   
    @Query("SELECT t FROM Topic t WHERE t.Deleted = true AND LOWER(t.Name) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Topic> findByNameContainingIgnoreCase(@Param("search") String search, Pageable pageable);

    @Query("SELECT t FROM Topic t WHERE t.Name = :name")
    Topic findByNameTopic(@Param("name") String name);

    @Query("SELECT t FROM Topic t WHERE t.Name LIKE %:name%")
    List<Topic> searchByNameTopic(@Param("name") String name);


    @Query("SELECT COUNT(s) > 0 FROM Topic s WHERE s.Name = :name")
    boolean existsByName(@Param("name") String name);

   
    @Query("SELECT COUNT(t) > 0 FROM Topic t WHERE t.Name = :name AND t.ID != :id")
    boolean existsByNameAndIdNot(@Param("name") String name, @Param("id") int id);
    

    @Query("SELECT t FROM Topic t WHERE t.Deleted = false")
    Page<Topic> findAllActiveFalse(Pageable pageable);

   
    @Query("SELECT t FROM Topic t WHERE t.Deleted = false AND LOWER(t.Name) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Topic> findByNameContainingIgnoreCaseFalse(@Param("search") String search, Pageable pageable);
}
