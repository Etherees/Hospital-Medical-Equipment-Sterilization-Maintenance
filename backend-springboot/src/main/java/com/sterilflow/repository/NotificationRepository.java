package com.sterilflow.repository;

import com.sterilflow.model.entity.SystemNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<SystemNotification, Long> {
    Optional<SystemNotification> findByNotificationId(String id);
    List<SystemNotification> findAllByOrderByCreatedAtDesc();
}