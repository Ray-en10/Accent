package com.accent.tricity.mail;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class AccountMailService {
  private final JavaMailSender sender;

  public AccountMailService(JavaMailSender sender) {
    this.sender = sender;
  }

  public void sendCredentials(String name, String email, String temporaryPassword) {
    SimpleMailMessage message = new SimpleMailMessage();
    message.setTo(email);
    message.setSubject("Votre accès Tricity");
    message.setText("""
        Bonjour %s,

        Votre compte Tricity a été créé par l'équipe ACCENT.

        Email : %s
        Mot de passe temporaire : %s

        Connectez-vous sur xxxx puis changez votre mot de passe.
        """.formatted(name, email, temporaryPassword));
    sender.send(message);
  }

  public void sendPasswordChanged(String name, String email, String newPassword) {
    SimpleMailMessage message = new SimpleMailMessage();
    message.setTo(email);
    message.setSubject("Votre mot de passe Tricity a été modifié");
    message.setText("""
        Bonjour %s,

        Le mot de passe de votre compte Tricity a été modifié.

        Email : %s
        Nouveau mot de passe : %s

        Si vous n'êtes pas à l'origine de cette modification, contactez immédiatement le support ACCENT.
        """.formatted(name, email, newPassword));
    sender.send(message);
  }
}
