package com.aplicativopagoescuela.backend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import com.aplicativopagoescuela.backend.service.UserService;

@SpringBootApplication
public class BackendApplication implements CommandLineRunner {

	private final UserService userService;

	public BackendApplication(UserService userService) {
		this.userService = userService;
	}

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
		userService.encryptExistingPasswords();
	}

}
