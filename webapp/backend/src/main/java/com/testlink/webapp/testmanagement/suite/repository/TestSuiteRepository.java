package com.testlink.webapp.testmanagement.suite.repository;

import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.testmanagement.suite.entity.TestSuite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestSuiteRepository  extends JpaRepository<TestSuite, Long> {
    List<TestSuite> findByProject_ProjectIdAndParentTestSuiteIsNull(Long projectId);
    List<TestSuite> findByParentTestSuite_TestSuiteId(Long parentId);

    List<TestSuite> findByProject(Project project);
    List<TestSuite> findByProjectAndParentTestSuiteIsNull(Project project);
    List<TestSuite> findByProjectAndParentTestSuite(Project project, TestSuite parent);
}
