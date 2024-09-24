package tlk.dev.dao;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import tlk.dev.entity.RecentSong;

public interface RecentSongDao extends JpaRepository<RecentSong, Integer>{
    @Query("SELECT f FROM RecentSong f WHERE f.account.Username = :username AND f.song.Deleted = true ORDER By f.ID DESC ")
	List<RecentSong> findByAccount(String username);

    @Query("SELECT f FROM RecentSong f WHERE f.account.Username = :username ORDER BY f.ID DESC")
    List<RecentSong> findTop10ByAccount(String username, Pageable pageable);

}
