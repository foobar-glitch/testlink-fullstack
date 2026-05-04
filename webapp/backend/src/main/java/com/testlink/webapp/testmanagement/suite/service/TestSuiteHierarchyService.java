package com.testlink.webapp.testmanagement.suite.service;

import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.testmanagement.plan.repository.TestPlanRunItemRepository;
import com.testlink.webapp.testmanagement.suite.dto.TestSuiteHierarchyDTO;
import com.testlink.webapp.testmanagement.suite.entity.TestSuite;
import com.testlink.webapp.testmanagement.suite.mapper.TestSuiteMapper;
import com.testlink.webapp.testmanagement.suite.repository.TestSuiteRepository;
import com.testlink.webapp.testmanagement.testcase.dto.TestCaseDTO;
import com.testlink.webapp.testmanagement.testcase.entity.TestCase;
import com.testlink.webapp.testmanagement.testcase.mapper.TestCaseMapper;
import com.testlink.webapp.testmanagement.testcase.repository.TestCaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TestSuiteHierarchyService {
    private final TestPlanRunItemRepository testPlanRunItemRepository;
    private final TestSuiteRepository testSuiteRepository;
    private final TestCaseMapper testCaseMapper;
    private final TestSuiteMapper testSuiteMapper;
    private final TestCaseRepository testCaseRepository;

    private TestSuiteHierarchyDTO buildFullHierarchy(
            TestSuite current, TestSuite parent,
            Map<Long, List<TestSuite>> childrenMap,
            Map<Long, List<TestCase>> suiteToCases) {

        List<TestSuiteHierarchyDTO> children = childrenMap
                .getOrDefault(current.getTestSuiteId(), Collections.emptyList())
                .stream()
                .map(child -> buildFullHierarchy(child, current, childrenMap, suiteToCases))
                .toList();

        List<TestCaseDTO> testCaseDtos = suiteToCases
                .getOrDefault(current.getTestSuiteId(), Collections.emptyList())
                .stream()
                .map(testCaseMapper::toDto)
                .toList();

        return TestSuiteHierarchyDTO.builder()
                .current(testSuiteMapper.toDto(current))
                .parent(parent != null ? testSuiteMapper.toDto(parent) : null)
                .children(children)
                .testCases(testCaseDtos)   // now populated
                .build();
    }

    public List<TestSuiteHierarchyDTO> getFullHierarchy(Project project) {
        List<TestSuite> allSuites = testSuiteRepository.findByProject(project);

        Map<Long, List<TestSuite>> childrenMap = allSuites.stream()
                .filter(s -> s.getParentTestSuite() != null)
                .collect(Collectors.groupingBy(s -> s.getParentTestSuite().getTestSuiteId()));

        List<TestSuite> roots = allSuites.stream()
                .filter(s -> s.getParentTestSuite() == null)
                .toList();

        // Load all test cases for the project
        List<TestCase> allTestCases = testCaseRepository.findAllByProject(project);
        Map<Long, List<TestCase>> suiteToCases = allTestCases.stream()
                .collect(Collectors.groupingBy(tc -> tc.getTestSuite().getTestSuiteId()));

        return roots.stream()
                .map(root -> buildFullHierarchy(root, null, childrenMap, suiteToCases))
                .toList();
    }

    public List<TestSuiteHierarchyDTO> getFilteredHierarchy(Project project, UUID planId) {

        List<TestCase> planCases = testPlanRunItemRepository.findAllTestCasesByPlanId(planId);

        Map<Long, List<TestCase>> suiteToCases = planCases.stream()
                .collect(Collectors.groupingBy(tc -> tc.getTestSuite().getTestSuiteId()));

        List<TestSuite> allSuites = testSuiteRepository.findByProject(project);

        Map<Long, List<TestSuite>> childrenMap = allSuites.stream()
                .filter(s -> s.getParentTestSuite() != null)
                .collect(Collectors.groupingBy(s -> s.getParentTestSuite().getTestSuiteId()));

        List<TestSuite> rootSuites = allSuites.stream()
                .filter(s -> s.getParentTestSuite() == null)
                .toList();

        return rootSuites.stream()
                .map(root -> buildPlanFilteredHierarchy(root, null, childrenMap, suiteToCases))
                .filter(Objects::nonNull)
                .toList();
    }

    private TestSuiteHierarchyDTO buildPlanFilteredHierarchy(
            TestSuite current,
            TestSuite parent,
            Map<Long, List<TestSuite>> childrenMap,
            Map<Long, List<TestCase>> suiteToCases
    ) {
        Long currentId = current.getTestSuiteId();

        List<TestSuiteHierarchyDTO> childDtos = childrenMap
                .getOrDefault(currentId, Collections.emptyList())
                .stream()
                .map(child -> buildPlanFilteredHierarchy(child, current, childrenMap, suiteToCases))
                .filter(Objects::nonNull)
                .toList();

        List<TestCaseDTO> testCaseDtos = suiteToCases
                .getOrDefault(currentId, Collections.emptyList())
                .stream()
                .map(testCaseMapper::toDto)
                .toList();

        if (testCaseDtos.isEmpty() && childDtos.isEmpty()) {
            return null;
        }

        return TestSuiteHierarchyDTO.builder()
                .current(testSuiteMapper.toDto(current))
                .parent(parent != null ? testSuiteMapper.toDto(parent) : null)
                .children(childDtos)
                .testCases(testCaseDtos)
                .build();
    }
}
