import 'dotenv/config';
import mongoose from 'mongoose';
import { RecipeSchema } from '../src/recipe/recipe.schema';

async function migrate() {
    const dbUrl =
        (process.env.DB_URL ||
            process.env.DB_URL_LOCAL ||
            'mongodb://localhost:27017') +
        `${process.env.DB_NAME}?retryWrites=true&w=majority`;

    if (!dbUrl) {
        throw new Error('DB_URL is not defined');
    }

    await mongoose.connect(dbUrl);
    console.log('Connected to DB');

    const Recipe =
        mongoose.models.Recipe ?? mongoose.model('Recipe', RecipeSchema);

    // Remove 'recommendedList' from all documents
    const result = await Recipe.updateMany(
        { recommendedList: { $exists: true } },
        { $unset: { recommendedList: '' } },
    );

    console.log(`Migrated ${result.modifiedCount} recipes`);

    await mongoose.disconnect();
    process.exit(0);
}

migrate().catch((err) => {
    console.error(err);
    process.exit(1);
});
