package com.accent.tricity.circuit;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientCircuitRepository extends JpaRepository<ClientCircuitEntity, Long> {
  List<ClientCircuitEntity> findByUserIdOrderByIdAsc(Long userId);
}
