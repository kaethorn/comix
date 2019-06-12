package de.wasenweg.alfred.security;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Optional;

public class JwtFilter implements Filter {

    private static final String HEADER_PREFIX = "Bearer ";

    private String secret;

    private IJwtService jwtService;

    public JwtFilter(final String secret, final IJwtService jwtService) {
        this.secret = secret;
        this.jwtService = jwtService;
    }

    @Override
    public void destroy() {
    }

    @Override
    public void doFilter(
            final ServletRequest req,
            final ServletResponse res,
            final FilterChain chain) throws IOException, ServletException {

        final HttpServletRequest request = (HttpServletRequest) req;
        final HttpServletResponse response = (HttpServletResponse) res;

        final Optional<String> token = Optional.ofNullable(request.getHeader("Authorization"));

        if (!token.isPresent() || !token.get().startsWith(HEADER_PREFIX)) {
            res.reset();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        if (this.jwtService.verifyToken(token.get().replace(HEADER_PREFIX, ""), this.secret)) {
            chain.doFilter(req, res);
        } else {
            res.reset();
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        }
    }

    @Override
    public void init(final FilterConfig arg0) throws ServletException {
    }
}