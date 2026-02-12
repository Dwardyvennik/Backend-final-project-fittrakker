const { MongoClient } = require("mongodb");
require("dotenv").config();

const url = process.env.MONGO_URI;
const client = new MongoClient(url);

const workouts = [
  { title: "Morning Run", type: "cardio", duration: 30, calories: 300, difficulty: "Medium", notes: "Felt good", date: "2023-10-01" },
  { title: "Evening Yoga", type: "yoga", duration: 45, calories: 150, difficulty: "Easy", notes: "Relaxing", date: "2023-10-02" },
  { title: "Heavy Lifting", type: "strength", duration: 60, calories: 500, difficulty: "Hard", notes: "Chest day", date: "2023-10-03" },
  { title: "HIIT Blast", type: "cardio", duration: 20, calories: 250, difficulty: "Hard", notes: "Intense", date: "2023-10-04" },
  { title: "Pilates", type: "yoga", duration: 50, calories: 200, difficulty: "Medium", notes: "Core work", date: "2023-10-05" },
  { title: "Cycling", type: "cardio", duration: 45, calories: 400, difficulty: "Medium", notes: "Indoor bike", date: "2023-10-06" },
  { title: "Deadlifts", type: "strength", duration: 40, calories: 350, difficulty: "Hard", notes: "Back focus", date: "2023-10-07" },
  { title: "Meditation", type: "yoga", duration: 15, calories: 0, difficulty: "Easy", notes: "Mindfulness", date: "2023-10-08" },
  { title: "Swimming", type: "cardio", duration: 60, calories: 600, difficulty: "Hard", notes: "Laps", date: "2023-10-09" },
  { title: "Jump Rope", type: "cardio", duration: 15, calories: 200, difficulty: "Medium", notes: "Warmup", date: "2023-10-10" },
  { title: "Full Body", type: "strength", duration: 55, calories: 450, difficulty: "Hard", notes: "Dumbbells", date: "2023-10-11" },
  { title: "Stretching", type: "yoga", duration: 20, calories: 50, difficulty: "Easy", notes: "Recovery", date: "2023-10-12" },
  { title: "Zumba", type: "cardio", duration: 50, calories: 500, difficulty: "Medium", notes: "Fun", date: "2023-10-13" },
  { title: "Squats", type: "strength", duration: 35, calories: 300, difficulty: "Medium", notes: "Leg day", date: "2023-10-14" },
  { title: "Power Yoga", type: "yoga", duration: 60, calories: 300, difficulty: "Hard", notes: "Sweaty", date: "2023-10-15" },
  { title: "Hiking", type: "cardio", duration: 120, calories: 800, difficulty: "Medium", notes: "Nature trail", date: "2023-10-16" },
  { title: "Pushups", type: "strength", duration: 10, calories: 100, difficulty: "Easy", notes: "Quick set", date: "2023-10-17" },
  { title: "Rowing", type: "cardio", duration: 30, calories: 350, difficulty: "Hard", notes: "Ergometer", date: "2023-10-18" },
  { title: "Tai Chi", type: "yoga", duration: 40, calories: 100, difficulty: "Easy", notes: "Balance", date: "2023-10-19" },
  { title: "Crossfit", type: "strength", duration: 45, calories: 550, difficulty: "Hard", notes: "WOD", date: "2023-10-20" }
];

async function seed() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db();
    
    // Clear existing
    await db.collection("workouts").deleteMany({});
    console.log("Cleared workouts collection");

    // Insert new
    await db.collection("workouts").insertMany(workouts);
    console.log(`Inserted ${workouts.length} workouts`);

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

seed();
