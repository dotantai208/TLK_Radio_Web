package tlk.dev.restController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.Principal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
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

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import tlk.dev.dao.AlbumDao;
import tlk.dev.dao.ArtistDao;
import tlk.dev.dao.RecentSongDao;
import tlk.dev.dao.SongDao;
import tlk.dev.dao.Song_ArtistDao;
import tlk.dev.dao.Song_TopicDao;
import tlk.dev.dao.TopicDao;
import tlk.dev.entity.Album;
import tlk.dev.entity.Artist;
import tlk.dev.entity.RecentSong;
import tlk.dev.entity.Song;
import tlk.dev.entity.Song_Artist;
import tlk.dev.entity.Song_Topic;
import tlk.dev.entity.Topic;

import org.springframework.data.domain.Page;

import org.springframework.data.domain.Pageable;

@CrossOrigin("*")
@RestController
public class SongRestController {
    @Autowired
    SongDao dao;

    @Autowired
    AlbumDao aldao;

    @Autowired
    Song_ArtistDao songArtistDao;

    @Autowired
    Song_TopicDao songTopicDao;

    @Autowired
    ArtistDao artistDao;

    @Autowired
    TopicDao topicDao;

    @Autowired
    RecentSongDao recentDao;

    @PostMapping("rest/Song/admin")
    public ResponseEntity<Song> post(
            @RequestPart("song") Song song,
            @RequestPart("image") MultipartFile image,
            @RequestPart("mp3") MultipartFile mp3,
            @RequestParam(required = false) Integer selectedAlbumId,
            Principal principal) throws IOException {

        // Save image file
        String imageFileName = saveFile(image, "src/main/resources/static/asset/images/song");
        song.setImage(imageFileName);

        // Save MP3 file
        String mp3FileName = saveFile(mp3, "mp3");
        song.setMp3(mp3FileName);
        System.out.println("Received Album ID: " + selectedAlbumId);

        if (selectedAlbumId != null && selectedAlbumId > 0) {
            Album album = aldao.findById(selectedAlbumId).orElse(null);
            if (album != null) {
                song.setAlbum(album);
            } else {
                // Album không tìm thấy
                return ResponseEntity.badRequest().body(null); // Hoặc xử lý lỗi phù hợp
            }
        } else {
            song.setAlbum(null);
            System.out.println("No album associated with ID: " + selectedAlbumId);
        }

        song.setCreateDate(new Date());
        song.setCreateUser(principal.getName());
        song.setDeleted(true);
        song = dao.save(song);

        return ResponseEntity.ok(song);
    }

