package com.arenahub.config;

import com.arenahub.security.AuthInterceptor;
import com.arenahub.security.UtenteLoggatoResolver;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final AuthInterceptor authInterceptor;
    private final UtenteLoggatoResolver utenteLoggatoResolver;

    @Value("${app.upload.cartella}")
    private String cartella;

    @Value("${app.cors.origini}")
    private String origini;

    public WebConfig(AuthInterceptor authInterceptor, UtenteLoggatoResolver utenteLoggatoResolver) {
        this.authInterceptor = authInterceptor;
        this.utenteLoggatoResolver = utenteLoggatoResolver;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor).addPathPatterns("/api/**");
    }

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(utenteLoggatoResolver);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(origini.split(","))
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("Authorization", "Content-Type");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path percorso = Paths.get(cartella).toAbsolutePath().normalize();
        String uri = percorso.toUri().toString();
        if (!uri.endsWith("/")) {
            uri = uri + "/";
        }
        registry.addResourceHandler("/uploads/**").addResourceLocations(uri);
    }
}
