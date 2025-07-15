// /src/utils/wrappers/withAiToken.js

export default function withAiToken(handler) {
    return function (req, res, next) {
        const token = req.headers["x-openai-token"] || process.env.OPENAI_API_KEY;
        if (!token) {
            res.status(400).json({ message: "AI token is absent" });
            return
        }

        req.foundAiToken = token;

        return handler(req, res, next);
    }
}