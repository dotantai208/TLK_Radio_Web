package tlk.dev.task;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.Callable;

public class FileRequestTask implements Callable<ResponseEntity<Resource>> {
    private static final String MP3_DIR = "mp3/";
    private final String filename;

    public FileRequestTask(String filename) {
        this.filename = filename;
    }

    @Override
    public ResponseEntity<Resource> call() {
        try {
            Path path = Paths.get(MP3_DIR + filename);
            if (!Files.exists(path)) {
                System.err.println("File not found: " + path.toAbsolutePath());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }

            ByteArrayResource resource = new ByteArrayResource(Files.readAllBytes(path));
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"");

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentLength(Files.size(path))
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(resource);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
