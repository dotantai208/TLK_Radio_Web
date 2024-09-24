package tlk.dev.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.transaction.Transactional;
import tlk.dev.entity.Artist;
import tlk.dev.entity.Song;
import tlk.dev.entity.Song_Topic;
import tlk.dev.entity.Topic;

public interface Song_TopicDao extends JpaRepository<Song_Topic, Integer>{
    @Query("SELECT st.topic FROM Song_Topic st WHERE st.song.ID = :songId")
    List<Topic> findTopicsBySongId(int songId);


    @Transactional
    @Modifying
    @Query("DELETE FROM Song_Topic st WHERE st.song.id = :songId")
    void deleteBySongId(@Param("songId") Integer songId);

    @Query("SELECT st.song FROM Song_Topic st WHERE st.topic.ID = :topicId")
    List<Song> findSongByTopicId(int topicId);
}