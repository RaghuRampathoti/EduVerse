package com.eduverse.config;

import com.eduverse.entity.FacultyProfile;
import com.eduverse.entity.Institution;
import com.eduverse.entity.InstitutionStatus;
import com.eduverse.entity.InstitutionType;
import com.eduverse.entity.ParentProfile;
import com.eduverse.entity.Role;
import com.eduverse.entity.StudentProfile;
import com.eduverse.entity.User;
import com.eduverse.entity.UserStatus;
import com.eduverse.repository.FacultyProfileRepository;
import com.eduverse.repository.InstitutionRepository;
import com.eduverse.repository.ParentProfileRepository;
import com.eduverse.repository.StudentProfileRepository;
import com.eduverse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Seeds demo accounts for all roles (MASTER_ADMIN, SUPER_ADMIN, ADMIN, FACULTY, STUDENT, PARENT)
 * along with a default Institution and user profiles on boot.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;
    private final FacultyProfileRepository facultyProfileRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final ParentProfileRepository parentProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final MasterAdminProperties masterAdminProperties;
    private final com.eduverse.repository.SubscriptionPlanRepository subscriptionPlanRepository;
    private final com.eduverse.repository.InstitutionSubscriptionRepository institutionSubscriptionRepository;
    private final com.eduverse.repository.FeatureEntitlementRepository featureEntitlementRepository;
    private final com.eduverse.repository.SystemConfigRepository systemConfigRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (!masterAdminProperties.seedOnStartup()) {
            return;
        }

        // 1. Seed MASTER_ADMIN
        String masterEmail = masterAdminProperties.email();
        if (!userRepository.existsByEmail(masterEmail)) {
            User masterAdmin = User.builder()
                    .email(masterEmail)
                    .username("masteradmin")
                    .password(passwordEncoder.encode(masterAdminProperties.password()))
                    .fullName("Master Administrator")
                    .role(Role.MASTER_ADMIN)
                    .status(UserStatus.ACTIVE)
                    .institution(null)
                    .mustChangePassword(false)
                    .build();
            userRepository.save(masterAdmin);
            log.info("Seeded MASTER_ADMIN account -> {}", masterEmail);
        }

        // 2. Seed Default Demo Institution
        Institution institution = institutionRepository.findByCode("AIA001")
                .orElseGet(() -> {
                    Institution inst = Institution.builder()
                            .name("Apex International Academy")
                            .code("AIA001")
                            .type(InstitutionType.SCHOOL)
                            .status(InstitutionStatus.ACTIVE)
                            .email("info@apexacademy.edu")
                            .phone("+1-555-0199")
                            .address("123 Education Blvd")
                            .city("Metropolis")
                            .state("NY")
                            .country("USA")
                            .establishedYear(2010)
                            .maxStudents(1000)
                            .build();
                    return institutionRepository.save(inst);
                });

        // 3. Seed SUPER_ADMIN
        if (!userRepository.existsByEmail("superadmin@eduverse.com")) {
            User superAdmin = User.builder()
                    .email("superadmin@eduverse.com")
                    .username("superadmin")
                    .password(passwordEncoder.encode("SuperAdmin@123"))
                    .fullName("Super Administrator")
                    .role(Role.SUPER_ADMIN)
                    .status(UserStatus.ACTIVE)
                    .institution(institution)
                    .mustChangePassword(false)
                    .build();
            userRepository.save(superAdmin);
            log.info("Seeded SUPER_ADMIN account -> superadmin@eduverse.com");
        }

        // 4. Seed ADMIN
        if (!userRepository.existsByEmail("admin@eduverse.com")) {
            User admin = User.builder()
                    .email("admin@eduverse.com")
                    .username("admin")
                    .password(passwordEncoder.encode("Admin@123"))
                    .fullName("School Administrator")
                    .role(Role.ADMIN)
                    .status(UserStatus.ACTIVE)
                    .institution(institution)
                    .mustChangePassword(false)
                    .build();
            userRepository.save(admin);
            log.info("Seeded ADMIN account -> admin@eduverse.com");
        }

        // 5. Seed FACULTY & Faculty Profile
        User facultyUser;
        if (!userRepository.existsByEmail("faculty@eduverse.com")) {
            facultyUser = User.builder()
                    .email("faculty@eduverse.com")
                    .username("faculty")
                    .password(passwordEncoder.encode("Faculty@123"))
                    .fullName("Faculty Member")
                    .role(Role.FACULTY)
                    .status(UserStatus.ACTIVE)
                    .institution(institution)
                    .mustChangePassword(false)
                    .build();
            facultyUser = userRepository.save(facultyUser);
            log.info("Seeded FACULTY account -> faculty@eduverse.com");

            if (!facultyProfileRepository.existsByEmployeeId("EMP-001")) {
                FacultyProfile facultyProfile = FacultyProfile.builder()
                        .user(facultyUser)
                        .institution(institution)
                        .employeeId("EMP-001")
                        .build();
                facultyProfileRepository.save(facultyProfile);
            }
        }

        // 6. Seed STUDENT & Student Profile
        User studentUser;
        if (!userRepository.existsByEmail("student@eduverse.com")) {
            studentUser = User.builder()
                    .email("student@eduverse.com")
                    .username("student")
                    .password(passwordEncoder.encode("Student@123"))
                    .fullName("Student User")
                    .role(Role.STUDENT)
                    .status(UserStatus.ACTIVE)
                    .institution(institution)
                    .mustChangePassword(false)
                    .build();
            studentUser = userRepository.save(studentUser);
            log.info("Seeded STUDENT account -> student@eduverse.com");

            if (!studentProfileRepository.existsByAdmissionNumber("ADM-001")) {
                StudentProfile studentProfile = StudentProfile.builder()
                        .user(studentUser)
                        .institution(institution)
                        .admissionNumber("ADM-001")
                        .build();
                studentProfileRepository.save(studentProfile);
            }
        }

        // 7. Seed PARENT & Parent Profile
        if (!userRepository.existsByEmail("parent@eduverse.com")) {
            User parentUser = User.builder()
                    .email("parent@eduverse.com")
                    .username("parent")
                    .password(passwordEncoder.encode("Parent@123"))
                    .fullName("Parent User")
                    .role(Role.PARENT)
                    .status(UserStatus.ACTIVE)
                    .institution(institution)
                    .mustChangePassword(false)
                    .build();
            parentUser = userRepository.save(parentUser);
            log.info("Seeded PARENT account -> parent@eduverse.com");

            ParentProfile parentProfile = ParentProfile.builder()
                    .user(parentUser)
                    .institution(institution)
                    .build();
            parentProfileRepository.save(parentProfile);
        }

        // 8. Seed default Subscription Plans (Master Admin -> Subscription Plans module)
        seedSubscriptionPlan(subscriptionPlanRepository, "Free Trial", "FREE_TRIAL", 0, com.eduverse.entity.BillingCycle.MONTHLY,
                "1 Month (30 Days)", 100, 10, 5, List.of("Attendance", "Timetable", "Announcements"));
        seedSubscriptionPlan(subscriptionPlanRepository, "Basic Plan", "BASIC", 99, com.eduverse.entity.BillingCycle.MONTHLY,
                "1 Month (30 Days)", 500, 50, 25, List.of("Attendance", "Timetable", "Students", "Faculty", "Announcements"));
        seedSubscriptionPlan(subscriptionPlanRepository, "Standard Plan", "STANDARD", 249, com.eduverse.entity.BillingCycle.MONTHLY,
                "1 Month (30 Days)", 1500, 150, 100, List.of("Attendance", "Timetable", "Students", "Faculty", "Fees", "Announcements", "Exams"));
        seedSubscriptionPlan(subscriptionPlanRepository, "Premium Plan", "PREMIUM", 499, com.eduverse.entity.BillingCycle.MONTHLY,
                "1 Month (30 Days)", 5000, 500, 500, List.of("Attendance", "Timetable", "Students", "Faculty", "Fees", "Announcements", "Exams", "Homework", "Analytics"));
        seedSubscriptionPlan(subscriptionPlanRepository, "Enterprise Plan", "ENTERPRISE", 999, com.eduverse.entity.BillingCycle.ANNUAL,
                "1 Year (365 Days)", 20000, 2000, 2000, List.of("ALL_MODULES"));

        // 9. Backfill an InstitutionSubscription for any institution that doesn't have one yet
        com.eduverse.entity.SubscriptionPlan freeTrial = subscriptionPlanRepository.findByCode("FREE_TRIAL").orElse(null);
        for (Institution inst : institutionRepository.findAll()) {
            if (institutionSubscriptionRepository.findByInstitutionId(inst.getId()).isEmpty()) {
                institutionSubscriptionRepository.save(com.eduverse.entity.InstitutionSubscription.builder()
                        .institution(inst)
                        .plan(freeTrial)
                        .status(com.eduverse.entity.SubscriptionStatus.ACTIVE)
                        .startDate(LocalDate.now())
                        .nextBillingDate(LocalDate.now().plusDays(30))
                        .autoRenew(true)
                        .build());
            }
        }

        // 10. Seed default Feature Entitlements (Master Admin -> Feature Entitlements module)
        seedEntitlement(featureEntitlementRepository, "Core Attendance & Leave", "ATTENDANCE",
                List.of("FREE_TRIAL", "BASIC", "STANDARD", "PREMIUM", "ENTERPRISE"));
        seedEntitlement(featureEntitlementRepository, "Classes & Timetable Management", "TIMETABLE",
                List.of("FREE_TRIAL", "BASIC", "STANDARD", "PREMIUM", "ENTERPRISE"));
        seedEntitlement(featureEntitlementRepository, "Fees & Payment Gateway", "FEES",
                List.of("STANDARD", "PREMIUM", "ENTERPRISE"));
        seedEntitlement(featureEntitlementRepository, "Examinations & Grading", "EXAMS",
                List.of("STANDARD", "PREMIUM", "ENTERPRISE"));
        seedEntitlement(featureEntitlementRepository, "Homework & Assignments", "HOMEWORK",
                List.of("PREMIUM", "ENTERPRISE"));
        seedEntitlement(featureEntitlementRepository, "Advanced Performance Analytics", "ANALYTICS",
                List.of("PREMIUM", "ENTERPRISE"));

        // 11. Seed singleton System Configuration row (Master Admin -> System Config module)
        if (systemConfigRepository.count() == 0) {
            systemConfigRepository.save(com.eduverse.entity.SystemConfig.builder().build());
        }
    }

    private void seedSubscriptionPlan(com.eduverse.repository.SubscriptionPlanRepository repo, String name, String code,
                                       double price, com.eduverse.entity.BillingCycle cycle, String validity,
                                       int maxStudents, int maxFaculty, int storageGb, List<String> modules) {
        if (!repo.existsByCode(code)) {
            repo.save(com.eduverse.entity.SubscriptionPlan.builder()
                    .name(name).code(code).price(price).billingCycle(cycle).validityPeriod(validity)
                    .maxStudents(maxStudents).maxFaculty(maxFaculty).storageGb(storageGb)
                    .status(com.eduverse.entity.PlanStatus.ACTIVE).modules(new java.util.ArrayList<>(modules))
                    .build());
        }
    }

    private void seedEntitlement(com.eduverse.repository.FeatureEntitlementRepository repo, String moduleName, String code, List<String> plans) {
        if (!repo.existsByCode(code)) {
            repo.save(com.eduverse.entity.FeatureEntitlement.builder()
                    .moduleName(moduleName).code(code).enabledGlobal(true).plansAllowed(new java.util.ArrayList<>(plans))
                    .build());
        }
    }
}

