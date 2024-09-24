package tlk.dev.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;


import jakarta.servlet.http.HttpSession;

@Controller
@RequestMapping("/artist")
public class ArtistController {
	@GetMapping
	public String index(Model model, HttpSession session, Principal principal) {
		
		return "artist";
	}

	@GetMapping("/detail/{id}")
	public String detail(Model model, @PathVariable("id") String id, HttpSession session, Principal principal) {
		
		return "detail_artist";
	}
}
