package tlk.dev.restController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import tlk.dev.dao.Playlist_SongDao;
import tlk.dev.dao.Song_ArtistDao;
import tlk.dev.entity.Artist;
import tlk.dev.entity.Playlist_Song;
import tlk.dev.entity.Song;
import tlk.dev.entity.Song_Artist;





@CrossOrigin("*")
@RestController
public class Playlist_SongRestController {
	@Autowired
	Playlist_SongDao dao;
	
	@GetMapping("/rest/Playlist_Song")
	public ResponseEntity<List<Playlist_Song>> getAll(Model model){
		return ResponseEntity.ok(dao.findAll());
	}
	
	
	@GetMapping("/rest/Playlist_Song/PlaylistID={id}")
	public ResponseEntity<java.util.Map<String, Object>> getOne(@PathVariable("id") Integer id){
		java.util.Map<String, Object> response = new HashMap<>();
		List<Playlist_Song> result = dao.FindByPlaylistID(id);
	    if(result != null) {
			response.put("data", true);
            response.put("song", result);
	        return ResponseEntity.ok(response);
	    }
	    response.put("data", false);
        return ResponseEntity.ok(response);
	}

	
	
	@PostMapping("/rest/Playlist_Song")
	public ResponseEntity<Playlist_Song> post(@RequestBody Playlist_Song playlist_Song){
		dao.save(playlist_Song);
		return ResponseEntity.ok(playlist_Song);
	}
	
	@PutMapping("/rest/Playlist_Song/{id}")
	public ResponseEntity<Playlist_Song> put(@PathVariable("id") Integer id, @RequestBody Playlist_Song playlist_Song){
		if(!dao.existsById(playlist_Song.getID())) {
			return ResponseEntity.notFound().build();
		}
		dao.save(playlist_Song);
		return ResponseEntity.ok(playlist_Song);
	}
	
	@DeleteMapping("/rest/Playlist_Song/{id}")
	public ResponseEntity<Song_Artist> delete(@PathVariable("id") Integer id){
		if(!dao.existsById(id)) {
			return ResponseEntity.notFound().build();
		}
		dao.deleteById(id);
		return ResponseEntity.ok().build();
	}
}
