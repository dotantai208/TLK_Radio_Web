package tlk.dev.restController;

import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import tlk.dev.dao.Song_ArtistDao;
import tlk.dev.dao.Song_TopicDao;
import tlk.dev.entity.Song;
import tlk.dev.entity.Song_Artist;
import tlk.dev.entity.Song_Topic;
import tlk.dev.entity.Topic;

@CrossOrigin("*")
@RestController
public class Song_topicRestController {
    @Autowired
	Song_TopicDao dao;

    @GetMapping("/rest/Song_Topic")
	public ResponseEntity<List<Song_Topic>> getAll(Model model){
		return ResponseEntity.ok(dao.findAll());
	}
    @GetMapping("/rest/Song_Topic/SongId={songId}")
    public ResponseEntity<List<Topic>> getTopicsBySongId(@PathVariable Integer songId) {
        List<Topic> topics = dao.findTopicsBySongId(songId);
        if (topics.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());  // Return an empty list with a 200 status
        }
        return ResponseEntity.ok(topics);
    }
    

    @PostMapping("/rest/Song_Topic/bulk")
    public ResponseEntity<?> saveSongTopics(@RequestBody List<Song_Topic> songTopics) {
        songTopics.forEach(st -> System.out.println("Received Song_Topic data: " + st));
        dao.saveAll(songTopics);
        return ResponseEntity.ok("Song topics saved successfully");
    }
    
    @GetMapping("/rest/Song_Topic/TopicId={topicId}")
    public ResponseEntity<List<Song>> getTopicsByTopicId(@PathVariable Integer topicId) {
        List<Song> topics = dao.findSongByTopicId(topicId);
        if (topics.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());  // Return an empty list with a 200 status
        }
        return ResponseEntity.ok(topics);
    }
}
