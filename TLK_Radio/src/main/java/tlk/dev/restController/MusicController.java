package tlk.dev.restController;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import tlk.dev.task.FileRequestTask;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

@RestController
public class MusicController {

    private static final int QUEUE_CAPACITY = 100;
    private static final int MAX_CONCURRENT_REQUESTS = 5;

    private final BlockingQueue<Future<ResponseEntity<Resource>>> queue = new LinkedBlockingQueue<>(QUEUE_CAPACITY);
    private final ThreadPoolExecutor executor = new ThreadPoolExecutor(
            MAX_CONCURRENT_REQUESTS,
            MAX_CONCURRENT_REQUESTS,
            0L, TimeUnit.MILLISECONDS,
            new LinkedBlockingQueue<>()
    );

    @GetMapping(value = "/rest/get-file-via-byte-array-resource")
    public ResponseEntity<Resource> getFileViaByteArrayResource(@RequestParam String filename) {
        try {
            FileRequestTask task = new FileRequestTask(filename);
            Future<ResponseEntity<Resource>> future = executor.submit(task);
            queue.put(future);

            ResponseEntity<Resource> response = future.get();
            queue.remove(future);
            return response;

        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

}