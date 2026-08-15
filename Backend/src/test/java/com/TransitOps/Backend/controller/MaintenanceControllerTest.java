package com.TransitOps.Backend.controller;

import com.TransitOps.Backend.dto.MaintenanceRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "spring.config.location=classpath:/application-test.properties")
@AutoConfigureMockMvc(addFilters = false) // disable security for this test
public class MaintenanceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testCreateMaintenanceLogValidation() throws Exception {
        String jsonPayload = """
                {
                  "vehicleId": "1",
                  "maintenanceType": "Oil Change",
                  "description": "",
                  "cost": 0,
                  "date": "2026-08-15"
                }
                """;

        mockMvc.perform(post("/api/maintenance")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andDo(result -> {
                    System.out.println("RESPONSE BODY: " + result.getResponse().getContentAsString());
                    System.out.println("RESPONSE STATUS: " + result.getResponse().getStatus());
                });
    }
}
