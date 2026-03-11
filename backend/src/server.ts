import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { env } from "./config/env";
import { connectDB } from "./config/database";
import routes from "./routes";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(compression());
app.use(morgan("dev"));

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

app.get("/", (_req, res) => {
	res.status(200).json({ ok: true, message: "Rnets Backend is running  " });
});

app.get("/health", (_req, res) => {
	res.status(200).json({ ok: true, env: env.NODE_ENV });
});

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

(async () => {
	await connectDB();
	app.listen(env.PORT, () => {
		console.log(`Server is running on port ${env.PORT}`);
	});
})();
