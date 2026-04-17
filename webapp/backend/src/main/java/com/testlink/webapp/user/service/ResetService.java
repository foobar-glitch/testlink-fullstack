package com.testlink.webapp.user.service;

import com.testlink.webapp.user.entity.ResetTable;
import com.testlink.webapp.user.entity.UserTable;
import com.testlink.webapp.user.repository.ResetTableRepository;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResetService {

    private final ResetTableRepository resetTableRepository;

    public Optional<ResetTable> findByResetToken(String resetToken) {
        return resetTableRepository.findByResetToken(resetToken);
    }

    public ResetTable save(ResetTable resetTable) {
        return resetTableRepository.save(resetTable);
    }

    public void delete(@NonNull ResetTable resetTable) {
        resetTableRepository.delete(resetTable);
    }

    public void deleteByUser(@NonNull UserTable user) {
        log.debug("Deleting reset tokens for user: {}", user.getUsername());
        List<ResetTable> tokens = resetTableRepository.findByUser(user);
        resetTableRepository.deleteAll(tokens);
    }
}