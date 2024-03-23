import app from "./src/app";
import { PORT } from "./src/config/config";

const port = PORT;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
