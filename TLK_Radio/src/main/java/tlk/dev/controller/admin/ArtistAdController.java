package tlk.dev.controller.admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;


import tlk.dev.dao.ArtistDao;

@Controller
@RequestMapping("admin/Artist")
public class ArtistAdController {
     
        @Autowired
    ArtistDao dao;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN')")
    public String index() {
        return "admin/artist";
    }
}
