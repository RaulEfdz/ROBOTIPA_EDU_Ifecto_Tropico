// const { PrismaClient } = require("@prisma/client");

// const database = new PrismaClient();

// async function main() {
// 	try {
// 		await database.category.createMany({
// 			data: [
// 				{ name: "Anatomía" },
// 				{ name: "Fisiología" },
// 				{ name: "Bioquímica" },
// 				{ name: "Farmacología" },
// 				{ name: "Patología" },
// 				{ name: "Microbiología" },
// 				{ name: "Medicina Clínica" },
// 				{ name: "Guía de la Plataforma" }
// 			]
// 		});

// 	} catch (error) {
// 	} finally {
// 		await database.$disconnect();
// 	}
// }

// main();