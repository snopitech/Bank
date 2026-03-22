package com.snopitech.snopitechbank;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import com.snopitech.snopitechbank.repository.AlertRepository;

@SpringBootApplication
@EntityScan("com.snopitech.snopitechbank.model")
@EnableJpaRepositories("com.snopitech.snopitechbank.repository")
public class SnopitechbankApplication {

	public static void main(String[] args) {
		SpringApplication.run(SnopitechbankApplication.class, args);
	}

	@Bean
	public CommandLineRunner demo(AlertRepository alertRepository) {
		return args -> {
			System.out.println("=== CHECKING IF ALERT REPOSITORY WORKS ===");
			System.out.println("AlertRepository class: " + alertRepository.getClass().getName());
			System.out.println("=== END ===");
		};
	}
}