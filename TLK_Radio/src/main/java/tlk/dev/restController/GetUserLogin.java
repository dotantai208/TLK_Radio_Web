package tlk.dev.restController;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import tlk.dev.dao.AccountDao;
import tlk.dev.entity.Account;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;
import java.util.HashMap;
import java.util.Optional;

@RestController
public class GetUserLogin {
    @Autowired 
    AccountDao accountDao;

    @GetMapping("/rest/getUserLogin")
    public ResponseEntity<Account> getUserLogin(Principal principal) {
        if (principal != null) {
            String username = principal.getName();
            Account acc = accountDao.findById(username).get();
            return ResponseEntity.ok(acc);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("rest/checkUserLogin")
    public ResponseEntity<java.util.Map<String, Object>> checkUserLogin(Principal principal) {
        java.util.Map<String, Object> response = new HashMap<>();
        if (principal != null) {
            String username = principal.getName();
            Account acc = accountDao.findById(username).get();
            response.put("loggedIn", true);
            response.put("account", acc);
            return ResponseEntity.ok(response);
        }
        response.put("loggedIn", false);
        return ResponseEntity.ok(response);
    }

}