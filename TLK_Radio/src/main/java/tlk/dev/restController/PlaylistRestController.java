package tlk.dev.restController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

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
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import tlk.dev.dao.FavoriteDao;
import tlk.dev.dao.PlaylistDao;
import tlk.dev.dao.SongDao;
import tlk.dev.entity.Favorite;
import tlk.dev.entity.Playlist;
import tlk.dev.entity.Song;

@CrossOrigin("*")
@RestController
public class PlaylistRestController {
	@Autowired
	PlaylistDao dao;

	@GetMapping("/rest/Playlist")
	public ResponseEntity<List<Playlist>> getAll(Model model) {
		return ResponseEntity.ok(dao.findAll());
	}

	@GetMapping("/rest/PlaylistPublic")
	public ResponseEntity<List<Playlist>> getAllPublic(Model model) {
		return ResponseEntity.ok(dao.getPlaylistPublic());
	}

	@GetMapping("/rest/Playlist/FindById/{id}")
	public ResponseEntity<Playlist> getByID(@PathVariable("id") int id) {
		return ResponseEntity.ok(dao.findById(id).get());
	}

	@GetMapping("/rest/Playlist/FindByName/{name}")
	public ResponseEntity<List<Playlist>> getByName(@PathVariable("name") String name) {

		return ResponseEntity.ok(dao.findByPlaylistName(name));
	}

	@GetMapping("/rest/Playlist/FindByUsername/{name}")
	public ResponseEntity<List<Playlist>> getByUsername(@PathVariable("name") String name) {

		return ResponseEntity.ok(dao.findWithUserName(name));
	}

	@PostMapping("/rest/Playlist")
	public ResponseEntity<String> post(@RequestBody Playlist playlist) {
		dao.save(playlist);
		return ResponseEntity.ok("Favorite added successfully.");
	}

	@PutMapping("/rest/Playlist/{id}")
	public ResponseEntity<Playlist> put(@PathVariable("id") Integer id, @RequestBody Playlist playlist) {
		if (!dao.existsById(playlist.getID())) {
			return ResponseEntity.notFound().build();
		}

		dao.save(playlist);
		return ResponseEntity.ok(playlist);
	}

	@PutMapping("/rest/Playlist/image/{id}")
	public ResponseEntity<Playlist> UpdateImage(
			@PathVariable("id") Integer id,
			@RequestPart("playlist") Playlist playlist,
			@RequestPart(value = "image", required = false) MultipartFile imageFile) {

		if (!dao.existsById(playlist.getID())) {
			return ResponseEntity.notFound().build();
		}
		if (imageFile != null && !imageFile.isEmpty()) {
			try {
				String imageFileName = saveFile(imageFile, "src/main/resources/static/asset/images/playlist");
				playlist.setImage(imageFileName);
			} catch (IOException e) {
				e.printStackTrace();
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
			}
		}
		Playlist updatedPlaylist = dao.save(playlist);
		return ResponseEntity.ok(updatedPlaylist);
	}

	@DeleteMapping("/rest/Playlist/{id}")
	public ResponseEntity<Playlist> delete(@PathVariable("id") Integer id) {
		Playlist pl = dao.getById(id); 
		if (pl == null) {
			return ResponseEntity.notFound().build();
		}
		pl.setDeleted(false);
		dao.save(pl);
		return ResponseEntity.ok().build();
	}

	private String saveFile(MultipartFile file, String folder) throws IOException {
		String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
		String filePath = folder + "/" + fileName;
		Files.createDirectories(Paths.get(folder)); // Create the directory if it doesn't exist
		Files.write(Paths.get(filePath), file.getBytes()); // Save the file to the directory
		return fileName; // Return only the file name
	}
}
