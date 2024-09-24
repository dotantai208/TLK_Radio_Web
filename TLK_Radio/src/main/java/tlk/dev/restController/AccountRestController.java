package tlk.dev.restController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import tlk.dev.dao.AccountDao;
import tlk.dev.entity.Account;

@CrossOrigin("*")
@RestController
public class AccountRestController {
    @Autowired
	AccountDao dao;
	@Autowired
    private BCryptPasswordEncoder passwordEncoder;
	
	
	@GetMapping("/rest/account")
public ResponseEntity<Page<Account>> getAll(@RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "5") int size,
                                             @RequestParam(defaultValue = "") String search) {
    Pageable pageable = PageRequest.of(page, size);
    Page<Account> result;
    if (search.isEmpty()) {
        result = dao.findByAllRolPage(pageable);
    } else {
        result = dao.findByUsernameContainingIgnoreCaseOrFullnameContainingIgnoreCase(search, pageable);
    }
    return ResponseEntity.ok(result);
}

	
	@GetMapping("/rest/account/{id}")
	public ResponseEntity<Account> getOne(@PathVariable("id") String id){
		if(!dao.existsById(id)) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(dao.findById(id).get());
	}

	@GetMapping("/rest/account/checkUsername/{username}")
	public ResponseEntity<Boolean> checkUsername(@PathVariable("username") String username) {
		
		boolean exists = dao.existsById(username);
		
		return ResponseEntity.ok(exists);
	}
	

	@GetMapping("/rest/account/encodekPass/{password}")
	public String encodekPass(@PathVariable("password") String password){
		return passwordEncoder.encode(password);
	}

	@GetMapping("/rest/account/matcherPass/{currentPassword}/{newPassword}")
	public Boolean matcherPass(@PathVariable("currentPassword") String currentPassword, @PathVariable("newPassword") String newPassword){
		if(passwordEncoder.matches(currentPassword, newPassword)){
			return true;
		}
		return false;
	}

	@PostMapping("/rest/account")
	public ResponseEntity<Account> post(@RequestBody Account account) {
		if (dao.existsById(account.getUsername())) {
			return ResponseEntity.badRequest().build();
		}
		account.setPassword(passwordEncoder.encode(account.getPassword()));
		account.setRole(false);
		
		dao.save(account);
		return ResponseEntity.ok(account);
	}

	@PostMapping("/rest/account/updateprofile")
	public ResponseEntity<Account> postupdate(@RequestBody Account account) {
		if (dao.existsById(account.getUsername())) {
			return ResponseEntity.badRequest().build();
		}
		dao.save(account);
		return ResponseEntity.ok(account);
	}
	@PutMapping("/rest/account/updateprofile/admin")
public ResponseEntity<Account> updateProfile(@RequestBody Account account) {
    // Kiểm tra xem người dùng có tồn tại không
    Optional<Account> existingAccount = dao.findById(account.getUsername());
    
    if (existingAccount.isEmpty()) {
        // Nếu tài khoản không tồn tại, trả về 404 Not Found
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
    }
    
    // Lưu các chi tiết tài khoản đã cập nhật
    Account updatedAccount = dao.save(account);
    
    // Trả về tài khoản đã cập nhật trong phản hồi
    return ResponseEntity.ok(updatedAccount);
}

	
	@PutMapping("/rest/account/{id}")
	public ResponseEntity<Account> put(@PathVariable("id") String id, @RequestBody Account account){
		if(!dao.existsById(account.getUsername())) {
			return ResponseEntity.notFound().build();
		}
		dao.save(account);
		return ResponseEntity.ok(account);
	}
	
	@DeleteMapping("/rest/account/{id}")
	public ResponseEntity<Account> delete(@PathVariable("id") String username){
		if(!dao.existsById(username)) {
			return ResponseEntity.notFound().build();
		}
		dao.deleteById(username);
		return ResponseEntity.ok().build();
	}


	@PutMapping("/rest/account/updatePassword")
public ResponseEntity<Map<String, String>> updatePassword(@RequestBody Map<String, String> requestBody) {
    Map<String, String> response = new HashMap<>();
    try {
        String username = requestBody.get("username");
        String currentPassword = requestBody.get("currentPassword");
        String newPassword = requestBody.get("newPassword");
        String confirmPassword = requestBody.get("confirmPassword");

        if (username == null || currentPassword == null || newPassword == null || confirmPassword == null) {
            response.put("message", "Thiếu thông tin cần thiết.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        Account account = dao.findById(username).orElse(null);
        if (account == null) {
            response.put("message", "Người dùng không tồn tại.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        if (!passwordEncoder.matches(currentPassword, account.getPassword())) {
            response.put("message", "Mật khẩu hiện tại không chính xác.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        if (!newPassword.equals(confirmPassword)) {
            response.put("message", "Mật khẩu mới và xác nhận mật khẩu không khớp.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        account.setPassword(passwordEncoder.encode(newPassword));
        dao.save(account);

        response.put("message", "Đổi mật khẩu thành công.");
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        e.printStackTrace();
        response.put("message", "Có lỗi xảy ra khi đổi mật khẩu: " + e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}

}
