package tlk.dev.controller;

import java.security.Principal;

import org.springframework.boot.autoconfigure.jms.JmsProperties.Listener.Session;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import ch.qos.logback.core.model.Model;

@Controller
@RequestMapping("/recent")
public class RecentSongController {

    @GetMapping
	@PreAuthorize("isAuthenticated()")
    public String index(Model model, Session session, Principal principal) {
    
        return "RecentSong";
    }



}
