// /src/data/fakeDb.js

export const db = {
    resumes: {},
    jobs: {},
    users: {}
};

export function getAllResumeByUser(userId) {
    if (db.resumes.length === 0) {
        return null
    }
    return Object.values(db.resumes).filter(r => r.userId === userId);
}

export function getFirstResumeByUser(userId) {
    const resumes = Object.values(db.resumes).filter(r => r.userId === userId);
    if (resumes.length === 0) {
        return null
    }  else {
        return resumes[0];
    }
}