    @PutMapping("/rest/Song/admin/{id}")
    public ResponseEntity<?> update(
            @PathVariable("id") Integer id,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "selectedAlbumId", required = false) Integer selectedAlbumId,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestPart(value = "mp3", required = false) MultipartFile mp3,
            @RequestParam(value = "topics", required = false) String topicIdsJson,
            @RequestParam(value = "artists", required = false) String artistStageNamesJson,
            Principal principal) {

        try {
            // Check if the song exists
            if (!dao.existsById(id)) {
                return ResponseEntity.notFound().build();
            }

            Song existingSong = dao.findById(id).get();

            // Update fields
            if (name != null) {
                existingSong.setName(name);
            }
            if (image != null) {
                String imageFileName = saveFile(image, "src/main/resources/static/asset/images/song");
                existingSong.setImage(imageFileName);
            }
            if (mp3 != null) {
                String mp3FileName = saveFile(mp3, "mp3");
                existingSong.setMp3(mp3FileName);
            }

            if (selectedAlbumId != null && selectedAlbumId > 0) {
                Album album = aldao.findById(selectedAlbumId).orElse(null);
                existingSong.setAlbum(album);
            } else {
                existingSong.setAlbum(null);
            }

            existingSong.setUpdateDate(new Date());
            existingSong.setUpdateUser(principal.getName());
            dao.save(existingSong);

            // Update Song_Topic relationships
            if (topicIdsJson != null) {
                List<Integer> topicIds = new ObjectMapper().readValue(topicIdsJson, new TypeReference<List<Integer>>() {
                });
                songTopicDao.deleteBySongId(id);
                for (Integer topicId : topicIds) {
                    Topic topic = topicDao.findById(topicId).orElse(null);
                    if (topic != null) {
                        Song_Topic songTopic = new Song_Topic();
                        songTopic.setSong(existingSong);
                        songTopic.setTopic(topic);
                        songTopicDao.save(songTopic);
                    }
                }
            }

            // Update Song_Artist relationships
            if (artistStageNamesJson != null) {
                List<String> artistStageNames = new ObjectMapper().readValue(artistStageNamesJson,
                        new TypeReference<List<String>>() {
                        });
                songArtistDao.deleteBySongId(id);
                for (String stageName : artistStageNames) {
                    Artist artist = artistDao.findByStageName(stageName).orElse(null);
                    if (artist != null) {
                        Song_Artist songArtist = new Song_Artist();
                        songArtist.setSong(existingSong);
                        songArtist.setArtist(artist);
                        songArtistDao.save(songArtist);
                    }
                }
            }

            return ResponseEntity.ok(existingSong);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error parsing request data");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error updating song");
        }
    }

    private String saveFile(MultipartFile file, String folder) throws IOException {
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        String filePath = folder + "/" + fileName;
        Files.createDirectories(Paths.get(folder));
        Files.write(Paths.get(filePath), file.getBytes());
        return fileName; // Trả về chỉ tên file
    }

    @GetMapping("/rest/Song")
    public ResponseEntity<List<Song>> getAll(Model model) {
        return ResponseEntity.ok(dao.findAllNoneDeleted());
    }

    @GetMapping("/rest/Song5New")
    public ResponseEntity<List<Song>> get5New(Model model) {
        List<Song> top5Songs = dao.findSongNew(PageRequest.of(0, 5));
        return ResponseEntity.ok(top5Songs);
    }

    @GetMapping("/rest/Song4New")
    public ResponseEntity<List<Song>> get4New(Model model) {
        List<Song> top5Songs = dao.findSongNew(PageRequest.of(0, 4));
        return ResponseEntity.ok(top5Songs);
    }

    @GetMapping("/rest/Song/admin")
    public ResponseEntity<Page<Song>> getAll(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "") String search) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Song> result;
        if (search.isEmpty()) {
            result = dao.findAllActive(pageable);
        } else {
            result = dao.findByNameOrArtistOrAlbumOrTopicContainingIgnoreCase(search, pageable);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/rest/Song/albumId/{songId}")
    public ResponseEntity<?> getAlbumIdBySongId(@PathVariable Integer songId) {
        try {
            Integer albumId = dao.findAlbumIdBySongId(songId);
            if (albumId != null) {
                return ResponseEntity.ok(albumId);
            } else {
                return ResponseEntity.ok(null);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching albumId: " + e.getMessage());
        }
    }

    @GetMapping("/rest/album/{albumId}")
    public ResponseEntity<Album> getAlbumDetails(@PathVariable Integer albumId) {
        Album album = aldao.findById(albumId).orElse(null);
        if (album != null) {
            return ResponseEntity.ok(album);
        } else {
            return ResponseEntity.ok(null); // Trả về null nếu không tìm thấy album
        }
    }

    @PutMapping("/rest/song/{id}/delete")
    public ResponseEntity<Song> softDelete(@PathVariable("id") int id, Principal principal) {
        if (!dao.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        Song song = dao.findById(id).get();
        song.setUpdateDate(new Date());
        song.setUpdateUser(principal.getName());
        song.setDeleted(false); // Set the Deleted flag to true
        dao.save(song);
        return ResponseEntity.ok(song);
    }

    @GetMapping("/rest/Song/FindByName/{name}")
    public ResponseEntity<List<Song>> getByID(@PathVariable("name") String name) {

        return ResponseEntity.ok(dao.findBySongName(name));
    }

    @GetMapping("/rest/Song/FindByAlbumId/{name}")
    public ResponseEntity<List<Song>> getByAlbumId(@PathVariable("albumid") int albumid) {

        return ResponseEntity.ok(dao.findByAlbumId(albumid));
    }

    @GetMapping("/rest/Song/{id}")
    public ResponseEntity<Song> getSong(@PathVariable Integer id) {
        Song song = dao.findById(id).orElse(null);
        if (song == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(song);
    }

    @GetMapping("/rest/SongWithAlbum/{id}")
    public ResponseEntity<Map<String, Object>> getSongWithAlbum(@PathVariable Integer id) {
        Song song = dao.findById(id).orElse(null);
        if (song == null) {
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("song", song);
        response.put("album", song.getAlbum());

        return ResponseEntity.ok(response);
    }

    @PutMapping("/rest/Song/{id}")
    public ResponseEntity<Song> put(@PathVariable("id") Integer id, @RequestBody Song song, Principal principal) {
        if (!dao.existsById(song.getID())) {
            return ResponseEntity.notFound().build();
        }
        song.setUpdateDate(new Date());
        song.setUpdateUser(principal.getName());
        dao.save(song);
        return ResponseEntity.ok(song);
    }

    @DeleteMapping("/rest/Song/{id}")
    public ResponseEntity<Song> delete(@PathVariable("id") Integer id) {
        if (!dao.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        dao.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/rest/Song/UpdateAlbum/{id}")
    public ResponseEntity<Song> updateAlbum(@PathVariable("id") Integer id, @RequestParam Integer albumId,
            Principal principal) {
        if (!dao.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        Song song = dao.findById(id).get();
        if (albumId != null && albumId > 0) {
            Album album = aldao.findById(albumId).orElse(null);
            song.setAlbum(album);
        } else {
            song.setAlbum(null);
        }
        song.setUpdateDate(new Date());
        song.setUpdateUser(principal.getName());
        dao.save(song);
        return ResponseEntity.ok(song);
    }

    @GetMapping("/rest/Song/check-name")
    public ResponseEntity<?> checkName(@RequestParam String name) {
        boolean exists = dao.existsByName(name);
        return ResponseEntity.ok(Collections.singletonMap("exists", exists));
    }

    @GetMapping("/rest/Song/checkNameExistsForUpdate")
    public ResponseEntity<?> checkNameExistsForUpdate(@RequestParam String name, @RequestParam int id) {
        boolean exists = dao.existsByNameAndIdNot(name, id);
        return ResponseEntity.ok(Collections.singletonMap("exists", exists));
    }

    @GetMapping("/rest/Song/admin/khoiphuc")
    public ResponseEntity<Page<Song>> getAllFalse(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "") String search) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Song> result;
        if (search.isEmpty()) {
            result = dao.findAllActiveFalse(pageable);
        } else {
            result = dao.findByNameOrArtistOrAlbumOrTopicContainingDeleteFalse(search, pageable);
        }
        return ResponseEntity.ok(result);
    }

    @PutMapping("/rest/song/{id}/khoiphuc")
    public ResponseEntity<Song> softDeleteFalse(@PathVariable("id") int id, Principal principal) {
        if (!dao.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        Song song = dao.findById(id).get();
        song.setDeleted(true); // Set the Deleted flag to true
        song.setUpdateDate(new Date());
        song.setUpdateUser(principal.getName());
        dao.save(song);
        return ResponseEntity.ok(song);
    }

    @GetMapping("/rest/Song/Album/{songid}")
    public ResponseEntity<Album> getAlbumBySongid(@PathVariable("songid") Integer id) {
        return ResponseEntity.ok(dao.findAlbumBySongId(id));
    }

    @PutMapping("/rest/Song/UpdateCouview/{id}")
    public ResponseEntity<Song> updateCountView(@PathVariable("id") int id) {
        if (!dao.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        Song song = dao.findById(id).get();
        song.setCountView(song.getCountView() + 1); // Set the Deleted flag to true
        dao.save(song);
        return ResponseEntity.ok(song);
    }

    @GetMapping("rest/Song/NextSongWithTopic/{songid}")
    public ResponseEntity<Song> getNextSongWithTopic(
            @PathVariable("songid") Integer songId,
            @RequestParam(value = "excludedIds", defaultValue = "") List<Integer> excludedSongIds) {

        // Nếu không có danh sách ID bị loại trừ thì khởi tạo danh sách rỗng
        if (excludedSongIds == null) {
            excludedSongIds = new ArrayList<>();
        }

        // Lấy danh sách bài hát lọc theo cùng chủ đề và không nằm trong danh sách bị
        // loại trừ
        List<Song> randomSongs = dao.findFilteredRandomSongWithSameTopic(songId, excludedSongIds);

        // Kiểm tra danh sách bài hát không rỗng
        if (randomSongs != null && !randomSongs.isEmpty()) {
            // Chọn một bài hát ngẫu nhiên từ danh sách
            Random random = new Random();
            Song randomSong = randomSongs.get(random.nextInt(randomSongs.size()));

            return ResponseEntity.ok(randomSong);
        } else {
            // Chọn một bài hát ngẫu nhiên từ danh sách
            List<Song> randomSongs2 = dao.findAllDeletedSongsExcludingIds(excludedSongIds);

            // Kiểm tra danh sách bài hát không rỗng
            if (randomSongs2 != null && !randomSongs2.isEmpty()) {
                // Chọn một bài hát ngẫu nhiên từ danh sách
                Random random = new Random();
                Song randomSong = randomSongs2.get(random.nextInt(randomSongs2.size()));

                return ResponseEntity.ok(randomSong);
            } else {
                return ResponseEntity.notFound().build();
            }
        }
    }

    @GetMapping("rest/Song/NextSongNoData")
    public ResponseEntity<Song> getNextSongNoData() {
        // Lấy danh sách bài hát lọc theo cùng chủ đề và không nằm trong danh sách bị
        // loại trừ
        List<Song> randomSongs = dao.findAllNoneDeleted();

        // Kiểm tra danh sách bài hát không rỗng
        if (randomSongs != null && !randomSongs.isEmpty()) {
            // Chọn một bài hát ngẫu nhiên từ danh sách
            Random random = new Random();
            Song randomSong = randomSongs.get(random.nextInt(randomSongs.size()));

            return ResponseEntity.ok(randomSong);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("rest/Song/suggest")
    public ResponseEntity<Song> suggestSong(Principal principal,
            @RequestParam(value = "excludedIds", defaultValue = "") List<Integer> excludedSongIds) {
        // Step 1: Get the 10 most recent songs for the user
        Pageable pageable = PageRequest.of(0, 10);
        List<RecentSong> recentSongs = recentDao.findTop10ByAccount(principal.getName(), pageable);
        if (excludedSongIds == null) {
            excludedSongIds = new ArrayList<>();
        }

        if (recentSongs.isEmpty()) {
            List<Song> randomSongs = dao.findAllNoneDeleted();

            // Kiểm tra danh sách bài hát không rỗng
            if (randomSongs != null && !randomSongs.isEmpty()) {
                // Chọn một bài hát ngẫu nhiên từ danh sách
                Random random = new Random();
                Song randomSong = randomSongs.get(random.nextInt(randomSongs.size()));

                return ResponseEntity.ok(randomSong);
            } else {
                return ResponseEntity.notFound().build();
            }
        } else if (recentSongs.size() < 5) {
            List<Song> randomSongs = dao.findAllDeletedSongsExcludingIds(excludedSongIds);

            // Kiểm tra danh sách bài hát không rỗng
            if (randomSongs != null && !randomSongs.isEmpty()) {
                // Chọn một bài hát ngẫu nhiên từ danh sách
                Random random = new Random();
                Song randomSong = randomSongs.get(random.nextInt(randomSongs.size()));

                return ResponseEntity.ok(randomSong);
            } else {
                return ResponseEntity.notFound().build();
            }
        }

        // Step 2: Calculate the most frequent topic
        Map<Topic, Long> topicFrequency = recentSongs.stream()
                .map(rs -> rs.getSong().getSong_topic().get(0).getTopic()) // Assuming each song has at least one topic
                .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));

        Topic mostFrequentTopic = topicFrequency.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);

        if (mostFrequentTopic == null) {
            return ResponseEntity.noContent().build(); // No topic found
        }

        // Step 4: Find a random song with the same topic but not in the recent list
        List<Song> suggestedSongs = dao.findFilteredRandomSongWithSameTopicRecent(mostFrequentTopic.getID(),
                excludedSongIds);

        // Step 5: Return the suggested song
        if (suggestedSongs != null && !suggestedSongs.isEmpty()) {
            // Chọn một bài hát ngẫu nhiên từ danh sách
            Random random = new Random();
            Song randomSong = suggestedSongs.get(random.nextInt(suggestedSongs.size()));

            return ResponseEntity.ok(randomSong);
        } else {
            // Chọn một bài hát ngẫu nhiên từ danh sách
            List<Song> randomSongs = dao.findAllDeletedSongsExcludingIds(excludedSongIds);

            // Kiểm tra danh sách bài hát không rỗng
            if (randomSongs != null && !randomSongs.isEmpty()) {
                // Chọn một bài hát ngẫu nhiên từ danh sách
                Random random = new Random();
                Song randomSong = randomSongs.get(random.nextInt(randomSongs.size()));

                return ResponseEntity.ok(randomSong);
            } else {
                return ResponseEntity.notFound().build();
            }
        }
    }

    @GetMapping("/rest/Song/UpdateAlbum/all")
    public ResponseEntity<Page<Song>> getAllForUpdateAlbum(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "") String search) {
        Pageable pageable = PageRequest.of(page, size);

        Page<Song> result;

        if (search.isEmpty()) {
            result = dao.findAllActiveAndAlbumIsNull(pageable);
        } else {
            result = dao.findByNameOrArtistOrAlbumOrTopicContainingIgnoreCaseAndAlbumIsNull(search, pageable);
        }
        return ResponseEntity.ok(result);
    }

    @PutMapping("/rest/Song/UpdateAlbumSongs")
    public ResponseEntity<List<Song>> updateAlbumSongs(
            @RequestParam List<Integer> songIds,
            @RequestParam Integer albumId,
            Principal principal) {

        List<Song> updatedSongs = new ArrayList<>();

        for (Integer id : songIds) {
            if (!dao.existsById(id)) {
                return ResponseEntity.notFound().build();
            }

            Song song = dao.findById(id).get();

            if (albumId != null && albumId > 0) {
                Album album = aldao.findById(albumId).orElse(null);
                if (album != null) {
                    song.setAlbum(album);
                } else {
                    song.setAlbum(null);
                }
            } else {
                song.setAlbum(null);
            }
            song.setUpdateDate(new Date());
            song.setUpdateUser(principal.getName());
            updatedSongs.add(dao.save(song));
        }

        return ResponseEntity.ok(updatedSongs);
    }

}
