package com.zoadex.api.social;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, UUID> {

    @Query("SELECT f FROM Friendship f WHERE (f.requesterId = :userId OR f.addresseeId = :userId) AND f.status = :status")
    List<Friendship> findByUserIdAndStatus(@Param("userId") UUID userId, @Param("status") String status);

    @Query("SELECT f FROM Friendship f WHERE (f.requesterId = :userId OR f.addresseeId = :userId) AND f.status = 'ACCEPTED'")
    List<Friendship> findAcceptedFriendships(@Param("userId") UUID userId);

    List<Friendship> findByAddresseeIdAndStatus(UUID addresseeId, String status);

    @Query("SELECT f FROM Friendship f WHERE " +
           "((f.requesterId = :user1 AND f.addresseeId = :user2) OR " +
           "(f.requesterId = :user2 AND f.addresseeId = :user1))")
    Optional<Friendship> findBetweenUsers(@Param("user1") UUID user1, @Param("user2") UUID user2);
}
