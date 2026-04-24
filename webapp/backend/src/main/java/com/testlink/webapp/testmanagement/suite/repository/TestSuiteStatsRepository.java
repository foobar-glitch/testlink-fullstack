package com.testlink.webapp.testmanagement.suite.repository;

import com.testlink.webapp.testmanagement.suite.entity.TestSuite;
import com.testlink.webapp.testmanagement.suite.entity.TestSuiteStats;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TestSuiteStatsRepository   extends JpaRepository<TestSuiteStats, Long> {
    Optional<TestSuiteStats> findTestSuiteStatsByTestSuite(TestSuite testSuite);
}
