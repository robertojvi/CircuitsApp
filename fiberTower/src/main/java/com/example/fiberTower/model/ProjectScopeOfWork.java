package com.example.fiberTower.model;

import jakarta.persistence.*;

@Entity
@Table(name = "project_scope_of_work")
public class ProjectScopeOfWork {

    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne
    @JoinColumn(name = "site_id", nullable = false, unique = true)
    private Site site;

    private Double headendQuantity;
    private String headendLabel;

    private Double bnOrDnQuantity;
    private String bnOrDnLabel;

    private Double pointToPointQuantity;
    private String pointToPointLabel;

    private Double outdoorIndoorApQuantity;
    private String outdoorIndoorApLabel;

    private Double cnOrRnQuantity;
    private String cnOrRnLabel;

    private Double directBurialPolesElectricalQuantity;
    private String directBurialPolesElectricalLabel;

    private Double poleTestTurnUpQuantity;
    private String poleTestTurnUpLabel;

    private Double directBurialFiberQuantity;
    private String directBurialFiberLabel;

    private Double conduitQuantity;
    private String conduitLabel;

    private Double fiberPullQuantity;
    private String fiberPullLabel;

    private Double breakerDisconnectsQuantity;
    private String breakerDisconnectsLabel;

    private Double camerasQuantity;
    private String camerasLabel;

    private Double nemaElectricalQuantity;
    private String nemaElectricalLabel;

    private Double homeInstallsQuantity;
    private String homeInstallsLabel;

    private Integer daysToComplete;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Site getSite() {
        return site;
    }

    public void setSite(Site site) {
        this.site = site;
    }

    public Double getHeadendQuantity() {
        return headendQuantity;
    }

    public void setHeadendQuantity(Double headendQuantity) {
        this.headendQuantity = headendQuantity;
    }

    public String getHeadendLabel() {
        return headendLabel;
    }

    public void setHeadendLabel(String headendLabel) {
        this.headendLabel = headendLabel;
    }

    public Double getBnOrDnQuantity() {
        return bnOrDnQuantity;
    }

    public void setBnOrDnQuantity(Double bnOrDnQuantity) {
        this.bnOrDnQuantity = bnOrDnQuantity;
    }

    public String getBnOrDnLabel() {
        return bnOrDnLabel;
    }

    public void setBnOrDnLabel(String bnOrDnLabel) {
        this.bnOrDnLabel = bnOrDnLabel;
    }

    public Double getPointToPointQuantity() {
        return pointToPointQuantity;
    }

    public void setPointToPointQuantity(Double pointToPointQuantity) {
        this.pointToPointQuantity = pointToPointQuantity;
    }

    public String getPointToPointLabel() {
        return pointToPointLabel;
    }

    public void setPointToPointLabel(String pointToPointLabel) {
        this.pointToPointLabel = pointToPointLabel;
    }

    public Double getOutdoorIndoorApQuantity() {
        return outdoorIndoorApQuantity;
    }

    public void setOutdoorIndoorApQuantity(Double outdoorIndoorApQuantity) {
        this.outdoorIndoorApQuantity = outdoorIndoorApQuantity;
    }

    public String getOutdoorIndoorApLabel() {
        return outdoorIndoorApLabel;
    }

    public void setOutdoorIndoorApLabel(String outdoorIndoorApLabel) {
        this.outdoorIndoorApLabel = outdoorIndoorApLabel;
    }

    public Double getCnOrRnQuantity() {
        return cnOrRnQuantity;
    }

    public void setCnOrRnQuantity(Double cnOrRnQuantity) {
        this.cnOrRnQuantity = cnOrRnQuantity;
    }

    public String getCnOrRnLabel() {
        return cnOrRnLabel;
    }

    public void setCnOrRnLabel(String cnOrRnLabel) {
        this.cnOrRnLabel = cnOrRnLabel;
    }

    public Double getDirectBurialPolesElectricalQuantity() {
        return directBurialPolesElectricalQuantity;
    }

    public void setDirectBurialPolesElectricalQuantity(Double directBurialPolesElectricalQuantity) {
        this.directBurialPolesElectricalQuantity = directBurialPolesElectricalQuantity;
    }

