package com.arenahub.Controller;

import com.arenahub.Service.ServiceHome;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ControllerHome {

    private final ServiceHome homeService;

    public ControllerHome(ServiceHome homeService) {
        this.homeService = homeService;
    }

    @GetMapping("/")
    public String home() {
        return homeService.messaggioBenvenuto();
    }
}