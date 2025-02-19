const userQueries = require('./queries/usersQueries');

async function createDemoUser() {
    const demoUsername = process.env.DEMO_USER_USERNAME;
    const demoEmail = process.env.DEMO_USER_EMAIL;
    const demoPassword = process.env.DEMO_USER_PASSWORD;

    try {
        console.log("Adding demo user...");
        const demoUser = await userQueries.existUser("username", demoUsername);
        if (!demoUser) {
            await userQueries.addUser(demoEmail, demoUsername, demoPassword);
        }
        console.log("Demo user added successfully");
    } catch (error) {
        console.log("Error adding demo user");
        console.log(error);
    }
}

async function createRandomUser() {
    const randomUsername = Math.random().toString(36).substring(7);
    const randomEmail = `${randomUsername
        }@demo.com`;
    const randomPassword = "password";

    try {
        console.log("Adding random user...");
        const randomUser = await userQueries.existUser("username", randomUsername);
        if (!randomUser) {
            await userQueries.addUser(randomEmail, randomUsername, randomPassword);
        }
        console.log("Random user added successfully");
    } catch (error) {
        console.log("Error adding random user");
        console.log(error);
    }
}

const createMultipleUsers = async () => {
    await Promise.all(
        Array.from({ length: 20 }).map(() => createRandomUser())
    );
};

const deleteAllUsers = async () => {
    try {
        console.log("Deleting all users...");
        await userQueries.deleteAllUsers();
        console.log("All users deleted successfully");
    } catch (error) {
        console.log("Error deleting users");
        console.log(error);
    }
};  

const seedDatabase = async () => {  
    try {
        await deleteAllUsers();
        console.log("Seeding database...");
        console.log("Creating demo user...");
        await createDemoUser();
        console.log("Demo user created successfully");
        console.log("Creating random users...");
        await createMultipleUsers();
        console.log("Random users created successfully");
        console.log("Database seeding complete");
    } catch (error) {
        console.log("Error seeding database");
        console.log(error);
    }
}

seedDatabase();