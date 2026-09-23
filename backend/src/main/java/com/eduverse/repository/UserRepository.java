package com.eduverse.repository;

import com.eduverse.entity.Role;
import com.eduverse.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    Optional<User> findByEmailOrUsername(String email, String username);
    boolean existsByEmail(String email);
    boolean existsByInstitutionIdAndEmail(Long institutionId, String email);
    boolean existsByInstitutionIdAndUsername(Long institutionId, String username);
    Optional<User> findByInstitutionIdAndEmail(Long institutionId, String email);
    Optional<User> findByInstitutionIdAndUsername(Long institutionId, String username);
    Page<User> findByInstitutionIdAndRole(Long institutionId, Role role, Pageable pageable);
    java.util.List<User> findByRole(Role role);
    long countByInstitutionIdAndRole(Long institutionId, Role role);
    long countByRole(Role role);
}
