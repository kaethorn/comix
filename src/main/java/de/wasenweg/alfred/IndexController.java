package de.wasenweg.alfred;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class IndexController implements ErrorController {

  private static final String ERROR_PATH = "/error";

  @RequestMapping(ERROR_PATH)
  public String error() {
    return "forward:/index.html";
  }

  @Override
  public String getErrorPath() {
    return ERROR_PATH;
  }
}
