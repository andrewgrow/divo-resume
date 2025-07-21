// /tests/src/materials/validResume/js

export const validResume = {
    isMainResume: false,
    pdfFilePath: null,

    userName: {
        printTitle: "Name",
        value: "John Test User"
    },
    userHeadline: {
        printTitle: "Headline",
        value: "Software Quality Assurance Engineer"
    },
    userLocation: {
        printTitle: "Location",
        value: "London"
    },
    userSummary: {
        printTitle: "Summary",
        value: "Experienced software QA"
    },
    userSkills: {
        printTitle: "Skills",
        value: [
            {
                printTitle: "Programming Languages",
                items: ["JS"]
            },
            {
                printTitle: "Frameworks",
                items: ["Express"]
            }
        ]
    },
    userExperience: {
        printTitle: "Work Experience",
        value: [
            {
                printTitle: "QA Engineer",
                company: "TestCorp",
                dateStart: "Jan 2023",
                dateEnd: "Jan 2024",
                location: "Moscow",
                achievements: ["Automated tests"],
                projects: [
                    {
                        printTitle: "Test Automation Project",
                        description: "Automated regression tests for web app.",
                        skillsOrTools: [
                            { type: "technology", name: "Mocha" },
                            { type: "tool", name: "Jest" }
                        ]
                    }
                ]
            }
        ]
    },
    userEducation: {
        printTitle: "Education",
        value: [
            {
                printTitle: "Bachelor",
                institution: "Test University",
                degree: "Bachelor",
                specialty: "IT",
                dateStart: "Sep 2018",
                dateEnd: "Jun 2022"
            }
        ]
    },
    userLanguages: {
        printTitle: "Languages",
        value: [
            {
                language: "English",
                level: "Native"
            }
        ]
    },
    userSoftSkills: {
        printTitle: "Soft Skills",
        value: ["Teamwork"]
    },
    userContacts: {
        printTitle: "Contacts",
        value: [
            {
                type: "user_email",
                printTitle: "Email",
                value: "john@example.com"
            },
            {
                type: "user_linkedin",
                printTitle: "LinkedIn",
                value: "john-profile"
            }
        ]
    }
};