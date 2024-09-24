package tlk.dev.controller.admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import tlk.dev.dao.AccountDao;
import tlk.dev.entity.Account;

@Controller
@RequestMapping("admin/account")
public class AccountController {
    
    @Autowired
    AccountDao dao;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN')")
    public String index() {
        return "admin/account";
    }

    
}
