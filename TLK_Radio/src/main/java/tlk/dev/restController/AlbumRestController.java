package tlk.dev.restController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.Principal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Optional;

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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import tlk.dev.dao.AlbumDao;
import tlk.dev.dao.ArtistDao;
import tlk.dev.dao.SongDao;
import tlk.dev.entity.Account;
import tlk.dev.entity.Album;
import tlk.dev.entity.Artist;
import tlk.dev.entity.Song;

@CrossOrigin("*")
@RestController
public class AlbumRestController {
    @Autowired
    AlbumDao dao;
    @Autowired
    private ArtistDao artistdao;

    @GetMapping("/rest/Album")
    public ResponseEntity<List<Album>> getAll(Model model) {
        return ResponseEntity.ok(dao.findAllNoneDeleted());
    }

    @GetMapping("/rest/Album/StageName/{name}")
    public ResponseEntity<List<Album>> getAll(@PathVariable("name") String name) {
        return ResponseEntity.ok(dao.findAlbumBySatgeName(name));
    }

    @GetMapping("/rest/Album/admin")
    public ResponseEntity<Page<Album>> getAll(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "") String search) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Album> result;
        if (search.isEmpty()) {
            result = dao.findAllActive(pageable);
        } else {
            result = dao.findByAlbumPage(search, pageable);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/rest/Album/admin/khoiphuc")
    public ResponseEntity<Page<Album>> getAllFalse(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "") String search) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Album> result;
        if (search.isEmpty()) {
            result = dao.findAllActiveFalse(pageable);
        } else {
            result = dao.findByAlbumPageFalse(search, pageable);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/rest/Album/FindByName/{name}")
    public ResponseEntity<List<Album>> getByID(@PathVariable("name") String name) {

        return ResponseEntity.ok(dao.findByAlbumName(name));
    }

    @GetMapping("/rest/Album/FindByNameExactly/{name}")
    public ResponseEntity<Album> getByNameExactly(@PathVariable("name") String name) {

        return ResponseEntity.ok(dao.findByAlbumNameExactly(name));
    }

    @GetMapping("/rest/Album/admin/{id}")
    public ResponseEntity<Album> getAlbumById(@PathVariable Integer id) {
        System.out.println("Request received for albumId: " + id); // Log albumId being requested
        Optional<Album> album = dao.findById(id);
        if (album.isPresent()) {
            return ResponseEntity.ok(album.get());
        } else {
            System.out.println("Album not found for albumId: " + id); // Log when album is not found
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/rest/Album/{id}")
    public ResponseEntity<Album> getOne(@PathVariable("id") Integer id) {
        if (!dao.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(dao.findById(id).get());
    }

    @PostMapping("/rest/Album")
    public ResponseEntity<Album> post(
            @RequestParam("name") String name,
            @RequestParam("dateReleast") @DateTimeFormat(pattern = "yyyy-MM-dd") Date dateReleast,
            @RequestParam("description") String description,
            @RequestPart("image") MultipartFile imageFile,
            @RequestPart(value = "artist", required = false) String artistStageName,
            Principal principal) {
        Album album = new Album();
        album.setName(name);
        album.setDateReleast(dateReleast);
        album.setDescription(description);
        album.setCreateDate(new Date());
        album.setDeleted(true);
        // Lưu tệp ảnh vào đâu đó và thiết lập đường dẫn
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                String imageFileName = saveFile(imageFile, "src/main/resources/static/asset/images/album");
                album.setImage(imageFileName);
            } catch (IOException e) {
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }
        }

        // Tùy chọn: Thiết lập nghệ sĩ nếu được cung cấp
        if (artistStageName != null) {
            Artist artist = artistdao.findByStageName2(artistStageName);
            album.setArtist(artist);
        }
        album.setCreateDate(new Date());
        album.setCreateUser(principal.getName());
        dao.save(album);
        return ResponseEntity.ok(album);
    }

    @PutMapping("/rest/Album/{id}")
    public ResponseEntity<Album> updateAlbum(
            @PathVariable("id") Integer id,
            @RequestParam("name") String name,
            @RequestParam("dateReleast") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date dateReleast,
            @RequestParam("description") String description,
            @RequestParam("artist") String artistStageName,
            @RequestPart(value = "image", required = false) MultipartFile imageFile,
            Principal principal) {

        if (!dao.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        Album existingAlbum = dao.findById(id).orElse(null);
        if (existingAlbum == null) {
            return ResponseEntity.notFound().build();
        }

        // Update the album details
        existingAlbum.setName(name);
        existingAlbum.setDateReleast(dateReleast);
        existingAlbum.setDescription(description);
        Artist artist = artistdao.findByStageName(artistStageName).orElse(null);
        existingAlbum.setArtist(artist); // Assuming Album has a relationship with Artist

        // Handle the image upload
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                String imageFileName = saveFile(imageFile, "src/main/resources/static/asset/images/album");
                existingAlbum.setImage(imageFileName);
            } catch (IOException e) {
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }
        }
        existingAlbum.setUpdateDate(new Date());
        existingAlbum.setUpdateUser(principal.getName());
        dao.save(existingAlbum);
        return ResponseEntity.ok(existingAlbum);
    }

    @DeleteMapping("/rest/Album/{id}")
    public ResponseEntity<Album> delete(@PathVariable("id") Integer id) {
        if (!dao.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        dao.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/rest/Album/{id}/delete")
    public ResponseEntity<Album> softDelete(@PathVariable("id") int id, Principal principal) {
        if (!dao.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        Album art = dao.findById(id).get();
        art.setDeleted(false);
        art.setUpdateDate(new Date());
        art.setUpdateUser(principal.getName());
        dao.save(art);

        return ResponseEntity.ok(art);
    }

    @PutMapping("/rest/Album/{id}/khoiphuc")
    public ResponseEntity<Album> softDeleteFalse(@PathVariable("id") int id, Principal principal) {
        if (!dao.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        Album art = dao.findById(id).get();
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

    @GetMapping("/rest/Album/exists")
    public ResponseEntity<?> albumExists(@RequestParam String name) {
        boolean exists = dao.existsByName(name);
        return ResponseEntity.ok(Collections.singletonMap("exists", exists));
    }

    @GetMapping("/rest/Album/checkNameExistsForUpdate")
    public ResponseEntity<?> checkNameExistsForUpdate(@RequestParam String name, @RequestParam int id) {
        boolean exists = dao.existsByNameAndIdNot(name, id);
        return ResponseEntity.ok(Collections.singletonMap("exists", exists));
    }

}
