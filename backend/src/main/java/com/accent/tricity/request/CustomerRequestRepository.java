package com.accent.tricity.request;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRequestRepository extends JpaRepository<CustomerRequest, Long> {
  List<CustomerRequest> findAllByOrderByCreatedAtDesc();
}
