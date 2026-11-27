package com.accent.tricity.api;

import com.accent.tricity.user.User;
import com.accent.tricity.user.UserRepository;
import com.accent.tricity.mail.AccountMailService;
import com.accent.tricity.request.CustomerRequest;
import com.accent.tricity.request.CustomerRequestRepository;
import com.accent.tricity.circuit.ClientCircuitEntity;
import com.accent.tricity.circuit.ClientCircuitRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.security.SecureRandom;
import org.springframework.mail.MailException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200")
public class ApiController {
  private final UserRepository users;
  private final PasswordEncoder passwordEncoder;
  private final AccountMailService accountMail;
  private final CustomerRequestRepository requests;
  private final ClientCircuitRepository circuits;
  private static final String PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  private final SecureRandom random = new SecureRandom();
  public ApiController(UserRepository users, PasswordEncoder passwordEncoder, AccountMailService accountMail, CustomerRequestRepository requests, ClientCircuitRepository circuits) {
    this.users = users;
    this.passwordEncoder = passwordEncoder;
    this.accountMail = accountMail;
    this.requests = requests;
    this.circuits = circuits;
  }
  public record AuthRequest(@NotBlank @Email String email, @NotBlank String password) {}
  public record RegisterRequest(@NotBlank String name, @NotBlank @Email String email, @NotBlank String password) {}
  public record AccountRequest(@NotBlank String name, @NotBlank @Email String email, @NotNull User.Role role, User.Status status,
      String phone, String governorate, String city, String address, String meterType, Integer circuitCount, String subscribedPower) {}
  public record UserResponse(Long id, String name, String email, User.Role role, User.Status status,
      String phone, String governorate, String city, String address, String meterType, Integer circuitCount, String subscribedPower) {}
  public record PasswordChangeRequest(@NotBlank String currentPassword, @NotBlank String newPassword) {}
  public record PasswordResetRequest(@NotBlank @Email String email) {}
  public record CircuitPayload(@NotBlank String name, @NotBlank String meter, @NotBlank String type, int goal, String equipment) {}
  public record CircuitResponse(Long id, String name, String meter, String type, int goal, String equipment) {}
  public record Dashboard(long totalConsumption, long activeSites, long alerts, List<Integer> chart, List<AccountRow> recentAccounts) {}
  public record AccountRow(String name, String email, String role, String createdAt) {}
  public record ConsumptionRegion(String id, String name, long consumption, long sites, int change, List<ConsumptionPlace> places) {}
  public record ConsumptionPlace(String name, long consumption, String status, String updatedAt) {}
  public record ClientDashboard(String greeting, long todayConsumption, long dailyGoal, long cycleConsumption, long cycleGoal, int progress, List<Integer> hourly, List<ClientCircuit> circuits, List<String> alerts) {}
  public record ClientCircuit(String name, long consumption, int share, String trend) {}
  public record CustomerRequestPayload(@NotBlank String name, @NotBlank String phone, @NotBlank @Email String email,
      @NotBlank String governorate, @NotBlank String city, @NotBlank String address, @NotBlank String customerType,
      @NotBlank String meter, @NotBlank String payment, String notes, int soloQuantity, int duoQuantity) {}
  public record CustomerRequestResponse(Long id, String name, String phone, String email, String governorate, String city,
      String address, String customerType, String meter, String payment, String notes, int soloQuantity, int duoQuantity,
      CustomerRequest.Status status, String createdAt) {}

