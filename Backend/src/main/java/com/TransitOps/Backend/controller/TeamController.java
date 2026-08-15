package com.TransitOps.Backend.controller;

import com.TransitOps.Backend.dto.RegisterRequest;
import com.TransitOps.Backend.dto.TeamUserResponse;
import com.TransitOps.Backend.service.TeamService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/team")
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    private Long getCompanyId(HttpServletRequest request) {
        return (Long) request.getAttribute("companyId");
    }

    @PostMapping("/users")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<TeamUserResponse> addTeamMember(@Valid @RequestBody RegisterRequest request, HttpServletRequest httpRequest) {
        Long companyId = getCompanyId(httpRequest);
        if (companyId == null) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(teamService.addTeamMember(request, companyId));
    }

    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<List<TeamUserResponse>> getTeamMembers(HttpServletRequest httpRequest) {
        Long companyId = getCompanyId(httpRequest);
        if (companyId == null) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(teamService.getTeamMembers(companyId));
    }

    @PutMapping("/users/{id}")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<TeamUserResponse> updateTeamMember(@PathVariable Long id, @Valid @RequestBody RegisterRequest request, HttpServletRequest httpRequest) {
        Long companyId = getCompanyId(httpRequest);
        if (companyId == null) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(teamService.updateTeamMember(id, request, companyId));
    }
}
