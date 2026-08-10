package com.zoadex.api.social;

import com.zoadex.api.common.exception.BadRequestException;
import com.zoadex.api.common.exception.ResourceNotFoundException;
import com.zoadex.api.user.User;
import com.zoadex.api.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FriendshipService {

    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public Friendship sendFriendRequest(UUID requesterId, UUID addresseeId) {
        if (requesterId.equals(addresseeId)) {
            throw new BadRequestException("You cannot send a friend request to yourself");
        }

        userRepository.findById(addresseeId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", addresseeId));

        // Check if friendship already exists
        var existing = friendshipRepository.findBetweenUsers(requesterId, addresseeId);
        if (existing.isPresent()) {
            Friendship f = existing.get();
            if ("ACCEPTED".equals(f.getStatus())) {
                throw new BadRequestException("You are already friends");
            }
            if ("PENDING".equals(f.getStatus())) {
                // If THEY sent us a request, auto-accept
                if (f.getAddresseeId().equals(requesterId)) {
                    f.setStatus("ACCEPTED");
                    friendshipRepository.save(f);

                    notificationService.notify(f.getRequesterId(), "FRIEND_ACCEPTED",
                            "Friend request accepted!", null, requesterId);
                    return f;
                }
                throw new BadRequestException("Friend request already sent");
            }
            if ("DECLINED".equals(f.getStatus())) {
                // Allow re-sending after decline
                f.setRequesterId(requesterId);
                f.setAddresseeId(addresseeId);
                f.setStatus("PENDING");
                friendshipRepository.save(f);

                notifyFriendRequest(requesterId, addresseeId);
                return f;
            }
        }

        Friendship friendship = Friendship.builder()
                .requesterId(requesterId)
                .addresseeId(addresseeId)
                .status("PENDING")
                .build();
        friendship = friendshipRepository.save(friendship);

        notifyFriendRequest(requesterId, addresseeId);
        return friendship;
    }

    @Transactional
    public Friendship acceptFriendRequest(UUID userId, UUID friendshipId) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new ResourceNotFoundException("Friendship", "id", friendshipId));

        if (!friendship.getAddresseeId().equals(userId)) {
            throw new BadRequestException("You can only accept requests sent to you");
        }

        if (!"PENDING".equals(friendship.getStatus())) {
            throw new BadRequestException("This request is no longer pending");
        }

        friendship.setStatus("ACCEPTED");
        friendshipRepository.save(friendship);

        // Notify the requester
        User accepter = userRepository.findById(userId).orElse(null);
        String name = accepter != null ? accepter.getUsername() : "Someone";
        notificationService.notify(friendship.getRequesterId(), "FRIEND_ACCEPTED",
                name + " accepted your friend request!", null, userId);

        return friendship;
    }

    @Transactional
    public void declineFriendRequest(UUID userId, UUID friendshipId) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new ResourceNotFoundException("Friendship", "id", friendshipId));

        if (!friendship.getAddresseeId().equals(userId)) {
            throw new BadRequestException("You can only decline requests sent to you");
        }

        friendship.setStatus("DECLINED");
        friendshipRepository.save(friendship);
    }

    @Transactional
    public void removeFriend(UUID userId, UUID friendId) {
        friendshipRepository.findBetweenUsers(userId, friendId).ifPresent(f -> {
            if ("ACCEPTED".equals(f.getStatus())) {
                friendshipRepository.delete(f);
            }
        });
    }

    public List<UUID> getFriendIds(UUID userId) {
        return friendshipRepository.findAcceptedFriendships(userId).stream()
                .map(f -> f.getRequesterId().equals(userId) ? f.getAddresseeId() : f.getRequesterId())
                .collect(Collectors.toList());
    }

    public List<Friendship> getFriends(UUID userId) {
        return friendshipRepository.findAcceptedFriendships(userId);
    }

    public List<Friendship> getPendingRequests(UUID userId) {
        return friendshipRepository.findByAddresseeIdAndStatus(userId, "PENDING");
    }

    public boolean areFriends(UUID user1, UUID user2) {
        return friendshipRepository.findBetweenUsers(user1, user2)
                .map(f -> "ACCEPTED".equals(f.getStatus()))
                .orElse(false);
    }

    private void notifyFriendRequest(UUID requesterId, UUID addresseeId) {
        User requester = userRepository.findById(requesterId).orElse(null);
        String name = requester != null ? requester.getUsername() : "Someone";
        notificationService.notify(addresseeId, "FRIEND_REQUEST",
                name + " sent you a friend request", null, requesterId);
    }
}
