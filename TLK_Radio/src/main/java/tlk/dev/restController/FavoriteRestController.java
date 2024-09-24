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
import tlk.dev.dao.SongDao;
import tlk.dev.entity.Favorite;
import tlk.dev.entity.Song;





@CrossOrigin("*")
@RestController
public class FavoriteRestController {
	@Autowired
	FavoriteDao dao;
	
	@GetMapping("/rest/Favorite")
	public ResponseEntity<List<Favorite>> getAll(Model model){
		return ResponseEntity.ok(dao.findAll());
	}

	@GetMapping("/rest/Favorite/GetByAccount/{username}")
	public ResponseEntity<List<Favorite>> getByAccount(Model model, @PathVariable("username") String useString){
		return ResponseEntity.ok(dao.findByAccount(useString));
	}
	
	
	// @GetMapping("/rest/Favorite/FindByName/{name}")
	// public ResponseEntity<List<Song>> getByID(@PathVariable("name") String name){
	
	// 	return ResponseEntity.ok(dao.findBySongName(name));
	// }

	// @GetMapping("/rest/Song/FindBySongId/{name}")
	// public ResponseEntity<List<Song>> getByAlbumId(@PathVariable("albumid") int albumid){
	
	// 	return ResponseEntity.ok(dao.findByAlbumId(albumid));
	// }

	// @GetMapping("/rest/Song/{id}")
	// public ResponseEntity<Song> getOne(@PathVariable("id") Integer id){
	// 	if(!dao.existsById(id)) {
	// 		return ResponseEntity.notFound().build();
	// 	}
	// 	return ResponseEntity.ok(dao.findById(id).get());
	// }
	
	@PostMapping("/rest/Favorite")
		public ResponseEntity<String> post(@RequestBody Favorite favorite) {
			Favorite existingFavorite = dao.findByAccountAndSong(
				favorite.getAccount().getUsername(), favorite.getSong().getID()
			);
			
			if (existingFavorite != null) {
				// Nếu tồn tại, trả về thông báo đã tồn tại
				return ResponseEntity.status(HttpStatus.CONFLICT).body("Favorite already exists.");
			} else {
				// Nếu không tồn tại, lưu mục yêu thích mới và trả về thông tin
				dao.save(favorite);
				return ResponseEntity.ok("Favorite added successfully.");
			}
		}

	@PutMapping("/rest/Favorite/{id}")
	public ResponseEntity<Favorite> put(@PathVariable("id") Integer id, @RequestBody Favorite favorite){
		if(!dao.existsById(favorite.getID())) {
			return ResponseEntity.notFound().build();
		}
		dao.save(favorite);
		return ResponseEntity.ok(favorite);
	}
	
	@DeleteMapping("/rest/Favorite/{id}")
	public ResponseEntity<Favorite> delete(@PathVariable("id") Integer id){
		if(!dao.existsById(id)) {
			return ResponseEntity.notFound().build();
		}
		dao.deleteById(id);
		return ResponseEntity.ok().build();
	}
}
