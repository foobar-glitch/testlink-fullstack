package com.testlink.webapp.testmanagement.testcase.repository;

import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersion;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersionStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TestCaseVersionStatsRepository extends JpaRepository<TestCaseVersionStats, Long> {
    Optional<TestCaseVersionStats> findTestCaseVersionStatsByTestCaseVersion(TestCaseVersion testCaseVersion);
}