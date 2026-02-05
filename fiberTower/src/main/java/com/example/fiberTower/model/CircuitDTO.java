package com.example.fiberTower.model;

public class CircuitDTO {

    private Long id;
    private Site site;
    private Provider provider;
    private String accountNumber;
    private String circuitId;
    private String circuitBandwidth;
    private Double monthlyCost;
    private String status;
    private String circuitContractDate;
    private String installationDate;
    private String expirationDate;
    private String circuitType;
    private Boolean hasTower;
    private Integer numberOfTowers;
    private String towerProvider;
    private String towerInstallDate;
    private String towerExpirationDate;
    private Double towerMonthlyCost;

    public Double getTowerMonthlyCost() {
        return towerMonthlyCost;
    }

    public void setTowerMonthlyCost(Double towerMonthlyCost) {
        this.towerMonthlyCost = towerMonthlyCost;
    }

    public Integer getNumberOfTowers() {
        return numberOfTowers;
    }

    public void setNumberOfTowers(Integer numberOfTowers) {
        this.numberOfTowers = numberOfTowers;
    }

    public String getTowerProvider() {
        return towerProvider;
    }

    public void setTowerProvider(String towerProvider) {
        this.towerProvider = towerProvider;
    }

    public String getTowerInstallDate() {
        return towerInstallDate;
    }

    public void setTowerInstallDate(String towerInstallDate) {
        this.towerInstallDate = towerInstallDate;
    }

    public String getTowerExpirationDate() {
        return towerExpirationDate;
    }

    public void setTowerExpirationDate(String towerExpirationDate) {
        this.towerExpirationDate = towerExpirationDate;
    }

    public String getCircuitContractDate() {
        return circuitContractDate;
    }

    public void setCircuitContractDate(String circuitContractDate) {
        this.circuitContractDate = circuitContractDate;
    }

    public Boolean getHasTower() {
        return hasTower;
    }

    public void setHasTower(Boolean hasTower) {
        this.hasTower = hasTower;
    }

    public String getCircuitType() {
        return circuitType;
    }

    public void setCircuitType(String circuitType) {
        this.circuitType = circuitType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getInstallationDate() {
        return installationDate;
    }

    public void setInstallationDate(String installationDate) {
        this.installationDate = installationDate;
    }

    public String getExpirationDate() {
        return expirationDate;
    }

    public void setExpirationDate(String expirationDate) {
        this.expirationDate = expirationDate;
    }

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

    public Provider getProvider() {
        return provider;
    }

    public void setProvider(Provider provider) {
        this.provider = provider;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getCircuitId() {
        return circuitId;
    }

    public void setCircuitId(String circuitId) {
        this.circuitId = circuitId;
    }

    public String getCircuitBandwidth() {
        return circuitBandwidth;
    }

    public void setCircuitBandwidth(String circuitBandwidth) {
        this.circuitBandwidth = circuitBandwidth;
    }

    public Double getMonthlyCost() {
        return monthlyCost;
    }

    public void setMonthlyCost(Double monthlyCost) {
        this.monthlyCost = monthlyCost;
    }
}
