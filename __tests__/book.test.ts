/* eslint-disable prefer-const */
import { describe } from "node:test";
import { mongoConnect } from "../src/databases/mongo-db";
import mongoose from "mongoose";
import { app, server } from "../src/index";
import { type IBook } from "../src/models/mongo/Book";
import request from "supertest";

describe("Book controller", () => {
  const bookMock: IBook = {
    title: "aaa",
    pages: 863,
    publisher: { name: "aaa", country: "SPAIN" },
  }

  let token: string;
  let bookId: string;

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

  it("POST /book - this should create an book", async() => {
    const response = await request(app)
      .post("/book")
      .send(bookMock)
      .set("Accept", "application/json")
      .expect(201);

    expect(response.body).toHaveProperty("_id");
    expect(response.body.title).toBe(bookMock.title);

    bookId = response.body._id;
  })

  it("GET /book - returns a list with the books", async () => {
    const response = await request(app)
      .get("/book")
      .expect(200);

    expect(response.body.data).toBeDefined();
    expect(response.body.data.length).toBe(10);
    expect(response.body.totalItems).toBe(11);
    expect(response.body.totalPages).toBe(2);
    expect(response.body.currentPage).toBe(1);

    console.log(response.body)
  });
  it("PUT /book/id - Modify book when token is sent", async () => {
    const updatedData = {
      title: "Edu",
    };
    console.log(bookId)

    const response = await request(app)
      .put(`/book/${bookId}`)
      .set("Bookization", `Bearer ${token}`)
      .send(updatedData)
      .expect(200);

    expect(response.body.title).toBe(updatedData.title);
    expect(response.body._id).toBe(bookId);
  });

  it("DELETE /book/id -  Deletes book when token is OK", async () => {
    const response = await request(server)
      .delete(`/book/${bookId}`)
      .set("Bookization", `Bearer ${token}`)
      .expect(200);

    expect(response.body._id).toBe(bookId);
  });
});
