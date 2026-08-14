package com.TransitOps.Backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.email.from}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendJoinRequestNotification(String adminEmail, String applicantName, String applicantRole, String companyName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(adminEmail);
            message.setSubject("New Join Request — " + companyName);
            message.setText(String.format(
                "Hello,\n\n%s has requested to join %s as a %s.\n\nPlease log in to TransitOps to review and approve or reject this request.\n\nBest regards,\nTransitOps",
                applicantName, companyName, applicantRole.replace("_", " ")
            ));
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("[EmailService] Failed to send join request notification: " + e.getMessage());
        }
    }

    @Async
    public void sendApprovalNotification(String userEmail, String userName, String companyName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(userEmail);
            message.setSubject("Your request to join " + companyName + " has been approved!");
            message.setText(String.format(
                "Hello %s,\n\nGreat news! Your request to join %s has been approved. You can now log in to TransitOps and start using the platform.\n\nBest regards,\nTransitOps",
                userName, companyName
            ));
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("[EmailService] Failed to send approval notification: " + e.getMessage());
        }
    }

    @Async
    public void sendRejectionNotification(String userEmail, String userName, String companyName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(userEmail);
            message.setSubject("Your request to join " + companyName + " has been declined");
            message.setText(String.format(
                "Hello %s,\n\nUnfortunately, your request to join %s has been declined by the company administrator.\n\nIf you believe this was a mistake, please contact the company directly.\n\nBest regards,\nTransitOps",
                userName, companyName
            ));
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("[EmailService] Failed to send rejection notification: " + e.getMessage());
        }
    }
}
