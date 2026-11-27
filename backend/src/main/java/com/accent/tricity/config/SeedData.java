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
      User clientDemo = seedDemoAccount(users, encoder, "Client Test", "client-test@gmail.com", "12345678",
        User.Role.CLIENT, "Tunis", "La Marsa", "Monophasé", 4, "9 kVA");
      seedDemoAccount(users, encoder, "Installer Test", "Installer-test@gmail.com", "12345678",
        User.Role.INSTALLER, "Tunis", "La Marsa", "Mono & Triphasé", null, null, null);
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

  private User seedDemoAccount(UserRepository users, PasswordEncoder encoder, String name, String email,
      String password, User.Role role, String governorate, String city, String meterType,
      Integer circuitCount, String subscribedPower) {
    return users.findByEmailIgnoreCase(email)
      .map(user -> {
        user.update(name, email, encoder.encode(password), role, User.Status.ACTIVE);
        user.setProfile(null, governorate, city, null, meterType, circuitCount, subscribedPower);
        return users.save(user);
      })
      .orElseGet(() -> {
        User user = new User(name, email, encoder.encode(password), role);
        user.setProfile(null, governorate, city, null, meterType, circuitCount, subscribedPower);
        return users.save(user);
      });
  }
}
