package com.google.sps.servlets;

import java.io.IOException;
import java.util.stream.Collectors;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Handles requests sent to the /hello URL. Try running a server and navigating
 * to /hello!
 */
@WebServlet("/user-workout-interests")
public class UserInterestsHandler extends HttpServlet {

    static final long serialVersionUID = 0;

    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {

        // grab query details frpom request
        // make some api call
        String test = request.getReader().lines().collect(Collectors.joining(System.lineSeparator()));

        // return results to response

        System.out.println("UserInterestsHandler.doGet() " + test);
        // // response.setContentType("application/json");
        // // Gson gson = new Gson();
        // // String json = gson.toJson(ufoSightings);
        // response.getWriter().println(json);

        response.setContentType("text/html;");
        response.getWriter().println("<h1>Hello world!</h1>");
    }
}
