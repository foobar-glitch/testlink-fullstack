package com.testlink.webapp.testmanagement.testcase.repository;

import com.testlink.webapp.testmanagement.testcase.entity.TestCase;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TestCaseStatsRepository extends JpaRepository<TestCaseStats, Long> {
    Optional<TestCaseStats> findTestCaseStatsByTestCase(TestCase testCase);
}
