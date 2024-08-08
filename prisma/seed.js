const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const fs = require('fs/promises');
const path = require('path');

const prisma = new PrismaClient();

const roles = [
  { name: "Admin" },
  { name: "Book Owner" },
  { name: "User" }
];

const categories = [
  { name: "Fiction" },
  { name: "Self-Help" },
  { name: "History" },
  { name: "Science" },
  { name: "Business" },
];

async function seedRoles() {
  const createdRoles = [];
  for (const role of roles) {
    const createdRole = await prisma.role.create({
      data: role,
    });
    createdRoles.push(createdRole);
  }
  return createdRoles;
}

async function seedCategories() {
  const createdCategories = [];
  for (const category of categories) {
    const createdCategory = await prisma.category.create({
      data: category,
    });
    createdCategories.push(createdCategory);
  }
  return createdCategories;
}

const seedUser = async (roleId) => {
  const hashedPassword = await bcrypt.hash("12345", 10);

  await prisma.user.create({
    data: {
      name: 'Admin Admin',
      email: "admin@gmail.com",
      location: 'Addis Ababa',
      phoneNumber: '0911111111',
      password: hashedPassword,
    },
  });
};

async function main() {
  try {

    const createdRoles = await seedRoles();
    await seedCategories();
    
    await seedUser(createdRoles[0].id);
    console.log("Seeded successfully.");
  } catch (error) {
    console.error("Error while seeding:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
