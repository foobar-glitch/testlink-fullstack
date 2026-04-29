package com.testlink.webapp.testmanagement.suite.entity;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import java.io.Serializable;
import java.util.UUID;

@Embeddable
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class TestSuitePlanStatsId implements Serializable {
    private UUID testSuiteId;
    private UUID testPlanId;
}