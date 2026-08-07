package com.zoadex.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.web.client.RestClient;

@Configuration
@EnableAsync
public class AppConfig {

    @Bean
    public RestClient restClient() {
        return RestClient.create();
    }
}
