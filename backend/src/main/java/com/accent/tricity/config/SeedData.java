package com.accent.tricity.config;

import com.accent.tricity.user.User;
import com.accent.tricity.user.UserRepository;
import com.accent.tricity.circuit.ClientCircuitEntity;
import com.accent.tricity.circuit.ClientCircuitRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SeedData {
  @Bean
  CommandLineRunner seedAdmin(UserRepository users, PasswordEncoder encoder, ClientCircuitRepository circuits) {
    return args -> {
      users.findByEmailIgnoreCase("admin@admin.com")
        .map(user -> {
          user.update("Admin ACCENT", "admin@admin.com", encoder.encode("mdp admin"), User.Role.ADMIN, User.Status.ACTIVE);
          return users.save(user);
        })
        .orElseGet(() -> users.save(new User("Admin ACCENT", "admin@admin.com", encoder.encode("mdp admin"), User.Role.ADMIN)));
      users.findAll().stream().filter(user -> user.getRole() == User.Role.CLIENT).forEach(user -> {
        if (circuits.findByUserIdOrderByIdAsc(user.getId()).isEmpty()) {
          circuits.save(new ClientCircuitEntity(user.getId(), "Éclairage", "Compteur 1", "Mesuré", 120, "Éclairage intérieur, Éclairage extérieur"));
          circuits.save(new ClientCircuitEntity(user.getId(), "Prises", "Compteur 1", "Mesuré", 150, "Réfrigérateur, Télévision, Lave-linge"));
          circuits.save(new ClientCircuitEntity(user.getId(), "Climatisation", "Compteur 1", "Mesuré", 100, "Climatiseur salon, Climatiseur chambre"));
          circuits.save(new ClientCircuitEntity(user.getId(), "Autres", "Compteur 1", "Calculé", 60, "Autres appareils"));
        }
      });
    };
  }
}
