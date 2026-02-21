package com.snopitech.snopitechbank.repository;

import com.snopitech.snopitechbank.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    // Find by email
    Optional<Employee> findByEmail(String email);

    // Find by employee ID
    Optional<Employee> findByEmployeeId(String employeeId);

    // Find by status
    List<Employee> findByStatus(String status);

    // Find pending employees
    List<Employee> findByStatusOrderByCreatedAtDesc(String status);

    // Find approved employees
    List<Employee> findByStatusAndIsActiveTrue(String status);

    // Find by department
    List<Employee> findByDepartment(String department);

    // Find by approval token
    Optional<Employee> findByApprovalToken(String token);

    // Search employees by name or email
    @Query("SELECT e FROM Employee e WHERE " +
           "LOWER(e.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(e.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(e.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "e.employeeId LIKE CONCAT('%', :searchTerm, '%')")
    List<Employee> searchEmployees(@Param("searchTerm") String searchTerm);

    // Count employees by status
    long countByStatus(String status);

    // Find employees who haven't logged in for a while
    @Query("SELECT e FROM Employee e WHERE e.lastLoginAt < :date OR e.lastLoginAt IS NULL")
    List<Employee> findInactiveEmployees(@Param("date") LocalDateTime date);

    // Find employees by role
    List<Employee> findByRoleContainingIgnoreCase(String role);

    // Check if email exists
    boolean existsByEmail(String email);

    // Check if employee ID exists
    boolean existsByEmployeeId(String employeeId);

    // Find recently approved employees
    List<Employee> findByApprovedAtAfterOrderByApprovedAtDesc(LocalDateTime date);
}