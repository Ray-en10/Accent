package com.accent.tricity.circuit;

import jakarta.persistence.*;

@Entity
@Table(name = "client_circuits")
public class ClientCircuitEntity {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  @Column(nullable = false) private Long userId;
  @Column(nullable = false) private String name;
  @Column(nullable = false) private String meter;
  @Column(nullable = false) private String type;
  @Column(nullable = false) private int goal;
  @Column(length = 2000) private String equipment;

  protected ClientCircuitEntity() {}

  public ClientCircuitEntity(Long userId, String name, String meter, String type, int goal, String equipment) {
    this.userId = userId; this.name = name; this.meter = meter; this.type = type; this.goal = goal; this.equipment = equipment;
  }

  public Long getId() { return id; }
  public Long getUserId() { return userId; }
  public String getName() { return name; }
  public String getMeter() { return meter; }
  public String getType() { return type; }
  public int getGoal() { return goal; }
  public String getEquipment() { return equipment; }
  public void update(String name, String meter, String type, int goal, String equipment) {
    this.name = name; this.meter = meter; this.type = type; this.goal = goal; this.equipment = equipment;
  }
}
