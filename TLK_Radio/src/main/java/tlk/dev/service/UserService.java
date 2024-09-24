package tlk.dev.service;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.stereotype.Service;

import tlk.dev.dao.AccountDao;
import tlk.dev.entity.Account;



@Service
public class UserService implements UserDetailsService {
	@Autowired
	AccountDao accountDao;

	BCryptPasswordEncoder pe = new BCryptPasswordEncoder();

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		Account account = accountDao.findById(username).orElse(null);

		if (account == null) {
			throw new UsernameNotFoundException("User not found with username: " + username);
		}

		String password = account.getPassword();
		List<GrantedAuthority> authorities = new ArrayList<>();
		if (account.getRole()) {
			authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
		} else {
			authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
		}

		return new User(username, password, authorities);
	}

	public void loginFormOAuth2(OAuth2AuthenticationToken oauth2) {
		String email = oauth2.getPrincipal().getAttribute("email");
		Account existingAccount = accountDao.findById(email).orElse(null);
		String password = Long.toHexString(System.currentTimeMillis());
		String fullName = oauth2.getPrincipal().getAttribute("name");

		if (existingAccount == null) {
			// Tài khoản chưa tồn tại, tạo mới và thêm vào cơ sở dữ liệu
			UserDetails user = User.withUsername(email).password(pe.encode(password)).roles("USER").build();
			existingAccount = new Account();
			existingAccount.setUsername(email);
			existingAccount.setPassword(pe.encode(password));
			existingAccount.setFullname(fullName);

			// Thiết lập các thông tin khác của người dùng từ tài khoản OAuth2 ở đây
			accountDao.save(existingAccount);
		} else {
			// Cập nhật thông tin của tài khoản từ tài khoản OAuth2
			// Ví dụ: cập nhật thông tin cá nhân nếu có sự thay đổi từ tài khoản OAuth2
			existingAccount.setFullname(fullName);

			accountDao.save(existingAccount);
		}

		UserDetails user = User.withUsername(email).password(pe.encode(password)).roles("USER").build();
		Authentication auth = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
		SecurityContextHolder.getContext().setAuthentication(auth);

	};

}
