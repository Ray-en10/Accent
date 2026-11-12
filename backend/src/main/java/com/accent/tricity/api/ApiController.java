package com.accent.tricity.api;

import com.accent.tricity.user.User;
import com.accent.tricity.user.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200")
public class ApiController {
  private final UserRepository users;
  public ApiController(UserRepository users) { this.users = users; }
  public record AuthRequest(@NotBlank @Email String email, @NotBlank String password) {}
  public record RegisterRequest(@NotBlank String name, @NotBlank @Email String email, @NotBlank String password) {}
  public record AccountRequest(@NotBlank String name, @NotBlank @Email String email, @NotNull User.Role role, @NotBlank String password) {}
  public record UserResponse(Long id, String name, String email, User.Role role) {}
  public record Dashboard(long totalConsumption, long activeSites, long alerts, List<Integer> chart, List<AccountRow> recentAccounts) {}
  public record AccountRow(String name, String email, String role, String createdAt) {}

  @PostMapping("/auth/login")
  public ResponseEntity<UserResponse> login(@Valid @RequestBody AuthRequest request) {
    return users.findByEmailIgnoreCase(request.email()).filter(user -> user.getPassword().equals(request.password()))
      .map(user -> ResponseEntity.ok(toResponse(user))).orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
  }
  @PostMapping("/auth/register")
  public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
    if (users.findByEmailIgnoreCase(request.email()).isPresent()) return ResponseEntity.status(HttpStatus.CONFLICT).build();
    return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(users.save(new User(request.name(), request.email(), request.password(), User.Role.CLIENT))));
  }
  @GetMapping("/admin/dashboard")
  public Dashboard dashboard() {
    List<AccountRow> rows = users.findAll().stream().sorted((a,b) -> b.getCreatedAt().compareTo(a.getCreatedAt())).limit(5)
      .map(user -> new AccountRow(user.getName(), user.getEmail(), roleLabel(user.getRole()), user.getCreatedAt().toString().substring(0, 10))).toList();
    return new Dashboard(48260, 1248, 17, List.of(42, 48, 39, 62, 54, 66, 58, 72, 64, 81, 69, 76, 83, 61, 74, 88, 78, 91, 73, 84, 79, 94, 86, 90, 82, 95, 89, 92, 87, 96), rows);
  }
  @PostMapping("/admin/accounts")
  public ResponseEntity<Void> createAccount(@Valid @RequestBody AccountRequest request) {
    if (users.findByEmailIgnoreCase(request.email()).isPresent()) return ResponseEntity.status(HttpStatus.CONFLICT).build();
    users.save(new User(request.name(), request.email(), request.password(), request.role()));
    return ResponseEntity.status(HttpStatus.CREATED).build();
  }
  @GetMapping("/admin/accounts")
  public List<UserResponse> listAccounts() {
    return users.findAll().stream().map(this::toResponse).toList();
  }
  @GetMapping("/admin/accounts/{id}")
  public ResponseEntity<UserResponse> getAccount(@PathVariable Long id) {
    return users.findById(id).map(user -> ResponseEntity.ok(toResponse(user)))
      .orElseGet(() -> ResponseEntity.notFound().build());
  }
  @PutMapping("/admin/accounts/{id}")
  public ResponseEntity<UserResponse> updateAccount(@PathVariable Long id, @Valid @RequestBody AccountRequest request) {
    Optional<User> existingEmail = users.findByEmailIgnoreCase(request.email());
    if (existingEmail.isPresent() && !existingEmail.get().getId().equals(id)) return ResponseEntity.status(HttpStatus.CONFLICT).build();
    return users.findById(id).map(user -> {
      user.update(request.name(), request.email(), request.password(), request.role());
      return ResponseEntity.ok(toResponse(users.save(user)));
    }).orElseGet(() -> ResponseEntity.notFound().build());
  }
  @DeleteMapping("/admin/accounts/{id}")
  public ResponseEntity<Void> deleteAccount(@PathVariable Long id) {
    if (!users.existsById(id)) return ResponseEntity.notFound().build();
    users.deleteById(id);
    return ResponseEntity.noContent().build();
  }
  private UserResponse toResponse(User user) { return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole()); }
  private String roleLabel(User.Role role) { return Map.of(User.Role.ADMIN, "Back-office", User.Role.CLIENT, "Client", User.Role.INSTALLER, "Installateur").get(role); }
}
