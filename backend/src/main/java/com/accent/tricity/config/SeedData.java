package com.accent.tricity.config;

import com.accent.tricity.user.User;
import com.accent.tricity.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SeedData {
  @Bean
  CommandLineRunner seedAdmin(UserRepository users) {
    return args -> users.findByEmailIgnoreCase("admin@admin.com")
      .map(user -> {
        user.update("Admin ACCENT", "admin@admin.com", "mdp admin", User.Role.ADMIN);
        return users.save(user);
      })
      .orElseGet(() -> users.save(new User("Admin ACCENT", "admin@admin.com", "mdp admin", User.Role.ADMIN)));
  }
}
