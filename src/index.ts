import { bookRouter } from "./routes/book.routes";
import { authorRouter } from "./routes/author.routes";
import { languagesRouter } from "./routes/languages.routes";
import { studentRouter } from "./routes/student.routes";
import { courseRouter } from "./routes/course.routes";

import { type Request, type Response, type NextFunction, type ErrorRequestHandler } from "express";

import express from "express";
import cors from "cors";
import { mongoConnect } from "./databases/mongo-db";
import swaggerJSDoc from "swagger-jsdoc";
import { swaggerOptions } from "./swagger-options";
import swaggerUiExpress from "swagger-ui-express";
// import { sqlConnect } from "./databases/sql-db";
// import { AppDataSource } from "./databases/typeorm-datasource";

// Conexión a la BBDD
// const mongoDatabase = await mongoConnect();
// const sqlDatabase = await sqlConnect();
// const datasource = await AppDataSource.initialize();

// Configuración del server
const PORT = 3000;
export const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

// Swagger
const specs = swaggerJSDoc(swaggerOptions);
console.log(specs);
app.use("/api-docs", swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

app.use(async (req: Request, res: Response, next: NextFunction) => {
  await mongoConnect();
  next();
});

// Rutas
const router = express.Router();
router.get("/", (req: Request, res: Response) => {
  /* res.send(`
    <h3>Esta es la RAIZ de nuestra API.</h3>
    <p>Estamos usando la BBDD Mongo de ${mongoDatabase?.connection?.name as string}</p>
    <p>Estamos usando la BBDD SQL ${sqlDatabase?.config?.database as string} del host ${sqlDatabase?.config?.host as string}</p>
    <p>Estamos usando TypeORM con la BBDD: ${datasource?.options.database as string}</p>
    `); */
  res.send(`
    <h3>Esta es la RAIZ de nuestra API.</h3>
    `);
});

router.get("*", (req: Request, res: Response) => {
  res.status(404).send("Lo sentimos :( No hemos encontrado la página solicitada.");
});

// Middlewares de aplicación, por ejemplo middleware de logs en consola
app.use((req: Request, res: Response, next: NextFunction) => {
  const date = new Date();
  console.log(`Petición de tipo ${req.method} a la url ${req.originalUrl} el ${date.toString()}`);
  next();
});

// Usamos las rutas
app.use("/author", authorRouter);
app.use("/book", bookRouter);
app.use("/public", express.static("public"));
app.use("/", router);
app.use("/languages", languagesRouter);
app.use("/students", studentRouter);
app.use("/courses", courseRouter);

// Middleware de gestión de errores
app.use((err: ErrorRequestHandler, req: Request, res: Response, next: NextFunction) => {
  console.log("*** INICIO DE ERROR ***");
  console.log(`PETICIÓN FALLIDA: ${req.method} a la url ${req.originalUrl}`);
  console.log(err);
  console.log("*** FIN DE ERROR ***");

  // Truco para quitar el tipo a una variable
  const errorAsAny: any = err as unknown as any;

  if (err?.name === "ValidationError") {
    res.status(400).json(err);
  } else if (errorAsAny.errmsg?.indexOf("duplicate key") !== -1) {
    res.status(400).json({ error: errorAsAny.errmsg });
  } else {
    res.status(500).json(err);
  }
});

export const server = app.listen(PORT, () => {
  console.log(`Server levantado en el puerto ${PORT}`);
});
