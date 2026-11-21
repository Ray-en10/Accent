package com.accent.tricity.request;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "customer_requests")
public class CustomerRequest {
  public enum Status { PENDING, CONFIRMED, REJECTED }

  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @Column(nullable = false) private String name;
  @Column(nullable = false) private String phone;
  @Column(nullable = false) private String email;
  @Column(nullable = false) private String governorate;
  @Column(nullable = false) private String city;
  @Column(nullable = false) private String address;
  @Column(nullable = false) private String customerType;
  @Column(nullable = false) private String meter;
  @Column(nullable = false) private String payment;
  @Column(length = 1000) private String notes;
  @Column(nullable = false) private int soloQuantity;
  @Column(nullable = false) private int duoQuantity;
  @Enumerated(EnumType.STRING) @Column(nullable = false) private Status status = Status.PENDING;
  @Column(nullable = false) private Instant createdAt = Instant.now();

  protected CustomerRequest() {}

  public CustomerRequest(String name, String phone, String email, String governorate, String city, String address,
                         String customerType, String meter, String payment, String notes, int soloQuantity, int duoQuantity) {
    this.name = name;
    this.phone = phone;
    this.email = email;
    this.governorate = governorate;
    this.city = city;
    this.address = address;
    this.customerType = customerType;
    this.meter = meter;
    this.payment = payment;
    this.notes = notes;
    this.soloQuantity = soloQuantity;
    this.duoQuantity = duoQuantity;
  }

  public Long getId() { return id; }
  public String getName() { return name; }
  public String getPhone() { return phone; }
  public String getEmail() { return email; }
  public String getGovernorate() { return governorate; }
  public String getCity() { return city; }
  public String getAddress() { return address; }
  public String getCustomerType() { return customerType; }
  public String getMeter() { return meter; }
  public String getPayment() { return payment; }
  public String getNotes() { return notes; }
  public int getSoloQuantity() { return soloQuantity; }
  public int getDuoQuantity() { return duoQuantity; }
  public Status getStatus() { return status; }
  public Instant getCreatedAt() { return createdAt; }
  public void setStatus(Status status) { this.status = status; }
}
