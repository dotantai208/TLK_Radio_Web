package tlk.dev.restController;

import java.util.ArrayList;
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

import tlk.dev.dao.Song_ArtistDao;
import tlk.dev.entity.Artist;
import tlk.dev.entity.Song;
import tlk.dev.entity.Song_Artist;





@CrossOrigin("*")
@RestController
public class Song_ArtistRestController {
	@Autowired
	Song_ArtistDao dao;
	
	@GetMapping("/rest/Song_Artist")
	public ResponseEntity<List<Song_Artist>> getAll(Model model){
		return ResponseEntity.ok(dao.findAll());
	}
	@PostMapping("/rest/Song_Artist/bulk")
    public ResponseEntity<?> saveSongArtists(@RequestBody List<Song_Artist> songArtists) {
        System.out.println("Received Song_Artist data: " + songArtists);
        dao.saveAll(songArtists);
        return ResponseEntity.ok("Song artists saved successfully");
    }
	
	@GetMapping("/rest/Song_Artist/SongId={id}")
	public ResponseEntity<List<Artist>> getOne(@PathVariable("id") Integer id){
		List<Artist> result = dao.FindBySongId(id);
	    if(result == null || result.isEmpty()) {
	        return ResponseEntity.notFound().build();
	    }
	    return ResponseEntity.ok(result);
	}
	@GetMapping("/rest/Song_Artist/SongId/admin/{id}")
    public ResponseEntity<List<Artist>> getArtistsBySongId(@PathVariable("id") Integer id){
        List<Artist> result = dao.findArtistsBySongId(id);
        if(result == null || result.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(result);
    }
	@GetMapping("/rest/Song_Artist/StageName={id}")
	public ResponseEntity<List<Song>> getByStageName(@PathVariable("id") String id){
		List<Song> result = dao.FindByArtistStageName(id);
	    if(result == null || result.isEmpty()) {
	        return ResponseEntity.notFound().build();
	    }
	    return ResponseEntity.ok(result);
	}
	
	@PostMapping("/rest/Song_Artist")
	public ResponseEntity<Song_Artist> post(@RequestBody Song_Artist Song_Artist){
		if(!dao.existsById(Song_Artist.getID())) {
			return ResponseEntity.badRequest().build();
		}
		dao.save(Song_Artist);
		return ResponseEntity.ok(Song_Artist);
	}
	
	@PutMapping("/rest/Song_Artist/{id}")
	public ResponseEntity<Song_Artist> put(@PathVariable("id") Integer id, @RequestBody Song_Artist Song_Artist){
		if(!dao.existsById(Song_Artist.getID())) {
			return ResponseEntity.notFound().build();
		}
		dao.save(Song_Artist);
		return ResponseEntity.ok(Song_Artist);
	}
	
	@DeleteMapping("/rest/Song_Artist/{id}")
	public ResponseEntity<Song_Artist> delete(@PathVariable("id") Integer id){
		if(!dao.existsById(id)) {
			return ResponseEntity.notFound().build();
		}
		dao.deleteById(id);
		return ResponseEntity.ok().build();
	}

	
}
