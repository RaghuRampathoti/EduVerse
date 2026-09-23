package com.eduverse;

import org.junit.jupiter.api.Test;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class DatabaseTableCheckTest {

    @Test
    public void testCheckTablesInDatabase() {
        String url = "jdbc:postgresql://localhost:5432/sch_db";
        String user = "postgres";
        String pass = "1441";

        try (Connection conn = DriverManager.getConnection(url, user, pass)) {
            System.out.println("=== CONNECTED TO POSTGRESQL SCH_DB SUCCESSFULLY ===");
            ResultSet rs = conn.getMetaData().getTables("sch_db", "public", "%", new String[]{"TABLE"});
            List<String> tables = new ArrayList<>();
            while (rs.next()) {
                tables.add(rs.getString("TABLE_NAME"));
            }
            tables.sort(String::compareTo);
            System.out.println("Total tables found in database: " + tables.size());
            System.out.println("Tables list:");
            for (String table : tables) {
                System.out.println(" - " + table);
            }
        } catch (Exception e) {
            System.err.println("Could not connect to DB: " + e.getMessage());
        }
    }
}
