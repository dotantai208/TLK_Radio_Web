package tlk.dev.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;


import jakarta.servlet.http.HttpSession;
import tlk.dev.service.UserService;

@Controller
public class LoginController {

	@GetMapping("/login")
	public String loginForm(Model model) {
		
		return "login";
	}

	@PostMapping("/login")
	public String loginSubmit(Model model) {

		return "login";
	}

	@GetMapping("/login/success")
	public String loginSuccess(Model model, Principal principal, HttpSession session) {
		String username = principal.getName();
		session.setAttribute("usernameLogin", username);
		System.out.println(username);

		model.addAttribute("messageSuccess", "Đăng nhập thành công");
		return "login";

	}

	@GetMapping("/login/error")
	public String loginError(Model model) {
		model.addAttribute("messageError", "Tên đăng nhập hoặc mật khẩu sai");
		return "login";
	}
	
	@GetMapping("/login/fail")
	public String loginFail(Model model) {
		model.addAttribute("messageError", "Vui lòng đăng nhập với tài khoản quản trị để sử dụng chức năng này");
		return "login";
	}

	@Autowired
	UserService userDetailsService;

	@RequestMapping("/oauth2/login/success")
	public String successAuth(OAuth2AuthenticationToken oauth2) {
		System.out.println("oauth2 "+oauth2.getPrincipal().getAttribute("email"));
		userDetailsService.loginFormOAuth2(oauth2);
		return "forward:/login/success";
	}

}
