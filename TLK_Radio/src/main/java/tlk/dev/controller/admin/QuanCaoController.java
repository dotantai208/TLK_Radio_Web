package tlk.dev.controller.admin;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("admin/quangcao")
public class QuanCaoController {
      @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN')")
    public String index() {
        return "admin/quangcao";
    }
}
