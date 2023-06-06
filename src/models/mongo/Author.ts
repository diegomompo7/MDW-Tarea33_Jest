/**
 * @swagger
 * components:
 *   schemas:
 *     Author:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 25
 *           description: The name of the author.
 *         country:
 *           type: string
 *           enum:
 *             - SPAIN
 *             - ITALY
 *             - USA
 *             - GERMANY
 *             - JAPAN
 *             - FRANCE
 *             - ENGLAND
 *             - COLOMBIA
 *             - RUSSIA
 *             - ARGENTINA
 *             - CZECHOSLOVAKIA
 *             - NIGERIA
 *           description: The country of the author.
 *         email:
 *           type: string
 *           format: email
 *           description: The email address of the author.
 *         password:
 *           type: string
 *           minLength: 8
 *           description: The password of the author.
 *         profileImage:
 *           type: string
 *           description: The URL of the author's profile image.
 *       required:
 *         - email
 *         - password
 *         - name
 *         - country
 */

import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
const Schema = mongoose.Schema;

const allowedCountries = ["SPAIN", "ITALY", "USA", "GERMANY", "JAPAN", "FRANCE", "ENGLAND", "COLOMBIA", "RUSSIA", "ARGENTINA", "CZECHOSLOVAKIA", "NIGERIA"];

export interface IAuthor {
  name: string;
  country: string;
  email: string;
  password: string;
  profileImage?: string;
}

// Creamos el schema del author
const authorSchema = new Schema<IAuthor>(
  {
    name: {
      type: String,
      required: true,
      minLength: [3, "Dame algo más de detalle, al menos 3 letras para el nombre."],
      maxLength: [25, "Tampoco te pases... intenta resumir un poco el nombre, máximo 25 letras."],
      trim: true,
    },
    country: {
      type: String,
      required: true,
      enum: allowedCountries,
      uppercase: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      validate: {
        validator: (text: string) => validator.isEmail(text),
        message: "Email incorrecto",
      },
    },
    password: {
      type: String,
      trim: true,
      required: true,
      minLength: [8, "La contraseña debe tener al menos 8 caracteres"],
      select: false,
    },
    profileImage: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

authorSchema.pre("save", async function (next) {
  try {
    // Si la contraseña ya estaba encriptada, no la encriptamos de nuevo
    if (this.isModified("password")) {
      const saltRounds = 10;
      const passwordEncrypted = await bcrypt.hash(this.password, saltRounds);
      this.password = passwordEncrypted;
    }

    next();
  } catch (error: any) {
    next(error);
  }
});

export const Author = mongoose.model<IAuthor>("Author", authorSchema);
