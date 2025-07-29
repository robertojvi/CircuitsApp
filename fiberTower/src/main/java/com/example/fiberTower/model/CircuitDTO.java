package com.example.fiberTower.model;

public class CircuitDTO {

    private Long id;
    private Site site;
    private Provider provider;
    private String accountNumber;
    private String circuitId;
    private String circuitBandwidth;
    private Double monthlyCost;

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
