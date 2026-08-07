package com.zoadex.api.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface UserPrivacyRepository extends JpaRepository<UserPrivacy, UUID> {
}
