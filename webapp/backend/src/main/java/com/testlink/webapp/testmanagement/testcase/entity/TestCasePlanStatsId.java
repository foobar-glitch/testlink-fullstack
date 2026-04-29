package com.testlink.webapp.testmanagement.testcase.entity;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.UUID;

@Embeddable
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class TestCasePlanStatsId implements Serializable {

    private UUID testCaseId;
    private UUID testPlanId;

}