package se.persandstrom.nopestradamus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.stereotype.Controller;

@Controller
@EnableAutoConfiguration
@ComponentScan
public class Main {

	public static void main(String[] args) throws Exception {
		SpringApplication.run(Main.class, args);
		System.out.println("start");
	}
}