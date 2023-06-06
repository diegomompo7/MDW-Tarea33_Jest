import { AppDataSource } from "../databases/typeorm-datasource";
import { Student } from "../models/typeorm/Student";
import { Course } from "../models/typeorm/Course";

export const courseAndStudentSeed = async (): Promise<void> => {
  // Nos conectamos a la BBDD
  const dataSource = await AppDataSource.initialize();
  console.log(`Tenemos conexión!! Conectados a ${dataSource?.options?.database as string}`);

  // Eliminamos los datos existentes
  await AppDataSource.manager.delete(Student, {});
  await AppDataSource.manager.delete(Course, {});
  console.log("Eliminados jugadores y equipos");

  // Creamos dos estudiantes
  const student1 = {
    firstName: "Juan",
    lastName: "Perez",
  };

  const student2 = {
    firstName: "Ana",
    lastName: "Lopez",
  };
  // Creamos las entidades
  const student1Entity = AppDataSource.manager.create(Student, student1);
  const student2Entity = AppDataSource.manager.create(Student, student2);

  // Las guardamos en base de datos
  // await AppDataSource.manager.save(student1Entity);
  // await AppDataSource.manager.save(student2Entity);

  // Creamos equipo
  const course = {
    name: "Matemáticas",
    department: "Números",
    students: [student1Entity, student2Entity],
  };

  // Creamos entidad equipo
  const courseEntity = AppDataSource.manager.create(Course, course);

  // Guardamos el equipo en BBDD
  await AppDataSource.manager.save(courseEntity);

  console.log("Creados los dos jugadores y equipo");

  // Cerramos la conexión
  await AppDataSource.destroy();
  console.log("Cerrada conexión SQL");
};

void courseAndStudentSeed();
