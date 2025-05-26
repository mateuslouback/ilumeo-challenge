import express from "express";
import cors from "cors";
import conversionRateRouter from "./routes/conversionRate";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/conversion-rate", conversionRateRouter);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server on port ${port}`));
