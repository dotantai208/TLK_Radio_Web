package tlk.dev.config;

import java.io.Console;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;


import tlk.dev.dao.AccountDao;


@Configuration
@EnableWebSecurity
@EnableMethodSecurity(securedEnabled = true, jsr250Enabled = true, prePostEnabled = true)
public class SecurityConfiguration {

	@Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }
	
	@Autowired
	AccountDao accountDao;
	
	@Autowired
	tlk.dev.service.UserService userService;

	@Autowired
	public void userDetailsService(AuthenticationManagerBuilder auth) throws Exception {
		auth.userDetailsService(userService);
	}
	
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
       //CSRF - CORS
    	http.csrf(AbstractHttpConfigurer::disable)
        .cors(AbstractHttpConfigurer::disable);
        
    	//Phân quyền sử dụng
        http.authorizeHttpRequests(
                        authorizationManagerRequestMatcherRegistry -> authorizationManagerRequestMatcherRegistry
                        		//.requestMatchers("/home/admins").hasRole("ADMIN")
                        		//.requestMatchers("/home/users").hasAnyRole("ADMIN", "USER")
                        		//.requestMatchers("/home/authen").authenticated()
								// .requestMatchers("/rest/getUserLogin").authenticated()
                                .anyRequest().permitAll());
        http.exceptionHandling()
        	.accessDeniedPage("/login/fail");
        
        //Cấu hình đăng nhập
        http.formLogin()
        	.loginPage("/login")
        	.loginProcessingUrl("/login")
        	.defaultSuccessUrl("/login/success", false)
        	.failureUrl("/login/error")
        	.usernameParameter("username")
        	.passwordParameter("password");
     
        //Ghi nhớ đăng nhập
        http.rememberMe()
        	.rememberMeParameter("remember");
        
        //Đăng xuất
        http.logout()
        	.logoutUrl("/logout")
        	.logoutSuccessUrl("/index");
        
        http.oauth2Login()
    	.loginPage("/login")
    	.defaultSuccessUrl("/oauth2/login/success", true)
    	.failureUrl("/login/error")
    	.authorizationEndpoint()
    	.baseUri("/oauth2/authorization");
              
        return http.build();
    }

}
