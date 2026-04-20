package com.example.fiberTower.service;

import com.example.fiberTower.model.Circuit;
import com.example.fiberTower.model.CircuitDTO;
import com.example.fiberTower.model.Provider;
import com.example.fiberTower.model.Site;
import com.example.fiberTower.repository.ICircuitRepository;
import com.example.fiberTower.repository.IProviderRepository;
import com.example.fiberTower.repository.ISiteRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

@Service
public class CircuitService implements ICircuitService{
    @Autowired
    private ICircuitRepository circuitRepository;

    @Autowired
    private ISiteRepository siteRepository;

    @Autowired
    private IProviderRepository providerRepository;

    @Autowired
    private ObjectMapper mapper;

    private void saveCircuit(CircuitDTO circuitDTO) {
        Circuit circuit = mapper.convertValue(circuitDTO, Circuit.class);
        Site site = getRequiredSite(circuitDTO);
        Provider provider = getRequiredProvider(circuitDTO);

        updateSiteContractDates(site, circuitDTO);
        circuit.setSite(site);
        circuit.setProvider(provider);

        applyRenewalAnalysis(circuit, site);

		siteRepository.save(Objects.requireNonNull(site));
        circuitRepository.save(circuit);
    }

    private Site getRequiredSite(CircuitDTO circuitDTO) {
        Long siteId = circuitDTO.getSite() != null ? circuitDTO.getSite().getId() : null;

        if (siteId == null) {
            throw new IllegalArgumentException("Circuit site is required");
        }

        return siteRepository.findById(siteId)
                .orElseThrow(() -> new IllegalArgumentException("Site not found: " + siteId));
    }

    private Provider getRequiredProvider(CircuitDTO circuitDTO) {
        Long providerId = circuitDTO.getProvider() != null ? circuitDTO.getProvider().getId() : null;

        if (providerId == null) {
            throw new IllegalArgumentException("Circuit provider is required");
        }

        return providerRepository.findById(providerId)
                .orElseThrow(() -> new IllegalArgumentException("Provider not found: " + providerId));
    }

    private void updateSiteContractDates(Site site, CircuitDTO circuitDTO) {
        if (circuitDTO.getSite() == null) {
            return;
        }

        site.setCustomerContractDate(circuitDTO.getSite().getCustomerContractDate());
        site.setCustomerContractExpirationDate(circuitDTO.getSite().getCustomerContractExpirationDate());
    }

    private void applyRenewalAnalysis(Circuit circuit, Site site) {
        Double savingsDifference = null;
        Integer monthsToCustomerExpiration = null;
        Double savingsUntilCustomerExpiration = null;
        Double costFromCustomerExpirationToRenewalExpiration = null;

        if (circuit.getMonthlyCost() != null && circuit.getRenewalMonthlyCost() != null) {
            savingsDifference = roundCurrency(circuit.getMonthlyCost() - circuit.getRenewalMonthlyCost());
        }

        LocalDate today = LocalDate.now();
        LocalDate startOfNextMonth = today.plusMonths(1).withDayOfMonth(1);
        LocalDate customerContractExpirationDate = parseDate(site.getCustomerContractExpirationDate());
        if (customerContractExpirationDate != null && customerContractExpirationDate.isAfter(today)) {
            monthsToCustomerExpiration = calculateRoundedUpMonths(startOfNextMonth, customerContractExpirationDate);
        } else if (customerContractExpirationDate != null) {
            monthsToCustomerExpiration = 0;
        }

        if (savingsDifference != null && monthsToCustomerExpiration != null) {
            savingsUntilCustomerExpiration = roundCurrency(savingsDifference * monthsToCustomerExpiration);
        }

        LocalDate renewalCircuitExpirationDate = parseDate(circuit.getRenewalCircuitExpirationDate());
        if (
                circuit.getRenewalMonthlyCost() != null &&
                customerContractExpirationDate != null &&
                renewalCircuitExpirationDate != null &&
                renewalCircuitExpirationDate.isAfter(customerContractExpirationDate)
        ) {
            int monthsBetweenDates = calculateRoundedUpMonths(
                    customerContractExpirationDate,
                    renewalCircuitExpirationDate
            );
            costFromCustomerExpirationToRenewalExpiration = roundCurrency(
                    circuit.getRenewalMonthlyCost() * monthsBetweenDates
            );
        }

        circuit.setSavingsDifference(savingsDifference);
        circuit.setMonthsToCustomerContractExpiration(monthsToCustomerExpiration);
        circuit.setSavingsUntilCustomerContractExpiration(savingsUntilCustomerExpiration);
        circuit.setCostFromCustomerExpirationToRenewalExpiration(costFromCustomerExpirationToRenewalExpiration);
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException exception) {
            return null;
        }
    }

    private int calculateRoundedUpMonths(LocalDate startDate, LocalDate endDate) {
        if (!endDate.isAfter(startDate)) {
            return 0;
        }

        long fullMonths = ChronoUnit.MONTHS.between(startDate, endDate);
        LocalDate adjustedStart = startDate.plusMonths(fullMonths);

        if (adjustedStart.isBefore(endDate)) {
            fullMonths++;
        }

        return (int) fullMonths;
    }

    private Double roundCurrency(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    @Override
    public void createCircuit(CircuitDTO circuitDTO) {
        saveCircuit(circuitDTO);
    }

    @Override
    public CircuitDTO getCircuitById(Long id) {
        Optional<Circuit> circuit = circuitRepository.findById(Objects.requireNonNull(id));
        CircuitDTO circuitDTO = null;
        if (circuit.isPresent())
            circuitDTO = mapper.convertValue(circuit.get(), CircuitDTO.class);
        return circuitDTO;
    }

    @Override
    public void updateCircuit(CircuitDTO circuitDTO) {
        saveCircuit(circuitDTO);
    }

    @Override
    public void deleteCircuit(Long id) {
        circuitRepository.deleteById(Objects.requireNonNull(id));
    }

    @Override
    public Set<CircuitDTO> getAllCircuits() {
        List<Circuit> circuits = circuitRepository.findAll();
        Set<CircuitDTO> circuitsDTO = new HashSet<>();
        for (Circuit circuit : circuits) {
            circuitsDTO.add(mapper.convertValue(circuit, CircuitDTO.class));
        }
        return circuitsDTO;
    }
}
