package com.accent.tricity.user;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "users")
public class User {
  public enum Role { ADMIN, CLIENT, INSTALLER, NETWORK_MANAGER }
  public enum Status { ACTIVE, INACTIVE }
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @Column(nullable = false) private String name;
  @Column(nullable = false, unique = true) private String email;
  @Column(nullable = false) private String password;
  @Enumerated(EnumType.STRING) @Column(nullable = false) private Role role;
  @Enumerated(EnumType.STRING) @Column private Status status = Status.ACTIVE;
  @Column private String phone;
  @Column private String governorate;
  @Column private String city;
  @Column private String address;
  @Column private String meterType;
  @Column private Integer circuitCount;
  @Column private String subscribedPower;
  @Column(nullable = false) private Instant createdAt = Instant.now();
  protected User() {}
  public User(String name, String email, String password, Role role) { this.name = name; this.email = email; this.password = password; this.role = role; }
  public Long getId() { return id; } public String getName() { return name; } public String getEmail() { return email; } public String getPassword() { return password; } public Role getRole() { return role; } public Status getStatus() { return status == null ? Status.ACTIVE : status; } public String getPhone() { return phone; } public String getGovernorate() { return governorate; } public String getCity() { return city; } public String getAddress() { return address; } public String getMeterType() { return meterType; } public Integer getCircuitCount() { return circuitCount; } public String getSubscribedPower() { return subscribedPower; } public Instant getCreatedAt() { return createdAt; }
  public void setStatus(Status status) { this.status = status; }
  public void update(String name, String email, String password, Role role, Status status) { this.name = name; this.email = email; this.password = password; this.role = role; this.status = status; }
  public void setProfile(String phone, String governorate, String city, String address, String meterType, Integer circuitCount, String subscribedPower) {
    this.phone = phone; this.governorate = governorate; this.city = city; this.address = address;
    this.meterType = meterType; this.circuitCount = circuitCount; this.subscribedPower = subscribedPower;
  }
  public void setPassword(String password) { this.password = password; }
}
