package com.eduverse.service.impl;

import com.eduverse.dto.request.CreateStudentRequest;
import com.eduverse.dto.response.BulkImportResponse;
import com.eduverse.exception.BadRequestException;
import com.eduverse.service.StudentService;
import com.eduverse.entity.Gender;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.io.Reader;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentBulkImportService {

    private final StudentService studentService;

    public BulkImportResponse bulkImport(Long institutionId, MultipartFile file) {
        String filename = file.getOriginalFilename();
        if (filename == null || (!filename.endsWith(".csv") && !filename.endsWith(".xlsx") && !filename.endsWith(".xls"))) {
            throw new BadRequestException("Only CSV and Excel files are supported");
        }

        List<String> errors = new ArrayList<>();
        int successCount = 0;
        int totalRecords = 0;

        try {
            if (filename.endsWith(".csv")) {
                try (Reader reader = new InputStreamReader(file.getInputStream());
                     CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT.withFirstRecordAsHeader().withIgnoreHeaderCase().withTrim())) {
                    for (CSVRecord record : csvParser) {
                        totalRecords++;
                        try {
                            CreateStudentRequest request = parseCsvRecord(record);
                            studentService.create(institutionId, request);
                            successCount++;
                        } catch (Exception e) {
                            errors.add("Row " + totalRecords + ": " + e.getMessage());
                        }
                    }
                }
            } else {
                try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
                    Sheet sheet = workbook.getSheetAt(0);
                    boolean isHeader = true;
                    for (Row row : sheet) {
                        if (isHeader) {
                            isHeader = false;
                            continue;
                        }
                        if (row.getCell(0) == null || row.getCell(0).toString().trim().isEmpty()) {
                            continue;
                        }
                        totalRecords++;
                        try {
                            CreateStudentRequest request = parseExcelRow(row);
                            studentService.create(institutionId, request);
                            successCount++;
                        } catch (Exception e) {
                            errors.add("Row " + totalRecords + ": " + e.getMessage());
                        }
                    }
                }
            }
        } catch (Exception e) {
            throw new BadRequestException("Failed to parse file: " + e.getMessage());
        }

        return new BulkImportResponse(totalRecords, successCount, totalRecords - successCount, errors);
    }

    private CreateStudentRequest parseCsvRecord(CSVRecord record) {
        Gender gender = null;
        if (record.isSet("Gender") && !record.get("Gender").isBlank()) {
            try {
                gender = Gender.valueOf(record.get("Gender").toUpperCase());
            } catch (Exception e) {
                // ignore or leave null
            }
        }

        return new CreateStudentRequest(
                record.isSet("FullName") ? record.get("FullName") : "",
                record.isSet("Email") ? record.get("Email") : "",
                record.isSet("Username") ? record.get("Username") : null,
                null,
                record.isSet("Phone") ? record.get("Phone") : null,
                record.isSet("AdmissionNumber") ? record.get("AdmissionNumber") : "",
                null,
                record.isSet("RollNumber") ? record.get("RollNumber") : null,
                gender,
                null,
                null,
                null,
                record.isSet("GuardianName") ? record.get("GuardianName") : null,
                record.isSet("GuardianPhone") ? record.get("GuardianPhone") : null,
                record.isSet("Address") ? record.get("Address") : null,
                record.isSet("BloodGroup") ? record.get("BloodGroup") : null,
                null,
                null,
                null,
                null,
                null
        );
    }

    private CreateStudentRequest parseExcelRow(Row row) {
        String fullName = getCellValue(row, 0);
        String email = getCellValue(row, 1);
        String username = getCellValue(row, 2);
        String phone = getCellValue(row, 3);
        String admissionNumber = getCellValue(row, 4);
        String rollNumber = getCellValue(row, 5);
        String genderStr = getCellValue(row, 6);
        String guardianName = getCellValue(row, 7);
        String guardianPhone = getCellValue(row, 8);
        String address = getCellValue(row, 9);
        String bloodGroup = getCellValue(row, 10);

        if (fullName == null || fullName.isBlank()) throw new RuntimeException("FullName is required");
        if (email == null || email.isBlank()) throw new RuntimeException("Email is required");
        if (admissionNumber == null || admissionNumber.isBlank()) throw new RuntimeException("AdmissionNumber is required");

        Gender gender = null;
        if (genderStr != null && !genderStr.isBlank()) {
            try {
                gender = Gender.valueOf(genderStr.toUpperCase());
            } catch (Exception e) {
                // ignore
            }
        }

        return new CreateStudentRequest(
                fullName,
                email,
                username,
                null,
                phone,
                admissionNumber,
                null,
                rollNumber,
                gender,
                null,
                null,
                null,
                guardianName,
                guardianPhone,
                address,
                bloodGroup,
                null,
                null,
                null,
                null,
                null
        );
    }

    private String getCellValue(Row row, int cellIndex) {
        org.apache.poi.ss.usermodel.Cell cell = row.getCell(cellIndex);
        if (cell == null) return null;
        return cell.toString().trim();
    }
}