    public String getDirectBurialPolesElectricalLabel() {
        return directBurialPolesElectricalLabel;
    }

    public void setDirectBurialPolesElectricalLabel(String directBurialPolesElectricalLabel) {
        this.directBurialPolesElectricalLabel = directBurialPolesElectricalLabel;
    }

    public Double getPoleTestTurnUpQuantity() {
        return poleTestTurnUpQuantity;
    }

    public void setPoleTestTurnUpQuantity(Double poleTestTurnUpQuantity) {
        this.poleTestTurnUpQuantity = poleTestTurnUpQuantity;
    }

    public String getPoleTestTurnUpLabel() {
        return poleTestTurnUpLabel;
    }

    public void setPoleTestTurnUpLabel(String poleTestTurnUpLabel) {
        this.poleTestTurnUpLabel = poleTestTurnUpLabel;
    }

    public Double getDirectBurialFiberQuantity() {
        return directBurialFiberQuantity;
    }

    public void setDirectBurialFiberQuantity(Double directBurialFiberQuantity) {
        this.directBurialFiberQuantity = directBurialFiberQuantity;
    }

    public String getDirectBurialFiberLabel() {
        return directBurialFiberLabel;
    }

    public void setDirectBurialFiberLabel(String directBurialFiberLabel) {
        this.directBurialFiberLabel = directBurialFiberLabel;
    }

    public Double getConduitQuantity() {
        return conduitQuantity;
    }

    public void setConduitQuantity(Double conduitQuantity) {
        this.conduitQuantity = conduitQuantity;
    }

    public String getConduitLabel() {
        return conduitLabel;
    }

    public void setConduitLabel(String conduitLabel) {
        this.conduitLabel = conduitLabel;
    }

    public Double getFiberPullQuantity() {
        return fiberPullQuantity;
    }

    public void setFiberPullQuantity(Double fiberPullQuantity) {
        this.fiberPullQuantity = fiberPullQuantity;
    }

    public String getFiberPullLabel() {
        return fiberPullLabel;
    }

    public void setFiberPullLabel(String fiberPullLabel) {
        this.fiberPullLabel = fiberPullLabel;
    }

    public Double getBreakerDisconnectsQuantity() {
        return breakerDisconnectsQuantity;
    }

    public void setBreakerDisconnectsQuantity(Double breakerDisconnectsQuantity) {
        this.breakerDisconnectsQuantity = breakerDisconnectsQuantity;
    }

    public String getBreakerDisconnectsLabel() {
        return breakerDisconnectsLabel;
    }

    public void setBreakerDisconnectsLabel(String breakerDisconnectsLabel) {
        this.breakerDisconnectsLabel = breakerDisconnectsLabel;
    }

    public Double getCamerasQuantity() {
        return camerasQuantity;
    }

    public void setCamerasQuantity(Double camerasQuantity) {
        this.camerasQuantity = camerasQuantity;
    }

    public String getCamerasLabel() {
        return camerasLabel;
    }

    public void setCamerasLabel(String camerasLabel) {
        this.camerasLabel = camerasLabel;
    }

    public Double getNemaElectricalQuantity() {
        return nemaElectricalQuantity;
    }

    public void setNemaElectricalQuantity(Double nemaElectricalQuantity) {
        this.nemaElectricalQuantity = nemaElectricalQuantity;
    }

    public String getNemaElectricalLabel() {
        return nemaElectricalLabel;
    }

    public void setNemaElectricalLabel(String nemaElectricalLabel) {
        this.nemaElectricalLabel = nemaElectricalLabel;
    }

    public Double getHomeInstallsQuantity() {
        return homeInstallsQuantity;
    }

    public void setHomeInstallsQuantity(Double homeInstallsQuantity) {
        this.homeInstallsQuantity = homeInstallsQuantity;
    }

    public String getHomeInstallsLabel() {
        return homeInstallsLabel;
    }

    public void setHomeInstallsLabel(String homeInstallsLabel) {
        this.homeInstallsLabel = homeInstallsLabel;
    }

    public Integer getDaysToComplete() {
        return daysToComplete;
    }

    public void setDaysToComplete(Integer daysToComplete) {
        this.daysToComplete = daysToComplete;
    }
}
