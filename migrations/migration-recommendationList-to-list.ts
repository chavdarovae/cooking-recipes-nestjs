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

    const Recipe = (await import('mongoose')).model('Recipe', RecipeSchema);

    const recipes = await Recipe.find({
        recommendList: { $exists: true, $not: { $type: 'array' } },
    });

    for (const recipe of recipes) {
        recipe.recommendList = recipe.recommendList
            ? [...recipe.recommendList]
            : [];
        await recipe.save();
    }

    console.log(`Migrated ${recipes.length} recipes`);
    process.exit(0);
}

migrate();