  @PostMapping("/auth/login")
  public ResponseEntity<UserResponse> login(@Valid @RequestBody AuthRequest request) {
    return users.findByEmailIgnoreCase(request.email()).filter(user -> passwordEncoder.matches(request.password(), user.getPassword()))
      .map(user -> ResponseEntity.ok(toResponse(user))).orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
  }
  @GetMapping("/health")
  public Map<String, String> health() {
    return Map.of("status", "ok");
  }
  @PostMapping("/auth/password/reset")
  public ResponseEntity<Void> resetPassword(@Valid @RequestBody PasswordResetRequest request) {
    Optional<User> found = users.findByEmailIgnoreCase(request.email());
    if (found.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

    User user = found.get();
    String temporaryPassword = generatePassword();
    user.setPassword(passwordEncoder.encode(temporaryPassword));
    users.save(user);
    try {
      accountMail.sendPasswordReset(user.getName(), user.getEmail(), temporaryPassword);
      return ResponseEntity.ok().build();
    } catch (MailException exception) {
      return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
    }
  }
  @PostMapping("/auth/register")
  public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
    if (users.findByEmailIgnoreCase(request.email()).isPresent()) return ResponseEntity.status(HttpStatus.CONFLICT).build();
    User client = new User(request.name(), request.email(), passwordEncoder.encode(request.password()), User.Role.CLIENT);
    client.setProfile(null, "Tunis", "La Marsa", null, "Monophasé", 4, "9 kVA");
    client = users.save(client);
    seedDefaultCircuits(client);
    return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(client));
  }
  @PostMapping("/requests")
  public ResponseEntity<CustomerRequestResponse> createRequest(@Valid @RequestBody CustomerRequestPayload payload) {
    if (payload.soloQuantity() < 0 || payload.duoQuantity() < 0 || payload.soloQuantity() + payload.duoQuantity() == 0) {
      return ResponseEntity.badRequest().build();
    }
    CustomerRequest request = requests.save(new CustomerRequest(payload.name(), payload.phone(), payload.email(), payload.governorate(),
      payload.city(), payload.address(), payload.customerType(), payload.meter(), payload.payment(), payload.notes(),
      payload.soloQuantity(), payload.duoQuantity()));
    return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(request));
  }
  @GetMapping("/admin/dashboard")
  public Dashboard dashboard() {
    List<AccountRow> rows = users.findAll().stream().sorted((a,b) -> b.getCreatedAt().compareTo(a.getCreatedAt())).limit(5)
      .map(user -> new AccountRow(user.getName(), user.getEmail(), roleLabel(user.getRole()), user.getCreatedAt().toString().substring(0, 10))).toList();
    return new Dashboard(48260, 1248, 17, List.of(42, 48, 39, 62, 54, 66, 58, 72, 64, 81, 69, 76, 83, 61, 74, 88, 78, 91, 73, 84, 79, 94, 86, 90, 82, 95, 89, 92, 87, 96), rows);
  }
  @PostMapping("/admin/accounts")
  public ResponseEntity<UserResponse> createAccount(@Valid @RequestBody AccountRequest request) {
    if (users.findByEmailIgnoreCase(request.email()).isPresent()) return ResponseEntity.status(HttpStatus.CONFLICT).build();
    String temporaryPassword = generatePassword();
    try {
      accountMail.sendCredentials(request.name(), request.email(), temporaryPassword);
    } catch (MailException exception) {
      return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
    }
    User user = new User(request.name(), request.email(), passwordEncoder.encode(temporaryPassword), request.role());
    if (request.status() == User.Status.INACTIVE) user.setStatus(User.Status.INACTIVE);
    user.setProfile(request.phone(), request.governorate(), request.city(), request.address(),
      request.meterType(), request.circuitCount(), request.subscribedPower());
    user = users.save(user);
    if (request.role() == User.Role.CLIENT) seedDefaultCircuits(user);
    return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(user));
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
      user.update(request.name(), request.email(), user.getPassword(), request.role(), request.status() == null ? user.getStatus() : request.status());
      user.setProfile(request.phone(), request.governorate(), request.city(), request.address(),
        request.meterType() == null ? user.getMeterType() : request.meterType(),
        request.circuitCount() == null ? user.getCircuitCount() : request.circuitCount(),
        request.subscribedPower() == null ? user.getSubscribedPower() : request.subscribedPower());
      return ResponseEntity.ok(toResponse(users.save(user)));
    }).orElseGet(() -> ResponseEntity.notFound().build());
  }
  @DeleteMapping("/admin/accounts/{id}")
  public ResponseEntity<Void> deleteAccount(@PathVariable Long id) {
    if (!users.existsById(id)) return ResponseEntity.notFound().build();
    users.deleteById(id);
    return ResponseEntity.noContent().build();
  }
  @GetMapping("/admin/requests")
  public List<CustomerRequestResponse> listRequests() {
    return requests.findAllByOrderByCreatedAtDesc().stream()
      .filter(request -> request.getStatus() != CustomerRequest.Status.CONFIRMED)
      .map(this::toResponse).toList();
  }
  @PatchMapping("/admin/requests/{id}/status")
  public ResponseEntity<CustomerRequestResponse> updateRequestStatus(@PathVariable Long id, @RequestParam CustomerRequest.Status status) {
    Optional<CustomerRequest> found = requests.findById(id);
    if (found.isEmpty()) return ResponseEntity.notFound().build();
    CustomerRequest request = found.get();
    if (status == CustomerRequest.Status.CONFIRMED && request.getStatus() != CustomerRequest.Status.CONFIRMED) {
      if (users.findByEmailIgnoreCase(request.getEmail()).isPresent()) return ResponseEntity.status(HttpStatus.CONFLICT).build();
      String temporaryPassword = generatePassword();
      try {
        accountMail.sendCredentials(request.getName(), request.getEmail(), temporaryPassword);
      } catch (MailException exception) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
      }
      User client = new User(request.getName(), request.getEmail(), passwordEncoder.encode(temporaryPassword), User.Role.CLIENT);
      int circuitCount = request.getSoloQuantity() > 0 ? 4 : 4;
      String meterType = "Je ne sais pas".equalsIgnoreCase(request.getMeter()) ? "Monophasé" : request.getMeter();
      client.setProfile(request.getPhone(), request.getGovernorate(), request.getCity(), request.getAddress(),
        meterType, circuitCount, "9 kVA");
      client = users.save(client);
      seedDefaultCircuits(client);
    }
    request.setStatus(status);
    return ResponseEntity.ok(toResponse(requests.save(request)));
  }
  private UserResponse toResponse(User user) { return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getStatus(),
    user.getPhone(), user.getGovernorate(), user.getCity(), user.getAddress(), user.getMeterType(),
    user.getCircuitCount() == null ? 4 : user.getCircuitCount(), user.getSubscribedPower() == null ? "9 kVA" : user.getSubscribedPower()); }
  private CustomerRequestResponse toResponse(CustomerRequest request) {
    return new CustomerRequestResponse(request.getId(), request.getName(), request.getPhone(), request.getEmail(),
      request.getGovernorate(), request.getCity(), request.getAddress(), request.getCustomerType(), request.getMeter(),
      request.getPayment(), request.getNotes(), request.getSoloQuantity(), request.getDuoQuantity(), request.getStatus(),
      request.getCreatedAt().toString().substring(0, 10));
  }
  private String roleLabel(User.Role role) { return Map.of(User.Role.ADMIN, "Back-office", User.Role.CLIENT, "Client", User.Role.INSTALLER, "Installateur", User.Role.NETWORK_MANAGER, "Responsable réseau").get(role); }
  private String generatePassword() {
    StringBuilder password = new StringBuilder(12);
    for (int i = 0; i < 12; i++) password.append(PASSWORD_CHARS.charAt(random.nextInt(PASSWORD_CHARS.length())));
    return password.toString();
  }

  @GetMapping("/admin/consumption/regions")
  public List<ConsumptionRegion> consumptionByRegion() {
    return regions();
  }

  @GetMapping("/admin/consumption/regions/{id}")
  public ResponseEntity<ConsumptionRegion> consumptionRegion(@PathVariable String id) {
    return regions().stream().filter(region -> region.id().equals(id)).findFirst()
      .map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
  }

  @PutMapping("/auth/users/{id}/password")
  public ResponseEntity<UserResponse> changePassword(@PathVariable Long id, @Valid @RequestBody PasswordChangeRequest request) {
    Optional<User> found = users.findById(id);
    if (found.isEmpty()) return ResponseEntity.notFound().build();
    User user = found.get();
    if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
    if (request.newPassword().length() < 8) return ResponseEntity.badRequest().build();
    user.setPassword(passwordEncoder.encode(request.newPassword()));
    users.save(user);
    try {
      accountMail.sendPasswordChanged(user.getName(), user.getEmail(), request.newPassword());
    } catch (MailException exception) {
      // Le mot de passe est valide même si le serveur SMTP est temporairement indisponible.
    }
    return ResponseEntity.ok(toResponse(user));
  }

  @GetMapping("/client/{userId}/circuits")
  public List<CircuitResponse> getCircuits(@PathVariable Long userId) {
    return circuits.findByUserIdOrderByIdAsc(userId).stream().map(this::toCircuit).toList();
  }

  @PostMapping("/client/{userId}/circuits")
  public ResponseEntity<CircuitResponse> addCircuit(@PathVariable Long userId, @Valid @RequestBody CircuitPayload payload) {
    if (!users.existsById(userId)) return ResponseEntity.notFound().build();
    if (circuits.findByUserIdOrderByIdAsc(userId).size() >= 8) return ResponseEntity.badRequest().build();
    ClientCircuitEntity circuit = new ClientCircuitEntity(userId, payload.name(), payload.meter(), payload.type(), payload.goal(), payload.equipment());
    return ResponseEntity.status(HttpStatus.CREATED).body(toCircuit(circuits.save(circuit)));
  }

  @PutMapping("/client/{userId}/circuits/{circuitId}")
  public ResponseEntity<CircuitResponse> updateCircuit(@PathVariable Long userId, @PathVariable Long circuitId, @Valid @RequestBody CircuitPayload payload) {
    return circuits.findById(circuitId)
      .filter(circuit -> circuit.getUserId().equals(userId))
      .map(circuit -> {
        circuit.update(payload.name(), payload.meter(), payload.type(), payload.goal(), payload.equipment());
        return ResponseEntity.ok(toCircuit(circuits.save(circuit)));
      }).orElseGet(() -> ResponseEntity.notFound().build());
  }

  @DeleteMapping("/client/{userId}/circuits/{circuitId}")
  public ResponseEntity<Void> deleteCircuit(@PathVariable Long userId, @PathVariable Long circuitId) {
    Optional<ClientCircuitEntity> circuit = circuits.findById(circuitId);
    if (circuit.isEmpty() || !circuit.get().getUserId().equals(userId)) return ResponseEntity.notFound().build();
    circuits.deleteById(circuitId);
    return ResponseEntity.noContent().build();
  }

  private CircuitResponse toCircuit(ClientCircuitEntity circuit) {
    return new CircuitResponse(circuit.getId(), circuit.getName(), circuit.getMeter(), circuit.getType(), circuit.getGoal(), circuit.getEquipment());
  }

  private void seedDefaultCircuits(User user) {
    if (circuits.findByUserIdOrderByIdAsc(user.getId()).isEmpty()) {
      circuits.save(new ClientCircuitEntity(user.getId(), "Éclairage", "Compteur 1", "Mesuré", 120, "Éclairage intérieur, Éclairage extérieur"));
      circuits.save(new ClientCircuitEntity(user.getId(), "Prises", "Compteur 1", "Mesuré", 150, "Réfrigérateur, Télévision, Lave-linge"));
      circuits.save(new ClientCircuitEntity(user.getId(), "Climatisation", "Compteur 1", "Mesuré", 100, "Climatiseur salon, Climatiseur chambre"));
      circuits.save(new ClientCircuitEntity(user.getId(), "Autres", "Compteur 1", "Calculé", 60, "Autres appareils"));
    }
  }

  @GetMapping("/client/dashboard")
  public ClientDashboard clientDashboard(@RequestParam(defaultValue = "Client") String name) {
    return new ClientDashboard(name, 18, 30, 412, 620, 66,
      List.of(8, 12, 14, 18, 24, 31, 38, 42, 48, 45, 50, 57, 61, 58, 64, 70, 67, 74, 80, 72, 65, 53, 38, 21),
      List.of(new ClientCircuit("Éclairage", 112, 27, "-4,2%"), new ClientCircuit("Prises", 164, 40, "+2,1%"),
        new ClientCircuit("Climatisation", 86, 21, "-8,7%"), new ClientCircuit("Autres", 50, 12, "+0,4%")),
      List.of("Votre consommation est dans l'objectif journalier", "Le cycle STEG est à 66% de son objectif"));
  }

  private List<ConsumptionRegion> regions() {
    return List.of(
      new ConsumptionRegion("tunis", "Tunis", 18420, 412, -8, List.of(
        new ConsumptionPlace("La Marsa", 4860, "stable", "Il y a 2 min"),
        new ConsumptionPlace("Gammart", 3720, "attention", "Il y a 1 min"),
        new ConsumptionPlace("Lac 1", 9840, "stable", "Il y a 3 min"))),
      new ConsumptionRegion("sousse", "Sousse", 12680, 287, -3, List.of(
        new ConsumptionPlace("Sahloul", 5440, "stable", "Il y a 2 min"),
        new ConsumptionPlace("Medina", 3980, "stable", "Il y a 4 min"),
        new ConsumptionPlace("Port El Kantaoui", 3260, "attention", "Il y a 1 min"))),
      new ConsumptionRegion("sfax", "Sfax", 10940, 201, 6, List.of(
        new ConsumptionPlace("Centre-ville", 4720, "stable", "Il y a 2 min"),
        new ConsumptionPlace("Sakiet Ezzit", 3380, "stable", "Il y a 5 min"),
        new ConsumptionPlace("Route de Tunis", 2840, "attention", "Il y a 1 min"))));
  }
}
