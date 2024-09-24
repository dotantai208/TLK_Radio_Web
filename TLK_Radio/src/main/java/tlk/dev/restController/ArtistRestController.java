package tlk.dev.restController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.Principal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import tlk.dev.dao.ArtistDao;
import tlk.dev.dao.SongDao;
import tlk.dev.entity.Account;
import tlk.dev.entity.Artist;
import tlk.dev.entity.Song;
import java.util.Date;




@CrossOrigin("*")
@RestController
public class ArtistRestController {
	@Autowired
	ArtistDao dao;
	
	@GetMapping("/rest/Artist")
	public ResponseEntity<List<Artist>> getAll(Model model){
		return ResponseEntity.ok(dao.findAllNoneDeleted());
	}

    @GetMapping("/rest/Artist5New")
	public ResponseEntity<List<Artist>> get5New(Model model){
        List<Artist> top5Songs = dao.findArtistNew(PageRequest.of(0, 5));
		return ResponseEntity.ok(top5Songs);
	}

    @GetMapping("/rest/Artist6New")
	public ResponseEntity<List<Artist>> get8New(Model model){
        List<Artist> top8Songs = dao.findArtistNew(PageRequest.of(0, 6));
		return ResponseEntity.ok(top8Songs);
	}
	
	@GetMapping("/rest/Artist/admin")
    public ResponseEntity<Page<Artist>> getAll(@RequestParam(defaultValue = "0") int page,
                                                @RequestParam(defaultValue = "5") int size,
                                                @RequestParam(defaultValue = "") String search) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Artist> result;
        if (search.isEmpty()) {
            result = dao.findAllActive(pageable);
        } else {
            result = dao.findAllPage(search, pageable);
        }
        return ResponseEntity.ok(result);
    }
	@GetMapping("/rest/Artist/admin/khoiphuc")
    public ResponseEntity<Page<Artist>> getAllFalse(@RequestParam(defaultValue = "0") int page,
                                                @RequestParam(defaultValue = "5") int size,
                                                @RequestParam(defaultValue = "") String search) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Artist> result;
        if (search.isEmpty()) {
            result = dao.findAllActiveFalse(pageable);
        } else {
            result = dao.findAllPageFalse(search, pageable);
        }
        return ResponseEntity.ok(result);
    }
	@GetMapping("/rest/Artist/FindByName/{name}")
	public ResponseEntity<List<Artist>> getByID(@PathVariable("name") String name){
	
		return ResponseEntity.ok(dao.findByArtistName(name));
	}

	@GetMapping("/rest/Artist/{id}")
	public ResponseEntity<Artist> getOne(@PathVariable("id") String id){
		if(!dao.existsById(id)) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(dao.findById(id).get());
	}

	@PostMapping("/rest/Artist")
    public ResponseEntity<Artist> post(
        @RequestParam("realName") String realName,
        @RequestParam("stageName") String stageName,
        @RequestParam("dateOfBirth")  Date dateOfBirth,
        @RequestParam("story") String story,
        @RequestPart(value = "image", required = false) MultipartFile image,
        Principal principal) {

        // Check if the artist already exists; if it does, return a bad request
        if (dao.existsById(stageName)) {
            return ResponseEntity.badRequest().build();
        }

        Artist artist = new Artist();
        artist.setRealName(realName);
        artist.setStageName(stageName);
        artist.setDateOfBirth(dateOfBirth);
        artist.setStory(story);
        artist.setDeleted(true);
        // Handle file upload
        if (image != null && !image.isEmpty()) {
            try {
                String imageFileName = saveFile(image, "src/main/resources/static/asset/images/artist");
                artist.setImage(imageFileName);
            } catch (IOException e) {
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }
        }

        artist.setCreateDate(new Date());
        artist.setCreateUser(principal.getName());
        dao.save(artist);
        return ResponseEntity.ok(artist);
    }


	@PutMapping("/rest/Artist/admin/{stageName}")
    public ResponseEntity<?> updateArtist(
            @PathVariable("stageName") String stageName,
            @RequestParam("realName") String realName,
            @RequestParam("dateOfBirth") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date dateOfBirth,
            @RequestParam("story") String story,
            @RequestPart(value = "image", required = false) MultipartFile  imageFile,
            Principal principal) {

        // Check if artist exists
        if (!dao.existsById(stageName)) {
            return ResponseEntity.notFound().build();
        }

        // Retrieve the existing artist and update details
        Artist existingArtist = dao.findByStageName(stageName).orElse(null);
        if (existingArtist != null) {
            existingArtist.setRealName(realName);
            existingArtist.setDateOfBirth(dateOfBirth);
            existingArtist.setStory(story);

            // Handle image file if present
            if (imageFile != null && !imageFile.isEmpty()) {
                try {
                    String imageFileName = saveFile(imageFile, "src/main/resources/static/asset/images/artist");
                    existingArtist.setImage(imageFileName);
                } catch (IOException e) {
                    e.printStackTrace();
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
                }
            }

            // Save updated artist details
            existingArtist.setUpdateDate(new Date());
            existingArtist.setUpdateUser(principal.getName());
            dao.save(existingArtist);
            return ResponseEntity.ok(existingArtist);
        }

        return ResponseEntity.notFound().build();
    }

	
	@DeleteMapping("/rest/Artist/{id}")
	public ResponseEntity<Song> delete(@PathVariable("id") String stagename){
		if(!dao.existsById(stagename)) {
			return ResponseEntity.notFound().build();
		}
		dao.deleteById(stagename);
		return ResponseEntity.ok().build();
	}

    @PutMapping("/rest/Artist/{stageName}/delete")
    public ResponseEntity<Artist> softDelete(@PathVariable("stageName") String stagename, Principal principal) {
        if (!dao.existsById(stagename)) {
            return ResponseEntity.notFound().build();
        }
        Artist art = dao.findByStageName(stagename).get();
        art.setDeleted(false); 
        art.setUpdateDate(new Date());
        art.setUpdateUser(principal.getName());
        dao.save(art);
        return ResponseEntity.ok(art);
    }
    @PutMapping("/rest/Artist/{stageName}/khoiphuc")
    public ResponseEntity<Artist> softDeleteFalse(@PathVariable("stageName") String stagename, Principal principal) {
        if (!dao.existsById(stagename)) {
            return ResponseEntity.notFound().build();
        }
        Artist art = dao.findByStageName(stagename).get();
        art.setDeleted(true); 
        art.setUpdateDate(new Date());
        art.setUpdateUser(principal.getName());
        dao.save(art);
        return ResponseEntity.ok(art);
    }
    private String saveFile(MultipartFile file, String folder) throws IOException {
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        String filePath = folder + "/" + fileName;
        Files.createDirectories(Paths.get(folder)); // Create the directory if it doesn't exist
        Files.write(Paths.get(filePath), file.getBytes()); // Save the file to the directory
        return fileName; // Return only the file name
    }
}
