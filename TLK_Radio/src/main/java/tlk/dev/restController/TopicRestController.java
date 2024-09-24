package tlk.dev.restController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.Principal;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import tlk.dev.dao.TopicDao;
import tlk.dev.entity.Topic;

@CrossOrigin("*")
@RestController
@RequestMapping("/rest")
public class TopicRestController {
    @Autowired
    private TopicDao topicDao;

    @GetMapping("/topics/admin")
    public ResponseEntity<Page<Topic>> getTopics(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "") String search) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Topic> result;
        if (search.isEmpty()) {
            result = topicDao.findAllActive(pageable);
        } else {
            result = topicDao.findByNameContainingIgnoreCase(search, pageable);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/topics/admin/khoiphuc")
    public ResponseEntity<Page<Topic>> getTopicsFalse(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "") String search) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Topic> result;
        if (search.isEmpty()) {
            result = topicDao.findAllActiveFalse(pageable);
        } else {
            result = topicDao.findByNameContainingIgnoreCaseFalse(search, pageable);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/topics")
    public ResponseEntity<List<Topic>> getTopics() {
        List<Topic> topics = topicDao.findAll();
        if (topics.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
        }
        return ResponseEntity.ok(topics);
    }

    @GetMapping("/topics/getbyname/{name}")
    public ResponseEntity<Topic> getTopicByname(@PathVariable String name) {
        Topic topics = topicDao.findByNameTopic(name);
        if (topics == null) {
            return null;
        }
        return ResponseEntity.ok(topics);
    }

    @GetMapping("/topics/searchbyname/{name}")
    public ResponseEntity<List<Topic>> searchTopicByname(@PathVariable String name) {
        List<Topic> topics = topicDao.searchByNameTopic(name);
        if (topics.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
        }
        return ResponseEntity.ok(topics);
    }

    @GetMapping("/Topic/{id}")
    public ResponseEntity<Topic> getTopicById(@PathVariable int id) {
        Optional<Topic> topic = topicDao.findById(id);
        if (topic.isPresent()) {
            return ResponseEntity.ok(topic.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @PostMapping("/Topic")
    public ResponseEntity<Topic> createTopic(@RequestPart("topic") String topicJson,
            @RequestPart("image") MultipartFile imageFile, Principal principal) {
        ObjectMapper objectMapper = new ObjectMapper();
        Topic topic;
        try {
            topic = objectMapper.readValue(topicJson, Topic.class);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }

        topic.setDeleted(true);
        topic.setCreateDate(new Date());
        topic.setUpdateDate(new Date());

        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                String imageFileName = saveFile(imageFile, "src/main/resources/static/asset/images/topic");
                topic.setImage(imageFileName);
            } catch (IOException e) {
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }
        }
        topic.setCreateDate(new Date());
        topic.setCreateUser(principal.getName());
        topic = topicDao.save(topic);
        return ResponseEntity.status(HttpStatus.CREATED).body(topic);
    }

    @PutMapping("/Topic/{id}")
    public ResponseEntity<Topic> updateTopic(
            @PathVariable int id,
            @RequestPart("topicDetails") String topicDetailsString, // Retrieve JSON as a string
            @RequestPart(value = "image", required = false) MultipartFile imageFile, Principal principal) {

        Topic topicDetails;
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            topicDetails = objectMapper.readValue(topicDetailsString, Topic.class);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }

        // Retrieve the existing topic from the database
        Optional<Topic> optionalTopic = topicDao.findById(id);
        if (optionalTopic.isPresent()) {
            Topic topic = optionalTopic.get();
            topic.setName(topicDetails.getName());
            topic.setUpdateDate(new Date());
            topic.setUpdateUser(topicDetails.getUpdateUser());

            // Update the image if provided
            if (imageFile != null && !imageFile.isEmpty()) {
                try {
                    String imageFileName = saveFile(imageFile, "src/main/resources/static/asset/images/topic");
                    topic.setImage(imageFileName);
                } catch (IOException e) {
                    e.printStackTrace();
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
                }
            }
            topic.setUpdateDate(new Date());
            topic.setUpdateUser(principal.getName());
            topic = topicDao.save(topic);
            return ResponseEntity.ok(topic);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @PutMapping("/Topic/{id}/softDelete")
    public ResponseEntity<Void> softDeleteTopic(@PathVariable int id, Principal principal) {
        Optional<Topic> optionalTopic = topicDao.findById(id);
        if (optionalTopic.isPresent()) {
            Topic topic = optionalTopic.get();
            topic.setDeleted(false);
            topic.setUpdateDate(new Date());
            topic.setUpdateUser(principal.getName());
            topicDao.save(topic);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PutMapping("/Topic/{id}/khoiphuc")
    public ResponseEntity<Void> softDeleteTopicFalse(@PathVariable int id, Principal principal) {
        Optional<Topic> optionalTopic = topicDao.findById(id);
        if (optionalTopic.isPresent()) {
            Topic topic = optionalTopic.get();
            topic.setDeleted(true);
            topic.setUpdateDate(new Date());
            topic.setUpdateUser(principal.getName());
            topicDao.save(topic);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    private String saveFile(MultipartFile file, String folder) throws IOException {
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        String filePath = folder + "/" + fileName;
        Files.createDirectories(Paths.get(folder));
        Files.write(Paths.get(filePath), file.getBytes());
        return fileName;
    }

    @GetMapping("/topics/checkNameExists")
    public ResponseEntity<?> checkTopicNameExists(@RequestParam String name) {
        boolean exists = topicDao.existsByName(name);
        return ResponseEntity.ok(Collections.singletonMap("exists", exists));
    }

    @GetMapping("/topics/checkNameExistsForUpdate")
    public ResponseEntity<?> checkNameExistsForUpdate(@RequestParam String name, @RequestParam int id) {
        boolean exists = topicDao.existsByNameAndIdNot(name, id);
        return ResponseEntity.ok(Collections.singletonMap("exists", exists));
    }

}
