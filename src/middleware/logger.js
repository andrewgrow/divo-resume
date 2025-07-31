// ./src/middleware/logger.js

export function logger(req, res, next) {
    const now = new Date().toISOString();

    // copy body to safety object
    const safeBody = { ...req.body };
    if (safeBody.password) { safeBody.password = "*******"; } // mask password
    if (safeBody.login) { safeBody.login = maskLogin(safeBody.login); } // mask login

    console.log(`[${now}] [${req.requestId}] [Request] Method: ${req.method} Original Url: ${req.originalUrl}`);
    console.log(`[${now}] [${req.requestId}] [Request] Headers: ${JSON.stringify(req.headers)}, Body: ${JSON.stringify(safeBody)}`);

    const start = Date.now();

    res.on("finish", () => {
        const duration = Date.now() - start;
        console.log(`[${now}] [${req.requestId}] [Response] Status ${res.statusCode} sent in ${duration}ms`);
    });

    next();
}

function maskEmail(email) {
    const [name, domain] = email.split("@");
    const maskedName = name.length <= 2 ? "*" : name[0] + "*****" + name[name.length - 1];
    const maskedDomain = domain[0] + "*****" + domain[domain.length - 1];
    return maskedName + '@' + maskedDomain;
}

function maskPhone(phone) {
    if (typeof phone !== "string") return "";
    const digits = phone.replace(/[^\d+]/g, "");
    if (digits.length <= 4) return phone[0] + "***" + phone.slice(-1);

    // +1234567890
    if (digits[0] === "+") {
        return ("+" + digits.slice(1, 3) + "***" + digits.slice(-2));
    }

    // 1234567890
    return (digits.slice(0, 2) + "***" + digits.slice(-2));
}

function maskLogin(login) {
    if (!login) return "";
    if (login.includes("@")) {
        return maskEmail(login);
    }
    // for numbers
    return maskPhone(login);
}