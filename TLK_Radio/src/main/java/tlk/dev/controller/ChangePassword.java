package tlk.dev.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import jakarta.servlet.http.HttpSession;
import tlk.dev.dao.AccountDao;
import tlk.dev.entity.Account;

@Controller
@RequestMapping("/changePassword")
public class ChangePassword {
	@Autowired
	AccountDao accountDao;
	
	BCryptPasswordEncoder pe = new BCryptPasswordEncoder();

	@GetMapping
	public String index(Model model, HttpSession session, Principal principal) {
		
		return "change_password";
	}

	@PostMapping()
    public String changePassword(Model model, Principal principal, @RequestParam("username") String username,
		@RequestParam("currentPassword") String pass, @RequestParam("newPassword") String newPass, @RequestParam("confirmPassword") String confirmPass) {
			System.out.println(principal.getName());
			System.out.println(username);
			if(principal.getName().compareTo(username) != 0){
			model.addAttribute("messageError", "Sai tên đăng nhập");
			model.addAttribute("registrationSuccess", false);
			return "change_password";
		}
		Account acc = accountDao.findById(username).get();
		
		if(!pe.matches(pass, acc.getPassword())){
			model.addAttribute("messageError", "Sai mật khẩu");
			model.addAttribute("registrationSuccess", false);
			return "change_password";
		}
		//Kiểm tra mật khảu mới có đúng với xác nhận mật khẩu không
		if (!confirmPass.equals(newPass)) {
			model.addAttribute("messageError", "Xác nhận mật khẩu không chính xác");
			model.addAttribute("registrationSuccess", false);
			return "change_password";
		}

		acc.setPassword(pe.encode(newPass));
		accountDao.save(acc);
		model.addAttribute("messageSuccess", "Đổi mật khẩu thành công");
		model.addAttribute("registrationSuccess", true);
		return "change_password";

		
    }
}
