package tlk.dev.restController;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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

import tlk.dev.dao.FavoriteDao;
import tlk.dev.dao.RecentSongDao;
import tlk.dev.dao.SongDao;
import tlk.dev.entity.Favorite;
import tlk.dev.entity.RecentSong;
import tlk.dev.entity.Song;





@CrossOrigin("*")
@RestController
public class RecentSongRestController {
	@Autowired
	RecentSongDao dao;
	
	@GetMapping("/rest/Recent")
	public ResponseEntity<List<RecentSong>> getAll(Model model){
		return ResponseEntity.ok(dao.findAll());
	}
	
	@GetMapping("/rest/Recent/GetByAccount/{username}")
	public ResponseEntity<List<RecentSong>> getByAccount(Model model, @PathVariable("username") String useString){
		return ResponseEntity.ok(dao.findByAccount(useString));
	}
	
	@PostMapping("/rest/Recent")
	public ResponseEntity<String> post(@RequestBody RecentSong recent) {
		// Nếu không tồn tại, lưu mục yêu thích mới và trả về thông tin
		dao.save(recent);
		return ResponseEntity.ok("Recent added successfully.");
		
	}

	@PutMapping("/rest/Recent/{id}")
	public ResponseEntity<RecentSong> put(@PathVariable("id") Integer id, @RequestBody RecentSong favorite){
		if(!dao.existsById(favorite.getID())) {
			return ResponseEntity.notFound().build();
		}
		dao.save(favorite);
		return ResponseEntity.ok(favorite);
	}
	
	@DeleteMapping("/rest/Recent/{id}")
	public ResponseEntity<Favorite> delete(@PathVariable("id") Integer id){
		if(!dao.existsById(id)) {
			return ResponseEntity.notFound().build();
		}
		dao.deleteById(id);
		return ResponseEntity.ok().build();
	}
}
