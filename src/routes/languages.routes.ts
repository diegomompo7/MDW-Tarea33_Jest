import express, { type NextFunction, type Response, type Request } from "express";
import { sqlQuery } from "../databases/sql-db";
import { type TechCompany } from "../models/sql/TechCompany";
export const languagesRouter = express.Router();

languagesRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await sqlQuery(`
        SELECT *
        FROM techcompnay
      `);
    const response = { data: rows };
    res.json(response);
  } catch (error) {
    next(error);
  }
});

languagesRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const rows = await sqlQuery(`
        SELECT *
        FROM TECHCOMPANY
        WHERE id=${id}
      `);

    if (rows?.[0]) {
      const response = { data: rows?.[0] };
      res.json(response);
    } else {
      res.status(404).json({ error: "Languange not found" });
    }
  } catch (error) {
    next(error);
  }
});

languagesRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, foundedYear, employeesNumber, headquarters, ceo } = req.body as TechCompany;
    const query: string = `
    INSERT INTO techcompany(NAME, FOUNDED_YEAR, EMPLOYEES_NUMBER, HEAD_QUARTERS, CEO) 
    VALUES (?,?,?,?,?)
    `;

    const params = [name, foundedYear, employeesNumber, headquarters, ceo];

    const result = await sqlQuery(query, params);

    if (result) {
      return res.status(201).json({});
    } else {
      return res.status(500).json({ error: "Language not created" });
    }
  } catch (error) {
    next(error);
  }
});
languagesRouter.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    await sqlQuery(`
        DELETE FROM techcompany
        WHERE id = ${id}
      `);

    res.json({ message: "Language deleted!" });
  } catch (error) {
    next(error);
  }
});

// CRUD: UPDATE
languagesRouter.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const { name, foundedYear, employeesNumber, headquarters, ceo } = req.body as TechCompany;

    const query = `
    UPDATE techcompany 
    SET NAME=?',FOUNDED_YEAR=?,EMPLOYEES_NUMBER=?,HEAD_QUARTERS=?,CEO=?
    WHERE id = ?
      `;
    const params = [name, foundedYear, employeesNumber, headquarters, ceo];
    await sqlQuery(query, params);

    const rows = await sqlQuery(`
        SELECT *
        FROM techcompany
        WHERE id=${id}
      `);

    if (rows?.[0]) {
      const response = { data: rows?.[0] };
      res.json(response);
    } else {
      res.status(404).json({ error: "Languange not found" });
    }
  } catch (error) {
    next(error);
  }
});
