package tlk.dev.controller;

import java.security.Principal;
import java.util.Calendar;
import java.util.Date;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import tlk.dev.config.PaymentConfig;
import tlk.dev.dao.AccountDao;
import tlk.dev.entity.Account;

@Controller
public class PaymentController {

    private PaymentConfig config;

    @Autowired
    private AccountDao accountDao;

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/payment/choise")
    public String index(Model model, HttpSession session, Principal principal) {
        return "payment_choise";
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/payment/vnpay-callback")
    public String handleVnpayCallback(HttpServletRequest request, Model model, Principal principal) {
        Map<String, String> fields = new HashMap<>();

        // Lấy tất cả các tham số trả về từ VNPAY
        Enumeration<String> parameterNames = request.getParameterNames();
        while (parameterNames.hasMoreElements()) {
            String paramName = parameterNames.nextElement();
            String paramValue = request.getParameter(paramName);
            if (paramValue != null && !paramValue.isEmpty()) {
                fields.put(paramName, paramValue);
            }
        }

        // Lấy giá trị vnp_SecureHash
        String vnp_SecureHash = request.getParameter("vnp_SecureHash");

        // Loại bỏ các tham số không cần thiết
        fields.remove("vnp_SecureHashType");
        fields.remove("vnp_SecureHash");

        // Tạo chữ ký hash để xác thực
        String signValue = PaymentConfig.hashAllFields(fields);
        String vnp_ResponseCode = request.getParameter("vnp_ResponseCode");

        System.out.println("Fields: " + fields);
        System.out.println("SignValue: " + signValue);
        System.out.println("vnp_SecureHash: " + vnp_SecureHash);
        System.out.println("vnp_ResponseCode: " + vnp_ResponseCode);

        // Xác thực chữ ký
        if (signValue.equals(vnp_SecureHash)) {

            if ("00".equals(vnp_ResponseCode)) {
                // Giao dịch thành công
                String username = principal.getName();
                Account acc = accountDao.findById(username).orElse(null);

                if (acc != null) {
                    Integer vnpAmount = Integer.parseInt(request.getParameter("vnp_Amount"));
                    if (vnpAmount == 2000000) {
                        // Đặt VIP và ngày VIP
                        acc.setVip(true);
                        Calendar cal = Calendar.getInstance();
                        cal.add(Calendar.MONTH, 1);
                        acc.setDateVip(cal.getTime());
                    } else if (vnpAmount == 5000000) {
                        // Đặt VIP và ngày VIP
                        acc.setVip(true);
                        Calendar cal = Calendar.getInstance();
                        cal.add(Calendar.MONTH, 3);
                        acc.setDateVip(cal.getTime());
                    } else if (vnpAmount == 20000000) {
                        // Đặt VIP và ngày VIP
                        acc.setVip(true);
                        Calendar cal = Calendar.getInstance();
                        cal.add(Calendar.YEAR, 1);
                        acc.setDateVip(cal.getTime());
                    }
                    // Lưu đối tượng acc
                    accountDao.save(acc);
                    model.addAttribute("message", "Giao dịch thành công");
                    return "redirect:/payment/success";
                }
            } else {
                // Giao dịch không thành công
                model.addAttribute("message", "Giao dịch không thành công: " + vnp_ResponseCode);
                return "redirect:/payment/fail";
            }
        } else {
            // Chữ ký không hợp lệ
            model.addAttribute("message", "Chữ ký không hợp lệ");
            return "redirect:/payment/fail";
        }
        // Trường hợp không xác định
        model.addAttribute("message", "Lỗi không xác định");
        return "redirect:/payment/fail";
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/payment/success")
    public String success(Model model) {
        return "payment_success";
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/payment/fail")
    public String fail(Model model) {
        return "payment_fail";
    }
}
