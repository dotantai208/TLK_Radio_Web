package tlk.dev.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import tlk.dev.entity.Account;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
public interface AccountDao extends JpaRepository<Account, String>{

    @Query("SELECT a FROM Account a WHERE a.Role=false")
    Page<Account> findByAllRolPage(Pageable pageable);

    @Query("SELECT a FROM Account a WHERE a.Role=false AND LOWER(a.Username) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(a.Fullname) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Account> findByUsernameContainingIgnoreCaseOrFullnameContainingIgnoreCase(@Param("search") String search, Pageable pageable);
}
