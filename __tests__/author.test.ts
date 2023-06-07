/* eslint-disable prefer-const */
import { describe } from "node:test";
import { mongoConnect } from "../src/databases/mongo-db";
import mongoose from "mongoose";
import { app, server } from "../src/index";
import { type IAuthor } from "../src/models/mongo/Author";
import request from "supertest";

describe("Author controller", () => {
  const authorMock: IAuthor = {
    name: "Gabriel García Márquez",
    country: "SPAIN",
    email: "gabriel.garcia@gmail.com",
    password: "CienAnosDeSoledad123"
  };

  let token: string;
  let authorId: string;

  beforeAll(async () => {
    await mongoConnect();
  });

  afterAll(async () => {
    await mongoose.connection.close();
    server.close();
  });

  it("Simple test to check jest in working", () => {
    expect(true).toBeTruthy();
  });

  it("Simple test to check jest in working", () => {
    const miTexto = "Hola chicos";
    expect(miTexto.length).toBe(11);
  });

  it("POST /author - this should create an author", async() => {
    const response = await request(app)
      .post("/author")
      .send(authorMock)
      .set("Accept", "application/json")
      .expect(201);

    expect(response.body).toHaveProperty("_id");
    expect(response.body.email).toBe(authorMock.email);

    authorId = response.body._id;
  })
  it("POST /author/login - with valid credentials returns 200 and token", async () => {
    const credentials = {
      email: authorMock.email,
      password: authorMock.password
    };

    const response = await request(app)
      .post("/author/login")
      .send(credentials)
      .expect(200);

    expect(response.body).toHaveProperty("token");
    token = response.body.token;
    console.log(token);
  });

  it("POST /author/login - with worng credentials returns 401 and no token", async () => {
    const credentials = {
      email: authorMock.email,
      password: "BAD PASSWORD"
    };

    const response = await request(app)
      .post("/author/login")
      .send(credentials)
      .expect(401);

    expect(response.body.token).toBeUndefined();
  });
  it("GET /author - returns a list with the authors", async () => {
    const response = await request(app)
      .get("/author")
      .expect(200);

    expect(response.body.data).toBeDefined();
    expect(response.body.data.length).toBe(10);
    expect(response.body.totalItems).toBe(19);
    expect(response.body.totalPages).toBe(2);
    expect(response.body.currentPage).toBe(1);

    console.log(response.body)
  });
  it("PUT /author/id - Modify author when token is sent", async () => {
    const updatedData = {
      name: "Edu",
    };
    console.log(authorId)

    const response = await request(app)
      .put(`/author/${authorId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatedData)
      .expect(200);

    expect(response.body.name).toBe(updatedData.name);
    expect(response.body.email).toBe(authorMock.email);
    expect(response.body._id).toBe(authorId);
  });

  it("PUT /author/id - Should not modify author when no token present", async () => {
    const updatedData = {
      lastName: "Cuadrado"
    };

    const response = await request(server)
      .put(`/author/${authorId}`)
      .send(updatedData)
      .expect(401);

    expect(response.body.error).toBe("No tienes autorización para realizar esta operación");
  });
  it("DELETE /author/id -  Do not delete author whe no token is present", async () => {
    const response = await request(server)
      .delete(`/author/${authorId}`)
      .expect(401);

    expect(response.body.error).toBe("No tienes autorización para realizar esta operación");
  });

  it("DELETE /author/id -  Deletes author when token is OK", async () => {
    const response = await request(server)
      .delete(`/author/${authorId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body._id).toBe(authorId);
  });
});
