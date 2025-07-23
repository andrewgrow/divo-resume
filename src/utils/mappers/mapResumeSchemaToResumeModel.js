// /src/utils/mappers/mapResumeSchemaToResumeModel.js

export default function mapResumeSchemaToResumeModel(resumeAsModel, resumeAsSchema) {
    resumeAsModel.userName = resumeAsSchema.userName;
    resumeAsModel.userHeadline = resumeAsSchema.userHeadline;
    resumeAsModel.userLocation = resumeAsSchema.userLocation;
    resumeAsModel.userSummary = resumeAsSchema.userSummary;
    resumeAsModel.userSkills = resumeAsSchema.userSkills;
    resumeAsModel.userExperience = resumeAsSchema.userExperience;
    resumeAsModel.userEducation = resumeAsSchema.userEducation;
    resumeAsModel.userLanguages = resumeAsSchema.userLanguages;
    resumeAsModel.userSoftSkills = resumeAsSchema.userSoftSkills;
    resumeAsModel.userContacts = resumeAsSchema.userContacts;
    resumeAsModel.openaiResponseId = resumeAsSchema.openaiResponseId;
    return resumeAsModel;
}