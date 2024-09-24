package tlk.dev.restController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.Principal;
import java.util.Collections;
import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import tlk.dev.dao.AdvertiseDao;

import tlk.dev.entity.Advertise;
import tlk.dev.entity.Album;
import tlk.dev.entity.Artist;
import tlk.dev.entity.Song;

@CrossOrigin("*")
@RestController
public class AdvertiseRestController {
	@Autowired
	AdvertiseDao dao;

	@GetMapping("/rest/Advertise")
	public ResponseEntity<List<Advertise>> getAll(Model model) {
		return ResponseEntity.ok(dao.findAllNoneDeleted());
	}

	@GetMapping("/rest/Advertise/admin")
	public ResponseEntity<Page<Advertise>> getAllPage(@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "5") int size,
			@RequestParam(defaultValue = "") String search) {
		Pageable pageable = PageRequest.of(page, size);
		Page<Advertise> result;
		if (search.isEmpty()) {
			result = dao.findAllActive(pageable);
		} else {
			result = dao.findByAdvertisePage(search, pageable);
		}
		return ResponseEntity.ok(result);
	}

	@PostMapping("/rest/Advertise")
	public ResponseEntity<Advertise> post(
			@RequestParam("name") String name,
			@RequestPart("mp3") MultipartFile mp3,
			@RequestParam("description") String description,
			@RequestPart(value = "image", required = false) MultipartFile image,
			Principal principal) {

		Advertise ad = new Advertise();
		ad.setName(name);
		ad.setDescription(description);
		ad.setDeleted(false);

		if (image != null && !image.isEmpty()) {
			try {
				String imageFileName = saveFile(image, "src/main/resources/static/asset/images/ad");
				ad.setImage(imageFileName);
			} catch (IOException e) {
				e.printStackTrace();
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
			}
		}
		String mp3FileName;
		try {
			mp3FileName = saveFile(mp3, "mp3");

			ad.setMp3(mp3FileName);
		} catch (IOException e) {
			e.printStackTrace();
		}

		ad.setCreateDate(new Date());
		ad.setCreateUser(principal.getName());
		dao.save(ad);
		return ResponseEntity.ok(ad);
	}

	@PutMapping("/rest/Advertise/{id}")
	public ResponseEntity<Advertise> put(@PathVariable("id") Integer id, @RequestBody Advertise song, Principal principal) {
		if (!dao.existsById(song.getID())) {
			return ResponseEntity.notFound().build();
		}
		song.setUpdateDate(new Date());
		song.setUpdateUser(principal.getName());
		dao.save(song);
		return ResponseEntity.ok(song);
	}

	@GetMapping("/rest/Advertise/admin/{id}")
	public ResponseEntity<Advertise> getOne(@PathVariable("id") Integer id) {
		if (!dao.existsById(id)) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(dao.findById(id).get());
	}

	@PutMapping("/rest/Advertise/admin/{id}")
	public ResponseEntity<?> updateAdvertise(@PathVariable("id") Integer id,
			@RequestParam("name") String name,
			@RequestParam(value = "mp3", required = false) MultipartFile mp3,
			@RequestParam("description") String description,
			@RequestParam("deleted") boolean deleted, // Add this parameter
			@RequestPart(value = "image", required = false) MultipartFile image,
			Principal principal) throws IOException {
		if (!dao.existsById(id)) {
			return ResponseEntity.notFound().build();
		}

		Advertise ad = dao.findById(id).orElseThrow(() -> new RuntimeException("Advertise not found"));
		ad.setName(name);
		ad.setDescription(description);
		ad.setDeleted(deleted); // Set the deleted status

		if (image != null && !image.isEmpty()) {
			try {
				String imageFileName = saveFile(image, "src/main/resources/static/asset/images/ad");
				ad.setImage(imageFileName);
			} catch (IOException e) {
				e.printStackTrace();
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
			}
		}

		if (mp3 != null && !mp3.isEmpty()) {
			String mp3FileName = saveFile(mp3, "mp3");
			ad.setMp3(mp3FileName);
		} else {
			System.out.println("No MP3 file provided");
		}
		ad.setUpdateDate(new Date());
		ad.setUpdateUser(principal.getName());
		dao.save(ad);
		return ResponseEntity.ok(ad);
	}

	@DeleteMapping("/rest/Advertise/{id}")
	public ResponseEntity<Advertise> delete(@PathVariable("id") Integer id) {
		if (!dao.existsById(id)) {
			return ResponseEntity.notFound().build();
		}
		dao.deleteById(id);
		return ResponseEntity.ok().build();
	}

	private String saveFile(MultipartFile file, String folder) throws IOException {
		String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
		String filePath = folder + "/" + fileName;
		Files.createDirectories(Paths.get(folder));
		Files.write(Paths.get(filePath), file.getBytes());
		return fileName; // Trả về chỉ tên file
	}

	@GetMapping("/rest/Advertise/checkNameExists")
	public ResponseEntity<?> checkTopicNameExists(@RequestParam String name) {
		boolean exists = dao.existsByName(name);
		return ResponseEntity.ok(Collections.singletonMap("exists", exists));
	}

	@GetMapping("/rest/Advertise/checkNameExistsForUpdate")
	public ResponseEntity<?> checkNameExistsForUpdate(@RequestParam String name, @RequestParam int id) {
		boolean exists = dao.existsByNameAndIdNot(name, id);
		return ResponseEntity.ok(Collections.singletonMap("exists", exists));
	}
}
